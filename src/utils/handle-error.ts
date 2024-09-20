import {
  BadRequestException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  boardgameSchemaFields,
  status,
} from 'src/boardgames/constants/boardgame';
import { roles, userSchemaFields } from 'src/users/constants/user';

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

const fieldErrors = (schemaFields: string[], error: Error | any) => {
  for (const field of schemaFields) {
    if (error.errors?.[field]?.kind === 'required') {
      throw new BadRequestException(`The field '${field}' can't be empty`);
    }
  }
};

const enumValidation = (
  error: Error | any,
  field: string,
  validValues: string[],
) => {
  if (error.errors?.[field]?.kind === 'enum') {
    throw new BadRequestException(
      `The '${field}' field must be one of the following values: ${validValues.join(', ')}`,
    );
  }
};

export function handleErrors({ error, message }: HandleErrors) {
  const notFound = error.status === 404;
  const isIdInvalid = error.kind === 'ObjectId' && error.path === '_id';
  const isDatabaseOff = error.status === 500 || error.status === 503;

  if (notFound) {
    throw new NotFoundException(message);
  }

  if (isIdInvalid) {
    throw new BadRequestException('Invalid ID format');
  }

  fieldErrors(boardgameSchemaFields, error);
  fieldErrors(userSchemaFields, error);

  enumValidation(error, 'status', status);
  enumValidation(error, 'role', roles);

  if (isDatabaseOff) {
    throw new ServiceUnavailableException(
      'The database is offline or overloaded.',
    );
  }

  throw error;
}
