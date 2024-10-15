export const handleRentalEndDate = (
  rentalStartDate: Date,
  rentalDurationDays: number,
): Date => {
  const rentalEndDate = new Date(rentalStartDate);
  rentalEndDate.setDate(rentalStartDate.getDate() + rentalDurationDays);
  return rentalEndDate;
};
