import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BoardGame } from 'src/boardgames/schemas/boardgames.schema';
import { handleErrors } from 'src/utils/handle-error';

@Injectable()
export class BoardGamesService {
  constructor(
    @InjectModel(BoardGame.name)
    private boardgameModel: Model<BoardGame>,
  ) {}

  async findAll(): Promise<BoardGame[]> {
    try {
      return await this.boardgameModel.find().exec();
    } catch (error) {
      handleErrors({ error });
    }
  }

  async getById(id: string): Promise<BoardGame> {
    try {
      const boardgame = await this.boardgameModel.findById(id).exec();

      if (!boardgame) {
        throw new NotFoundException();
      }

      return boardgame;
    } catch (error) {
      handleErrors({ error, message: `BoardGame id not found` });
    }
  }

  async findByName(name: string): Promise<BoardGame[]> {
    try {
      const regex = { name: { $regex: name, $options: 'i' } };

      const boardgames = await this.boardgameModel.find(regex).limit(5).exec();

      if (boardgames.length === 0) {
        throw new NotFoundException();
      }

      return boardgames;
    } catch (error) {
      handleErrors({
        error,
        message: `BoardGame '${name}' not found`,
      });
    }
  }

  async create(boardGame: BoardGame): Promise<BoardGame> {
    try {
      return await new this.boardgameModel(boardGame).save();
    } catch (error) {
      handleErrors({ error });
    }
  }

  async update(id: string, boardGame: BoardGame): Promise<BoardGame> {
    try {
      const updatedBoardGame = await this.boardgameModel
        .findByIdAndUpdate(id, boardGame, { new: true, runValidators: true })
        .exec();

      if (!updatedBoardGame) {
        throw new NotFoundException(`BoardGame with id '${id}' not found`);
      }

      return updatedBoardGame;
    } catch (error) {
      handleErrors({ error });
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.boardgameModel.findByIdAndDelete(id).exec();
      if (!result) {
        throw new NotFoundException(`Board game with id: "${id}" not found`);
      }
    } catch (error) {
      handleErrors({ error, message: 'BoardGame id not found' });
    }
  }
}
