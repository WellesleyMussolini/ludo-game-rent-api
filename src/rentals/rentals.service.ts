import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Rentals } from './schemas/rentals.schema';
import { Model } from 'mongoose';
import { handleErrors } from 'src/utils/handle-error';
import { calculateRentalDates } from './services/calculate-rental-dates.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RentalStatus } from 'src/rentals/types/rental.types';
import { sortRentals } from './services/sorter-rentals.service';
import { UpdateRentedGames } from './services/update-rented-games.service';

@Injectable()
export class RentalsService {
  constructor(
    @InjectModel(Rentals.name) private rentalModel: Model<Rentals>,
    private readonly updateRentedGames: UpdateRentedGames,
  ) {}

  async findAll(): Promise<Rentals[]> {
    try {
      const rentals: Rentals[] = await this.rentalModel.find().exec();
      return sortRentals(rentals);
    } catch (error) {
      handleErrors({ error });
    }
  }

  async findRentalById(id: string): Promise<Rentals> {
    try {
      const rentals: Rentals = await this.rentalModel.findById(id).exec();

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
      const rentals: Rentals[] = await this.rentalModel.find({ userId }).exec();

      if (!rentals || rentals.length === 0) {
        throw new NotFoundException(`No rentals found for userId: '${userId}'`);
      }

      return sortRentals(rentals);
    } catch (error) {
      handleErrors({ error });
    }
  }

  // Create a rental
  async create(rentals: Rentals): Promise<Rentals> {
    try {
      const boardgame = await this.updateRentedGames.fetchBoardGame(rentals);

      const { rentalStartDate, rentalEndDate } = calculateRentalDates(rentals);
      rentals.rentalStartDate = rentalStartDate;
      rentals.rentalEndDate = rentalEndDate;

      const isSoldOut =
        parseInt(boardgame.rentedGames, 10) >=
        parseInt(boardgame.availableCopies, 10);

      if (isSoldOut)
        throw new BadRequestException(`The BoardGame has been sold out!`);

      await this.updateRentedGames.updateRentedGame(boardgame, 1);

      return await new this.rentalModel(rentals).save();
    } catch (error) {
      handleErrors({ error });
    }
  }

  // Update a rental
  async update(id: string, rental: Rentals): Promise<Rentals> {
    try {
      const boardgame = await this.updateRentedGames.fetchBoardGame(rental);
      const existingRental = await this.updateRentedGames.fetchRentalById(id);

      const { rentalStartDate, rentalEndDate } = calculateRentalDates(rental);
      rental.rentalStartDate = rentalStartDate;
      rental.rentalEndDate = rentalEndDate;

      // Check if `returnedAt` is invalid (missing or before `rentalStartDate`)
      const isReturnedAtInvalid =
        rental.rentalStatus === RentalStatus.RETURNED &&
        (!rental.returnedAt ||
          new Date(rental.returnedAt) <= new Date(rental.rentalStartDate));

      // Check if status is transitioning from RETURNED to another status (ACTIVE or OVERDUE)
      const isStatusChangingFromReturned =
        existingRental.rentalStatus === RentalStatus.RETURNED &&
        rental.rentalStatus !== RentalStatus.RETURNED;

      // Check if `returnedAt` is provided with a status other than RETURNED
      const isReturnedAtProvidedWithWrongStatus =
        rental.rentalStatus !== RentalStatus.RETURNED && rental.returnedAt;

      // Check if status is transitioning to RETURNED from another status
      const isStatusChangingToReturned =
        rental.rentalStatus === RentalStatus.RETURNED &&
        existingRental.rentalStatus !== RentalStatus.RETURNED;

      // Validate returnedAt if invalid
      if (isReturnedAtInvalid) {
        throw new BadRequestException(
          `The field 'returnedAt' must be provided and cannot be earlier than 'rentalStartDate' when the status is 'returned'.`,
        );
      }

      // Prevent setting `returnedAt` for non-RETURNED status
      if (isReturnedAtProvidedWithWrongStatus) {
        throw new BadRequestException(
          `You can't provide the 'returnedAt' field unless the 'rentalStatus' is 'returned'.`,
        );
      }

      // Increment rented game count if status is changing away from RETURNED
      if (isStatusChangingFromReturned) {
        await this.updateRentedGames.updateRentedGame(boardgame, +1);

        // Remove `returnedAt` field using $unset
        await this.rentalModel.updateOne(
          { _id: id },
          { $unset: { returnedAt: '' } },
        );
      }

      // Decrement rented game count if status is changing to RETURNED
      if (isStatusChangingToReturned) {
        await this.updateRentedGames.updateRentedGame(boardgame, -1);
      }

      const updatedRental = await this.rentalModel
        .findByIdAndUpdate(id, rental, { new: true, runValidators: true })
        .exec();

      if (!updatedRental) {
        throw new NotFoundException(`Rental with id '${id}' not found.`);
      }

      return updatedRental;
    } catch (error) {
      handleErrors({ error });
    }
  }

  // Remove a rental
  async remove(id: string): Promise<Rentals> {
    try {
      const rental = await this.updateRentedGames.fetchRentalById(id);
      const boardgame = await this.updateRentedGames.fetchBoardGame(rental);
      await this.updateRentedGames.updateRentedGame(boardgame, -1);

      return await this.rentalModel.findByIdAndDelete(id).exec();
    } catch (error) {
      handleErrors({ error, message: 'Failed to remove rental history' });
    }
  }

  @Cron(CronExpression.EVERY_12_HOURS)
  async verifyRentalStatus() {
    const findAllRentals = await this.rentalModel.find().exec();
    const currentDate = new Date().toISOString();

    for (const rental of findAllRentals) {
      const rentalEndDate = new Date(rental.rentalEndDate).toISOString();

      const isGameReturned = rental.rentalStatus === RentalStatus.RETURNED;

      const isGameOverdue =
        currentDate > rentalEndDate &&
        rental.rentalStatus !== RentalStatus.OVERDUE;

      const isGameActive =
        currentDate <= rentalEndDate &&
        rental.rentalStatus === RentalStatus.OVERDUE;

      // Skip rentals that are already returned
      if (isGameReturned) {
        continue;
      }

      // Set rental status to OVERDUE if current date is past rental end date
      if (isGameOverdue) {
        rental.rentalStatus = RentalStatus.OVERDUE;
        await rental.save();
        continue; // Skip to the next iteration after updating
      }

      // Set rental status to ACTIVE if it was overdue but the end date is in the future
      if (isGameActive) {
        rental.rentalStatus = RentalStatus.ACTIVE;
        await rental.save();
      }
    }
  }
}
