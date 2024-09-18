import { NotFoundException } from '@nestjs/common';
import { handleErrors } from './handle-error';

describe('handleErrors', () => {
  it('Should return error if status === 404', () => {
    expect(() =>
      handleErrors({
        error: {
          kind: 'ObjectId',
          path: '_id',
          value: 'invalidId',
          message:
            'Cast to ObjectId failed for value "invalidId" at path "_id"',
          name: 'CastError',
          status: 404,
          messageFormat: undefined,
          options: {},
          response: {
            message: 'BoardGame id not found',
            error: 'CastError',
            statusCode: 404,
          },
          stringValue: 'invalidId',
        },
      }),
    ).toThrow(NotFoundException);
  });

  // TODO: Add more tests Invalid ID
});
