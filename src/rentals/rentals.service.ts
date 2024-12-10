import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Rentals } from './schemas/rentals.schema';
import { Model } from 'mongoose';
import { handleErrors } from 'src/utils/handle-error';
import { calculateRentalDates } from './services/calculate-rental-dates.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RentalStatus } from 'src/rentals/types/rental.types';
import { sortRentals } from './utils/sorter-rentals';
import { User } from 'src/users/schemas/users.schema';
import { BoardGame } from 'src/boardgames/schemas/boardgames.schema';
import { fetchBoardGameById } from 'src/boardgames/utils/fetch-boardgame-by-id';
import { updateRentedGame } from './services/update-rented-games.service';
import { validateRentalExists, validations } from './utils/validations';

@Injectable()
export class RentalsService {
  constructor(
    @InjectModel(Rentals.name) private rentalModel: Model<Rentals>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(BoardGame.name) private boardGameModel: Model<BoardGame>,
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
      const rental: Rentals | null = await this.rentalModel.findById(id).exec();

      const isNotFound: boolean = !rental;

      if (isNotFound) throw new NotFoundException();

      return rental;
    } catch (error) {
      handleErrors({ error, message: `Rental id was not found.` });
    }
  }

  async findUserById(userId: string): Promise<Rentals[]> {
    try {
      const rentals: Rentals[] = await this.rentalModel.find({ userId }).exec();

      const isNotFound: boolean = !rentals;

      if (isNotFound) throw new NotFoundException();

      return sortRentals(rentals);
    } catch (error) {
      handleErrors({ error, message: 'User rental id not found' });
    }
  }

  async create(rentals: Rentals): Promise<Rentals> {
    try {
      const { boardgameId, userId } = rentals;

      const boardgame: BoardGame = await fetchBoardGameById({
        boardGameModel: this.boardGameModel,
        boardgameId: boardgameId,
      });

      const user: User | null = await this.userModel.findById(userId).exec();

      const { rentalStartDate, rentalEndDate } = calculateRentalDates(rentals);

      validations.isUserValid({ id: userId, cpf: user.cpf });
      validations.isGameSoldOut({ boardgame: boardgame });

      rentals.rentalStartDate = rentalStartDate;
      rentals.rentalEndDate = rentalEndDate;
      rentals.userCpf = user.cpf;

      await updateRentedGame({
        boardgame,
        adjust: 1,
        boardGameModel: this.boardGameModel,
      });

      return await new this.rentalModel(rentals).save();
    } catch (error) {
      handleErrors({ error });
    }
  }

  async update(id: string, rental: Rentals): Promise<Rentals> {
    try {
      const { boardgameId } = rental;

      const boardgame: BoardGame = await fetchBoardGameById({
        boardgameId,
        boardGameModel: this.boardGameModel,
      });

      const rentalFound: Rentals = await this.findRentalById(id);

      const { rentalStartDate, rentalEndDate } = calculateRentalDates(rental);

      const updatedRental: Rentals = await this.rentalModel
        .findByIdAndUpdate(id, rental, { new: true, runValidators: true })
        .exec();

      const isCurrentlyReturned = rental.rentalStatus === RentalStatus.RETURNED;

      const wasPreviouslyReturned =
        rentalFound.rentalStatus === RentalStatus.RETURNED;

      const wasPreviouslyReturnedAndNowNot =
        wasPreviouslyReturned && !isCurrentlyReturned;

      const isCurrentlyReturnedAndWasNot =
        isCurrentlyReturned && !wasPreviouslyReturned;

      validations.isReturnedAtEmpty({
        isCurrentlyReturned: isCurrentlyReturned,
        rentalReturnedAt: rental.returnedAt,
        rentalStartDate: rentalStartDate,
      });
      validations.isReturnedAtValid({
        isCurrentlyReturned: isCurrentlyReturned,
        rentalReturnedAt: rental.returnedAt,
      });
      validations.isRentalFound({ rental: rental });

      if (wasPreviouslyReturnedAndNowNot) {
        await updateRentedGame({
          boardgame,
          boardGameModel: this.boardGameModel,
          adjust: +1,
        });
        await this.rentalModel.updateOne(
          { _id: id },
          { $unset: { returnedAt: '' } },
        );
      } else if (isCurrentlyReturnedAndWasNot) {
        await updateRentedGame({
          boardgame,
          boardGameModel: this.boardGameModel,
          adjust: -1,
        });
      }

      rental.rentalStartDate = rentalStartDate;
      rental.rentalEndDate = rentalEndDate;

      return updatedRental;
    } catch (error) {
      handleErrors({ error });
    }
  }

  async remove(id: string): Promise<Rentals> {
    try {
      const rental: Rentals = await this.findRentalById(id);

      const boardgame: BoardGame = await fetchBoardGameById({
        boardgameId: rental.boardgameId,
        boardGameModel: this.boardGameModel,
      });

      await updateRentedGame({
        boardgame,
        adjust: -1,
        boardGameModel: this.boardGameModel,
      });

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
