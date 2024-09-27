import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { handleErrors } from './handle-error';

describe(`handleErrors is a utility function that checks the status of an error and throws a custom exception message based on that status. 
  It handles errors like 404 (Not Found), Invalid ID, Internal Server Error, and Validation Errors. 
  The function is designed to be reusable across multiple modules, allowing you to set specific messages depending on the HTTP method 
  being used in each module. These error messages are then sent to the API to alert the user about what mistake they made.`, () => {
  it('Should throw a NotFoundException when it gets an error with a 404 status.', () => {
    expect(() =>
      handleErrors({
        error: {
          kind: 'ObjectId',
          path: '_id',
          value: 'nonExistentId',
          message: 'The provided Id was not found in the database.',
          name: 'Not Found Error',
          status: 404,
          messageFormat: undefined,
          options: {},
          response: {
            message: 'The provided ID was not found.',
            error: 'Not Found',
            statusCode: 404,
          },
          stringValue: 'non Existent Id',
        },
      }),
    ).toThrow(NotFoundException);
  });

  it('Should throw BadRequestException when the provided ID format is invalid', () => {
    expect(() =>
      handleErrors({
        error: {
          kind: 'ObjectId',
          path: '_id',
          value: 'Invalid Id',
          message: 'The provided Id format is invalid.',
          name: 'CastError',
          status: 400,
          messageFormat: undefined,
          options: {},
          response: {
            message: 'The ID format you provided is not valid.',
            error: 'Bad Request',
            statusCode: 400,
          },
          stringValue: 'Invalid Id',
        },
      }),
    ).toThrow(BadRequestException);
  });

  it('Should throw InternalServerErrorException when an unexpected server/database error occurs with status 500', () => {
    expect(() =>
      handleErrors({
        error: {
          kind: 'InternalError',
          path: 'database.operation',
          value: 'Internal Server Error',
          message:
            'An unexpected server error occurred during database operation.',
          name: 'InternalServerError',
          status: 500,
          messageFormat: undefined,
          options: {},
          response: {
            message: 'An unexpected error occurred on the server.',
            error: 'Internal Server Error',
            statusCode: 500,
          },
          stringValue: 'InternalServerError',
        },
      }),
    ).toThrow(InternalServerErrorException);
  });

  it('Should throw ServiceUnavailableException when the database is overloaded or unavailable with status 503', () => {
    expect(() =>
      handleErrors({
        error: {
          kind: 'ServiceUnavailable',
          path: 'database.connection',
          value: 'Service Unavailable Error',
          message:
            'The database service is currently overloaded or unavailable, please try again later.',
          name: 'ServiceUnavailableError',
          status: 503,
          messageFormat: undefined,
          options: {},
          response: {
            message:
              'The database service is currently overloaded or unavailable/offline. Please try again later.',
            error: 'Service Unavailable Error',
            statusCode: 503,
          },
          stringValue: 'ServiceUnavailableError',
        },
      }),
    ).toThrow(ServiceUnavailableException);
  });

  it('Should throw BadRequestException when a validation error occurs', () => {
    expect(() =>
      handleErrors({
        error: {
          kind: 'ValidationError',
          path: 'schemaField',
          value: 'Invalid Format',
          message: 'The provided field format is invalid',
          name: 'ValidationError',
          status: 400,
          messageFormat: undefined,
          options: {},
          response: {
            message: 'The provided field format is invalid',
            error: 'Bad Request',
            statusCode: 400,
          },
          stringValue: 'InvalidFormat',
        },
      }),
    ).toThrow(BadRequestException);
  });
});
