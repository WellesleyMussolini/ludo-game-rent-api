import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Rentals } from '../schemas/rentals.schema';
import { BoardGame } from 'src/boardgames/schemas/boardgames.schema';

@Injectable()
export class UpdateRentedGames {
  constructor(
    @InjectModel(Rentals.name) private rentalModel: Model<Rentals>,
    @InjectModel(BoardGame.name) private boardGameModel: Model<BoardGame>,
  ) {}

  async fetchBoardGame(rental: Rentals): Promise<BoardGame> {
    const { boardgameId } = rental;

    const boardgame = await this.boardGameModel.findById(boardgameId).exec();

    if (!boardgame) {
      throw new BadRequestException(
        `BoardGame with id '${boardgameId}' not found.`,
      );
    }

    return boardgame;
  }

  async fetchRentalById(id: string): Promise<Rentals> {
    const rental = await this.rentalModel.findById(id).exec();

    if (!rental) {
      throw new NotFoundException(`Rental with id '${id}' not found.`);
    }

    return rental;
  }

  async updateRentedGame(boardgame: BoardGame, adjust: number): Promise<void> {
    const updatedRentedGames = Math.max(
      0,
      parseInt(boardgame.rentedGames, 10) + adjust,
    );

    await this.boardGameModel
      .updateOne(
        { _id: boardgame['_id'] },
        { rentedGames: updatedRentedGames.toString() },
      )
      .exec();
  }
}
