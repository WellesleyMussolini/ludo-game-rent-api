import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Rentals } from './schemas/rentals.schema';
import { Model } from 'mongoose';
import { handleErrors } from 'src/utils/handle-error';
import { calculateRentalDates } from './services/calculate-rental-dates.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RentalStatus } from 'src/rentals/types/rental.types';

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

  async findRentalById(id: string): Promise<Rentals> {
    try {
      const rentals = await this.rentalModel.findById(id).exec();

      if (!rentals) {
        throw new NotFoundException();
      }

      return rentals;
    } catch (error) {
      handleErrors({ error, message: `Rentals id not found` });
    }
  }

  async findUserById(userId: string): Promise<Rentals[]> {
    try {
      const rentals = await this.rentalModel.find({ userId }).exec();

      if (!rentals || rentals.length === 0) {
        throw new NotFoundException(`No rentals found for userId: '${userId}'`);
      }

      return rentals;
    } catch (error) {
      handleErrors({ error });
    }
  }

  async update(id: string, rental: Rentals): Promise<Rentals> {
    try {
      const { rentalStartDate, rentalEndDate } = calculateRentalDates(rental);
      rental.rentalStartDate = rentalStartDate;
      rental.rentalEndDate = rentalEndDate;

      const updatedRental = await this.rentalModel
        .findByIdAndUpdate(id, rental, { new: true, runValidators: true })
        .exec();
      if (!updatedRental) {
        throw new NotFoundException(`Rental with id '${id}' not found`);
      }
      return updatedRental;
    } catch (error) {
      handleErrors({ error });
    }
  }

  async create(rentals: Rentals): Promise<Rentals> {
    try {
      const { rentalStartDate, rentalEndDate } = calculateRentalDates(rentals);
      rentals.rentalStartDate = rentalStartDate;
      rentals.rentalEndDate = rentalEndDate;
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

  @Cron(CronExpression.EVERY_SECOND)
  async handleCron() {
    const findAllRentals = await this.rentalModel.find().exec();

    const currentDate = new Date();

    for (const rental of findAllRentals) {
      const rentalEndDate = new Date(rental.rentalEndDate).toISOString();

      // Skip rentals that are already returned
      if (rental.rentalStatus === RentalStatus.RETURNED) {
        continue;
      }

      if (currentDate.toISOString() > rentalEndDate) {
        // If rental is not already overdue, set it to overdue
        if (rental.rentalStatus !== RentalStatus.OVERDUE) {
          rental.rentalStatus = RentalStatus.OVERDUE;
          await rental.save();
        }
      } else {
        // If the rental was overdue but now the end date is in the future, set it back to active
        if (rental.rentalStatus === RentalStatus.OVERDUE) {
          rental.rentalStatus = RentalStatus.ACTIVE;
          await rental.save();
        }
      }
    }
  }
}
