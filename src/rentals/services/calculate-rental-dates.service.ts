import { BadRequestException } from '@nestjs/common';
import { handleRentalEndDate } from '../utils/handle-rental-end-date';
import { Rentals } from '../schemas/rentals.schema';
import { RentalStatus } from 'src/rentals/types/rental.types';

export const calculateRentalDates = (
  rentals: Rentals,
): { rentalStartDate: Date; rentalEndDate: Date } => {
  const rentalDurationDays = parseInt(rentals.rentalDurationDays, 10);
  const isRentalDurationDaysInvalid =
    isNaN(rentalDurationDays) || rentalDurationDays < 0;

  const isRentalStatusEmpty = !rentals.rentalStatus;

  if (isRentalDurationDaysInvalid) {
    throw new BadRequestException('Invalid rental duration');
  }

  if (isRentalStatusEmpty) {
    rentals.rentalStatus = RentalStatus.ACTIVE;
  }

  const rentalStartDate = rentals.rentalStartDate
    ? new Date(rentals.rentalStartDate)
    : new Date(
        new Date().toLocaleString('en-US', {
          timeZone: 'America/Sao_Paulo',
        }),
      );

  // substracting the hours to get the brasilia time zone correctly
  !rentals.rentalStartDate &&
    rentalStartDate.setHours(rentalStartDate.getHours() - 3);

  const rentalEndDate = handleRentalEndDate(
    rentalStartDate,
    rentalDurationDays,
  );

  return { rentalStartDate, rentalEndDate };
};
