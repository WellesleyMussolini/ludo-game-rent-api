import { Rentals } from '../schemas/rentals.schema';
import { RentalStatus } from '../types/rental.types';

export const sortRentals = (rentals: Rentals[]): Rentals[] => {
  return rentals.sort((a: Rentals, b: Rentals) => {
    // Prioritize overdue rentals
    if (
      a.rentalStatus === RentalStatus.OVERDUE &&
      b.rentalStatus !== RentalStatus.OVERDUE
    ) {
      return -1;
    }
    if (
      a.rentalStatus !== RentalStatus.OVERDUE &&
      b.rentalStatus === RentalStatus.OVERDUE
    ) {
      return 1;
    }

    // If both are the same status, sort by rentalStartDate (most recent first)
    const dateA = a.rentalStartDate ? new Date(a.rentalStartDate) : new Date(0);
    const dateB = b.rentalStartDate ? new Date(b.rentalStartDate) : new Date(0);
    return dateB.getTime() - dateA.getTime(); // Most recent first
  });
};
