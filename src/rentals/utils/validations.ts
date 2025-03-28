import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BoardGame } from 'src/boardgames/schemas/boardgames.schema';
import { Rentals } from '../schemas/rentals.schema';
import { RentalStatus } from '../types/rental.types';
import { User } from 'src/users/schemas/users.schema';
import { Types } from 'mongoose';

export const validations = {
  isUserCpfValid: (cpf: string | null): boolean => {
    if (!cpf) {
      throw new BadRequestException(
        `You can't rent a game without your CPF registered.`,
      );
    }
    return true;
  },

  isGameSoldOut: (boardgame: BoardGame): boolean => {
    if (
      parseInt(boardgame.rentedGames, 10) >=
      parseInt(boardgame.availableCopies, 10)
    ) {
      throw new BadRequestException(`The BoardGame has been sold out!`);
    }
    return true;
  },

  isReturnedAtEmpty: ({
    isCurrentlyReturned,
    rentalReturnedAt,
    rentalStartDate,
  }: {
    isCurrentlyReturned: boolean;
    rentalReturnedAt: Date;
    rentalStartDate: Date;
  }): boolean => {
    if (
      isCurrentlyReturned &&
      (!rentalReturnedAt || rentalReturnedAt <= rentalStartDate)
    ) {
      throw new BadRequestException(
        `The field 'returnedAt' must be provided and cannot be earlier than 'rentalStartDate' when the status is 'returned'.`,
      );
    }
    return true;
  },

  isReturnedAtValid: ({
    isCurrentlyReturned,
    rentalReturnedAt,
    newStatus,
  }: {
    isCurrentlyReturned: boolean;
    rentalReturnedAt: Date;
    newStatus: RentalStatus;
  }): boolean => {
    // If the rental is switching away from RETURNED, ignore returnedAt validation
    if (!isCurrentlyReturned && newStatus !== RentalStatus.RETURNED) {
      return true;
    }

    if (!isCurrentlyReturned && rentalReturnedAt) {
      throw new BadRequestException(
        `You can't provide the 'returnedAt' field unless the 'rentalStatus' is 'returned'.`,
      );
    }
    return true;
  },

  isRentalNotFound: (rental: Rentals | Rentals[] | null): boolean => {
    if (!rental || (Array.isArray(rental) && rental.length === 0)) {
      throw new NotFoundException('Rental(s) not found');
    }
    return true;
  },

  isUserNotFound: (user: User | null): boolean => {
    if (!user) {
      throw new NotFoundException('User id not found');
    }
    return true;
  },

  isBoardgameNotFound: (boardgame: BoardGame | null): boolean => {
    if (!boardgame) {
      throw new NotFoundException('Boardgame id not found');
    }
    return true;
  },

  isObjectIdValid: (id: string | Types.ObjectId): boolean => {
    if (id || !Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid or missing user id');
    }
    return true;
  },
};
