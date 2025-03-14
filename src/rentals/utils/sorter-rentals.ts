import { Rentals } from '../schemas/rentals.schema';
import { RentalStatus } from '../types/rental.types';

export const sortRentals = (rentals: Rentals[]): Rentals[] => {
  const statusOrder: string[] = [
    RentalStatus.OVERDUE,
    RentalStatus.ACTIVE,
    RentalStatus.RETURNED,
  ];

  return rentals.sort((a: Rentals, b: Rentals) => {
    const indexA = statusOrder.indexOf(a.rentalStatus);
    const indexB = statusOrder.indexOf(b.rentalStatus);

    return indexA - indexB;
  });
};
