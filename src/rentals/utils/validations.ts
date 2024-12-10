import { BadRequestException } from '@nestjs/common';
import mongoose, { Types } from 'mongoose';
import { BoardGame } from 'src/boardgames/schemas/boardgames.schema';
import { Rentals } from '../schemas/rentals.schema';

export const validations = {
  isUserValid: ({
    id,
    cpf,
  }: {
    id: string | Types.ObjectId;
    cpf: string | null;
  }): boolean => {
    const isIdValid: boolean = !mongoose.Types.ObjectId.isValid(id);
    const isIdNotFound: boolean = !id;
    const isCpfNotFound: boolean = !cpf;

    if (isIdValid) {
      throw new BadRequestException(`Invalid user id`);
    }

    if (isIdNotFound) {
      throw new BadRequestException(`User id not found.`);
    }

    if (isCpfNotFound) {
      throw new BadRequestException(
        `You can't rent a game without your CPF registered.`,
      );
    }
    return true;
  },
  isGameSoldOut: ({ boardgame }: { boardgame: BoardGame }): boolean => {
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
      (!rentalReturnedAt || new Date(rentalReturnedAt) <= rentalStartDate)
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
  }: {
    isCurrentlyReturned: boolean;
    rentalReturnedAt: Date;
  }): boolean => {
    if (!isCurrentlyReturned && rentalReturnedAt) {
      throw new BadRequestException(
        `You can't provide the 'returnedAt' field unless the 'rentalStatus' is 'returned'.`,
      );
    }
    return true;
  },
  isRentalFound: ({ rental }: { rental: Rentals }): boolean => {
    if (!rental) {
      throw new BadRequestException(`Rental id not found.`);
    }
    return true;
  },
};
