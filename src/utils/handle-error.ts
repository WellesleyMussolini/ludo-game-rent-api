import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';

type CommonError = {
  response: {
    message: string;
    error: string;
    statusCode: number;
  };
  status: number;
  options: {};
  message: string;
  name: string;
  errors: any;
};

type MoongoseError = {
  stringValue: string;
  messageFormat: unknown | undefined;
  kind: string;
  value: string;
  path: string;
  errors: any;
};

type Error = CommonError & MoongoseError;

type HandleErrors = {
  error: Error | any;
  message?: string;
};

function handleBadRequestError(
  isInvalidId: boolean,
  isBadFormatObject: boolean,
  error: Error & { errors?: Record<string, { message: string }> },
) {
  if (isInvalidId) {
    throw new BadRequestException('Invalid ID format');
  }

  if (isBadFormatObject) {
    const messages = error.errors
      ? Object.values(error.errors)
          .map((err: any) => err.message)
          .join(', ')
      : error.message;
    throw new BadRequestException(messages);
  }

  // If status is 400 and no specific validation error caught, throw the error
  if (error.status === 400) {
    throw new BadRequestException(error.message);
  }
}

export function handleErrors({ error, message }: HandleErrors) {
  const notFound = error.status === 404;
  const isInternalServerError = error.status === 500;
  const isServiceUnavailable = error.status === 503;

  const isIdInvalid = error.kind === 'ObjectId' && error.path === '_id';
  const isValidationError = error.name === 'ValidationError';
  const isBadRequestError =
    isValidationError || isIdInvalid || error.status === 400;

  if (notFound) {
    throw new NotFoundException(message);
  }

  // Bad Request Error: Handle 400 errors
  if (isBadRequestError)
    return handleBadRequestError(isIdInvalid, isValidationError, error);

  if (isInternalServerError) {
    throw new InternalServerErrorException(
      'An unexpected server error occurred.',
    );
  }

  if (isServiceUnavailable) {
    throw new ServiceUnavailableException(
      'The server is temporarily unavailable or overloaded.',
    );
  }

  throw error;
}
