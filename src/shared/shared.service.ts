import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BoardGame } from 'src/boardgames/schemas/boardgames.schema';
import { Rentals } from 'src/rentals/schemas/rentals.schema';
import { RentalStatus } from 'src/rentals/types/rental.types';
import { Status } from 'src/types/status.types';

@Injectable()
export class SharedService {
  constructor(
    @InjectModel(Rentals.name) private rentalModel: Model<Rentals>,
    @InjectModel(BoardGame.name) private boardGameModel: Model<BoardGame>,
  ) {}

  private async updateGameStatus(boardgameId: string): Promise<void> {
    const boardgame = await this.boardGameModel.findById(boardgameId).exec();
    if (!boardgame) return;

    const activeRentals = await this.rentalModel
      .countDocuments({
        boardgameId,
        rentalStatus: { $ne: RentalStatus.RETURNED },
      })
      .exec();

    boardgame.rentedGames = activeRentals.toString();
    boardgame.status =
      activeRentals >= parseInt(boardgame.availableCopies)
        ? Status.RENT
        : Status.AVAILABLE;

    await boardgame.save();
  }

  async createRental(rentals: Rentals): Promise<string | Rentals> {
    const { boardgameId } = rentals;

    // Ensure boardgameId is treated as a string
    const boardgame = await this.boardGameModel
      .findById(boardgameId.toString())
      .exec();
    if (!boardgame) return 'BoardGame not found!';

    const activeRentals = await this.rentalModel
      .countDocuments({
        boardgameId: boardgameId.toString(),
        rentalStatus: { $ne: RentalStatus.RETURNED },
      })
      .exec();

    if (activeRentals >= parseInt(boardgame.availableCopies)) {
      return 'This game has been sold out!';
    }

    const newRental = await new this.rentalModel(rentals).save();
    await this.updateGameStatus(boardgameId.toString());

    return newRental;
  }

  async deleteRental(rentals: Rentals): Promise<void> {
    await this.updateGameStatus(rentals.boardgameId.toString());
  }

  async updateRental(id: string, rental: Rentals): Promise<void> {
    const updatedRental = await this.rentalModel
      .findByIdAndUpdate(id, rental, { new: true, runValidators: true })
      .exec();

    if (!updatedRental) {
      throw new NotFoundException(`Rental with id '${id}' not found`);
    }

    const boardgameIds = new Set(
      await this.rentalModel.distinct('boardgameId'),
    );

    for (const boardgameId of boardgameIds) {
      await this.updateGameStatus(boardgameId.toString());
    }
  }
}
