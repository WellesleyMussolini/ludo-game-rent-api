import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

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
  id?: string;
};

export function handleErrors({ error, message, id }: HandleErrors) {
  const isIdInvalid = error.kind === 'ObjectId' && error.path === '_id';
  const isObjectIdValid = !Types.ObjectId.isValid(id);

  if (error.status === 404) {
    throw new NotFoundException(message);
  }

  if (isIdInvalid || isObjectIdValid) {
    throw new BadRequestException('Invalid ID format');
  }

  throw error;
}
