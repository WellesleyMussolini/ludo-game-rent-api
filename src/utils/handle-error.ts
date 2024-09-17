import { BadRequestException, NotFoundException } from '@nestjs/common';

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
};

type MoongoseError = {
  stringValue: string;
  messageFormat: unknown | undefined;
  kind: string;
  value: string;
  path: string;
};

type Error = CommonError & MoongoseError;

type HandleErrors = {
  error: Error;
  message?: string;
};

export function handleErrors({ error, message }: HandleErrors) {
  const isIdInvalid = error.kind === 'ObjectId' && error.path === '_id';

  if (error.status === 404) {
    throw new NotFoundException(message);
  }

  if (isIdInvalid) {
    throw new BadRequestException('Invalid ID format');
  }

  throw error;
}
