import { IsIn, IsNotEmpty, IsString } from 'class-validator';

const status = [
  'Disponível',
  'Reservado',
  'Quarentena',
  'Indisponível',
  'Manutenção',
  'Alugado',
];

type StatusOptions = (typeof status)[number];

export class CreateBoardGameDto {
  @IsNotEmpty({ message: 'The "name" field cannot be empty.' })
  @IsString({ message: 'The "name" field must be a string.' })
  name: string;

  @IsNotEmpty({ message: 'The "image" field cannot be empty.' })
  @IsString({ message: 'The "image" field must be a string.' })
  image: string;

  @IsNotEmpty({ message: 'The "status" field cannot be empty.' })
  @IsString({ message: 'The "status" field must be a string.' })
  @IsIn(status, {
    message: `Status must be one of the following values: ${status.join(', ')}`,
  })
  status: StatusOptions;

  @IsNotEmpty({ message: 'The "price" field cannot be empty.' })
  @IsString({ message: 'The "price" field must be a string.' })
  price: string;

  @IsNotEmpty({ message: 'The "ageToPlay" field cannot be empty.' })
  @IsString({ message: 'The "ageToPlay" field must be a string.' })
  ageToPlay: string;

  @IsNotEmpty({ message: 'The "description" field cannot be empty.' })
  @IsString({ message: 'The "description" field must be a string.' })
  description: string;

  @IsNotEmpty({ message: 'The "playTime" field cannot be empty.' })
  @IsString({ message: 'The "playTime" field must be a string.' })
  playTime: string;

  @IsNotEmpty({ message: 'The "minimumPlayersToPlay" field cannot be empty.' })
  @IsString({ message: 'The "minimumPlayersToPlay" field must be a string.' })
  minimumPlayersToPlay: string;

  @IsNotEmpty({ message: 'The "maximumPlayersToPlay" field cannot be empty.' })
  @IsString({ message: 'The "maximumPlayersToPlay" field must be a string.' })
  maximumPlayersToPlay: string;
}
