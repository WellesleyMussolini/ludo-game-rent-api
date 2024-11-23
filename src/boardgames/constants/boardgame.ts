import { Status } from 'src/types/status.types';

export const status = [
  Status.AVAILABLE,
  Status.FIXED_COPY,
  Status.MAINTENANCE,
  Status.QUARANTINE,
  Status.RENT,
  Status.RESERVED,
  Status.UNAVAILABLE,
];

export const boardgameSchemaFields = [
  'name',
  'image',
  'status',
  'price',
  'ageToPlay',
  'description',
  'playTime',
  'minimumPlayersToPlay',
  'maximumPlayersToPlay',
];
