import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Rentals } from './schemas/rentals.schema';
import { Model } from 'mongoose';
import { handleErrors } from 'src/utils/handle-error';
import { HandleUpdateRentalHistory } from './services/handle-update-rental-history';

@Injectable()
export class RentalsService {
  constructor(@InjectModel(Rentals.name) private rentalModel: Model<Rentals>) {}

  async findAll(): Promise<Rentals[]> {
    try {
      return await this.rentalModel.find().exec();
    } catch (error) {
      handleErrors({ error });
    }
  }

  async update(id: string, rental: Rentals): Promise<Rentals> {
    const handleUpdateRental = async (): Promise<Rentals> => {
      const updatedRental = await this.rentalModel
        .findByIdAndUpdate(id, rental, { new: true, runValidators: true })
        .exec();
      if (!updatedRental) {
        throw new NotFoundException(`Rental with id '${id}' not found`);
      }
      return updatedRental;
    };

    try {
      if (!rental.rentalHistory || rental.rentalHistory.length === 0) {
        rental.rentalHistory = [];
      } else {
        rental.rentalHistory = HandleUpdateRentalHistory(rental.rentalHistory);
      }

      // Update the rental in the database
      return await handleUpdateRental();
    } catch (error) {
      handleErrors({ error });
    }
  }

  async create(rentals: Rentals): Promise<Rentals> {
    try {
      return await new this.rentalModel(rentals).save();
    } catch (error) {
      handleErrors({ error });
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.rentalModel.findByIdAndDelete(id).exec();
      if (!result) {
        throw new NotFoundException(
          `Rental history with id: "${id}" not found`,
        );
      }
    } catch (error) {
      handleErrors({ error, message: 'Rental history id not found' });
    }
  }
}
