export const convertToBrasiliaTime = (date: Date): Date => {
  const adjustedDate = new Date(date.getTime());
  adjustedDate.setHours(adjustedDate.getHours() - 3);
  return adjustedDate;
};
