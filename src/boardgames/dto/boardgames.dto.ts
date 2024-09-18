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
  name: string;
  image: string;
  status: StatusOptions;
  price: string;
  ageToPlay: string;
  description: string;
  playTime: string;
  minimumPlayersToPlay: string;
  maximumPlayersToPlay: string;
}
