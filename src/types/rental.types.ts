import { BoardGame } from 'src/boardgames/schemas/boardgames.schema';

export enum RentalStatus {
  ACTIVE = 'active',
  OVERDUE = 'overdue',
  RETURNED = 'returned',
}

export type RentalHistory = {
  boardgame: BoardGame;
  rentalStartDate?: Date;
  rentalEndDate?: Date;
  rentalStatus?: RentalStatus;
  isReturned?: boolean;
};
