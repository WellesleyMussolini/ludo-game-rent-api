import { BadRequestException } from '@nestjs/common';
import { handleRentalEndDate } from '../utils/handle-rental-end-date';
import { RentalHistory, RentalStatus } from 'src/types/rental.types';

export const HandleUpdateRentalHistory = (
  rentalHistory: RentalHistory[],
): RentalHistory[] => {
  return rentalHistory.map((rentalEntry) => {
    if (!rentalEntry || !rentalEntry.boardgame) {
      throw new BadRequestException('BoardGame is required');
    }

    const rentalDurationDays = parseInt(
      rentalEntry.boardgame.rentalDurationDays,
      10,
    );
    if (isNaN(rentalDurationDays) || rentalDurationDays < 0) {
      throw new BadRequestException('Invalid rental duration');
    }

    const rentalStartDate = rentalEntry.rentalStartDate
      ? new Date(rentalEntry.rentalStartDate)
      : new Date(
          new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }),
        );

    // substracting the hours to get the brasilia time zone correctly
    rentalStartDate.setHours(rentalStartDate.getHours() - 3);

    const rentalEndDate = handleRentalEndDate(
      rentalStartDate,
      rentalDurationDays,
    );

    return {
      boardgame: rentalEntry.boardgame,
      rentalStartDate: rentalStartDate,
      rentalEndDate: rentalEndDate,
      rentalStatus: rentalEntry.isReturned
        ? RentalStatus.RETURNED
        : RentalStatus.ACTIVE,
      isReturned:
        rentalEntry.isReturned !== undefined ? rentalEntry.isReturned : false,
    };
  });
};
