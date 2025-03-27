import { BadRequestException } from '@nestjs/common';
import { handleRentalEndDate } from '../utils/handle-rental-end-date';
import { Rentals } from '../schemas/rentals.schema';
import { RentalStatus } from 'src/rentals/types/rental.types';
import { convertToBrasiliaTime } from 'src/utils/convert-to-brasilia-time';

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

  let rentalStartDate = rentals.rentalStartDate
    ? new Date(rentals.rentalStartDate)
    : new Date(
        new Date().toLocaleString('en-US', {
          timeZone: 'America/Sao_Paulo',
        }),
      );

  const isStartDateEmpty = !rentals.rentalStartDate;

  if (isStartDateEmpty) {
    rentalStartDate = convertToBrasiliaTime(new Date());
  }

  const rentalEndDate = handleRentalEndDate(
    rentalStartDate,
    rentalDurationDays,
  );

  return { rentalStartDate, rentalEndDate };
};
