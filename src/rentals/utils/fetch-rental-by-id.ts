import { NotFoundException } from '@nestjs/common';
import { Rentals } from '../schemas/rentals.schema';
import { Model } from 'mongoose';

export const fetchRentalById = async ({
  id,
  rentalModel,
}: {
  id: string;
  rentalModel: Model<Rentals>;
}): Promise<Rentals> => {
  const rental: Rentals = await rentalModel.findById(id).exec();

  const isNotFound: boolean = !rental;

  if (isNotFound) {
    throw new NotFoundException(`Rental with id '${id}' not found.`);
  }

  return rental;
};
