import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { Rentals } from '../rentals/schemas/rentals.schema';
import { RentalHistory, RentalStatus } from '../types/rental.types';

@Injectable()
export class RentalStatusUpdaterService {
  private readonly logger = new Logger(RentalStatusUpdaterService.name);

  constructor(@InjectModel(Rentals.name) private rentalModel: Model<Rentals>) {}

  // Cron job to run every second
  @Cron(CronExpression.EVERY_SECOND)
  async updateRentalStatusPeriodically(): Promise<void> {
    const allRentals = await this.rentalModel.find().exec();
    const currentDate = this.getCurrentDateInTimeZone();

    for (const rental of allRentals) {
      if (rental.rentalHistory && rental.rentalHistory.length > 0) {
        this.updateRentalHistory(rental.rentalHistory, currentDate);
        await this.saveUpdatedRental(rental);
      }
    }
  }

  // Get the current date in the 'America/Sao_Paulo' timezone
  private getCurrentDateInTimeZone(): Date {
    return new Date(
      new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }),
    );
  }

  // Check if the rental is overdue
  private isOverdue(
    rentalEntry: RentalHistory,
    rentalEndDate: Date,
    currentDate: Date,
  ): boolean {
    return (
      rentalEndDate && !rentalEntry.isReturned && currentDate > rentalEndDate
    );
  }

  // Check if the rental has been returned
  private isReturned(rentalEntry: RentalHistory): boolean {
    return rentalEntry.isReturned === true;
  }

  // Update the rental history for each rental entry
  private updateRentalHistory(
    rentalHistory: RentalHistory[],
    currentDate: Date,
  ): void {
    rentalHistory.forEach((rentalEntry) => {
      const rentalEndDate = new Date(rentalEntry.rentalEndDate);

      if (this.isOverdue(rentalEntry, rentalEndDate, currentDate)) {
        rentalEntry.rentalStatus = RentalStatus.OVERDUE;
      }

      if (this.isReturned(rentalEntry)) {
        rentalEntry.rentalStatus = RentalStatus.RETURNED;
      }
    });
  }

  // Save the updated rental record to the database
  private async saveUpdatedRental(rental: any): Promise<void> {
    await this.rentalModel.updateOne(
      { _id: rental._id },
      { rentalHistory: rental.rentalHistory },
    );
  }
}
