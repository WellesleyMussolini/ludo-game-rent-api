import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Rentals } from './schemas/rentals.schema';
import { Model, Types } from 'mongoose';
import { handleErrors } from 'src/utils/handle-error';
import { calculateRentalDates } from './services/calculate-rental-dates.service';
import { RentalStatus } from 'src/rentals/types/rental.types';
import { User } from 'src/users/schemas/users.schema';
import { BoardGame } from 'src/boardgames/schemas/boardgames.schema';
import { fetchBoardGameById } from 'src/boardgames/utils/fetch-boardgame-by-id';
import { updateRentedGame } from './services/update-rented-games.service';
import { validations } from './utils/validations';
import { sortByStatusPriority } from 'src/utils/sort-by-status';
import { convertToBrasiliaTime } from 'src/utils/convert-to-brasilia-time';

const rentalStatusOrder = {
  overdue: 1,
  active: 2,
  returned: 3,
};

@Injectable()
export class RentalsService {
  constructor(
    @InjectModel(Rentals.name) private rentalModel: Model<Rentals>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(BoardGame.name) private boardGameModel: Model<BoardGame>,
  ) {}

  async findAll(): Promise<Rentals[]> {
    try {
      const sortingPipeline = sortByStatusPriority(
        'rentalStatus',
        rentalStatusOrder,
      );

      const rentals: Rentals[] = await this.rentalModel
        .aggregate(sortingPipeline)
        .exec();

      return rentals;
    } catch (error) {
      handleErrors({ error });
    }
  }

  async ensureBoardgameExists(
    boardgameId: string | Types.ObjectId,
  ): Promise<BoardGame> {
    const boardgame = await fetchBoardGameById({
      boardgameId: boardgameId,
      boardGameModel: this.boardGameModel,
    });

    validations.isBoardgameNotFound(boardgame);

    return boardgame;
  }

  async findRentalById(id: string): Promise<Rentals> {
    try {
      const rental: Rentals | null = await this.rentalModel.findById(id).exec();

      validations.isRentalNotFound(rental);

      return rental;
    } catch (error) {
      handleErrors({ error, message: 'rental id was not found' });
    }
  }

  async findRentalsByUserById(userId: string): Promise<Rentals[]> {
    try {
      const sortingPipeline = [
        { $match: { userId: new Types.ObjectId(userId) } },
        ...sortByStatusPriority('rentalStatus', rentalStatusOrder),
      ];

      const rentals: Rentals[] = await this.rentalModel
        .aggregate(sortingPipeline)
        .exec();

      validations.isRentalNotFound(rentals);

      return rentals;
    } catch (error) {
      handleErrors({ error, message: 'User rental id not found' });
    }
  }

  async create(rentals: Rentals): Promise<Rentals> {
    try {
      if (!rentals.userId || !Types.ObjectId.isValid(rentals.userId))
        throw new BadRequestException('Invalid or missing user id');

      const user = await this.userModel.findById(rentals.userId).exec();

      validations.isUserNotFound(user);

      const boardgame = await this.ensureBoardgameExists(rentals.boardgameId);
      validations.isGameSoldOut(boardgame);
      validations.isUserCpfValid(user.cpf);

      const { rentalStartDate, rentalEndDate } = calculateRentalDates(rentals);
      Object.assign(rentals, {
        rentalStartDate,
        rentalEndDate,
        userCpf: user.cpf,
      });

      await this.updateBoardgameCopies({ rental: rentals, copies: 1 });

      return new this.rentalModel(rentals).save();
    } catch (error) {
      handleErrors({ error, message: 'Failed to create rental' });
    }
  }

  async validateRentalStatusChange(existingRental: Rentals, rental: Rentals) {
    const isCurrentlyReturned = rental.rentalStatus === RentalStatus.RETURNED;

    validations.isReturnedAtEmpty({
      isCurrentlyReturned,
      rentalReturnedAt: rental.returnedAt ?? existingRental.returnedAt,
      rentalStartDate: rental.rentalStartDate,
    });

    validations.isReturnedAtValid({
      isCurrentlyReturned,
      rentalReturnedAt: rental.returnedAt ?? existingRental.returnedAt,
      newStatus: rental.rentalStatus, // Pass new status
    });
  }

  async update(id: string, rental: Rentals): Promise<Rentals> {
    try {
      const rentalFound = await this.findRentalById(id);

      // Update rental dates
      Object.assign(rental, calculateRentalDates(rental));

      // Determine rental status changes
      const isReturningRental =
        rentalFound.rentalStatus !== RentalStatus.RETURNED &&
        rental.rentalStatus === RentalStatus.RETURNED;

      const isSwitchingFromReturned =
        rentalFound.rentalStatus === RentalStatus.RETURNED &&
        rental.rentalStatus !== RentalStatus.RETURNED;

      if (isReturningRental) {
        rental.returnedAt = convertToBrasiliaTime(new Date());
      }

      // Validate status changes
      this.validateRentalStatusChange(rentalFound, rental);

      // Adjust board game copies
      if (isReturningRental) {
        await this.updateBoardgameCopies({
          rental,
          copies: -1,
          shouldThrowError: true,
        });
      } else if (isSwitchingFromReturned) {
        await this.updateBoardgameCopies({
          rental,
          copies: 1,
          shouldThrowError: true,
        });
      }

      // Prepare update query
      const updateQuery: any = { $set: rental };
      if (isSwitchingFromReturned) updateQuery.$unset = { returnedAt: '' };

      return await this.rentalModel
        .findByIdAndUpdate(id, updateQuery, {
          new: true,
          runValidators: true,
        })
        .exec();
    } catch (error) {
      handleErrors({ error, message: 'Failed to update rental' });
    }
  }

  async updateBoardgameCopies({
    rental,
    copies,
    shouldThrowError = false,
  }: {
    rental: Rentals;
    copies: number;
    shouldThrowError?: boolean;
  }): Promise<boolean> {
    const boardgame = await await fetchBoardGameById({
      boardgameId: rental.boardgameId,
      boardGameModel: this.boardGameModel,
    });

    // If the boardgame doesn't exist and we require it to exist, throw an error
    // This is mainly used in the 'create' method, where a board game must exist
    if (!boardgame && shouldThrowError) {
      throw new NotFoundException('Boardgame id not found');
    }

    // If the boardgame doesn't exist but 'shouldThrowError' is false, return false
    // This happens in 'remove', where we don't care if the boardgame exists
    // We just remove the rental
    if (!boardgame) {
      return false;
    }

    await updateRentedGame({
      boardgame,
      copies,
      boardGameModel: this.boardGameModel,
    });

    return true;
  }

  async remove(id: string): Promise<Rentals> {
    try {
      const rental: Rentals = await this.findRentalById(id);

      // Update boardgame copies if the boardgame exists
      await this.updateBoardgameCopies({ rental: rental, copies: -1 });

      // Delete the rental
      return await this.rentalModel.findByIdAndDelete(id).exec();
    } catch (error) {
      handleErrors({ error, message: 'Failed to remove rental' });
    }
  }
}
