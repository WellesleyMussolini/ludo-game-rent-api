import {
  BadRequestException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { schemaFields } from 'src/boardgames/constants/boardgame';

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
export function handleErrors({ error, message }: HandleErrors) {
  const notFound = error.status === 404;
  const isIdInvalid = error.kind === 'ObjectId' && error.path === '_id';

  const isStatusInvalid = error.errors?.status?.kind === 'enum';

  const isDatabaseOff = error.status === 500 || error.status === 503;

  if (notFound) {
    throw new NotFoundException(message);
  }

  if (isIdInvalid) {
    throw new BadRequestException('Invalid ID format');
  }

  for (const field of schemaFields) {
    const isFieldEmpty = error.errors?.[field]?.kind === 'required';
    if (isFieldEmpty) {
      throw new BadRequestException(`The field '${field}' can't be empty`);
    }
  }

  if (isStatusInvalid) {
    throw new BadRequestException(
      "The 'status' field must be one of the following values: 'Disponível', 'Reservado', 'Quarentena', 'Indisponível', 'Manutenção', 'Alugado'",
    );
  }

  if (isDatabaseOff) {
    throw new ServiceUnavailableException(
      'The database is offline or overloaded.',
    );
  }

  throw error;
}
