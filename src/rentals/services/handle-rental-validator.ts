import { RentalHistory } from 'src/types/rental.types';

export const HandleRentalValidator = (
  rentalHistory: RentalHistory[],
): boolean => {
  if (!Array.isArray(rentalHistory)) {
    return false;
  }
  return rentalHistory.every(({ boardgame, rentalStartDate }) => {
    const isValidBoardGame = boardgame && typeof boardgame === 'object';
    const isValidRentalStartDate =
      rentalStartDate === undefined ||
      (rentalStartDate instanceof Date && !isNaN(rentalStartDate.getTime()));
    return isValidBoardGame && isValidRentalStartDate;
  });
};
