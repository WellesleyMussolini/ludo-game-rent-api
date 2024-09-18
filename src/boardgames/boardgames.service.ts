import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BoardGame } from 'src/boardgames/schemas/boardgames.schema';
import { handleErrors } from 'src/utils/handle-error';
import { CreateBoardGameDto } from './dto/boardgames.dto';

@Injectable()
export class BoardGamesService {
  // Passar as verificações pro schema
  constructor(
    @InjectModel(BoardGame.name)
    private boardgameModel: Model<BoardGame>,
  ) {}

  async findAll(): Promise<CreateBoardGameDto[]> {
    // Faltou tratar erro
    const games = await this.boardgameModel.find().exec();

    const formatedGames = games.map((game) => {
      return {
        ...game,
        gameName: game.name,
      };
    });

    return formatedGames;
  }

  async getById(id: string): Promise<BoardGame> {
    try {
      const boardgame = await this.boardgameModel.findById(id).exec();

      if (!boardgame) {
        throw new NotFoundException();
      }

      return boardgame;
    } catch (error) {
      handleErrors({ error, message: `BoardGame id not found`, id });
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

  create(boardGame: CreateBoardGameDto): Promise<CreateBoardGameDto> {
    try {
      return new this.boardgameModel(boardGame).save();
    } catch (error) {
      console.log('ERROR MESSAGE', error.message);
      console.log('ERROR', error);
      handleErrors(error);
    }
  }

  async update(id: string, boardGame: BoardGame): Promise<BoardGame> {
    // Faltou tratar erro
    const updatedBoardGame = await this.boardgameModel
      .findByIdAndUpdate(id, boardGame, { new: true })
      .exec();

    if (!updatedBoardGame) {
      throw new NotFoundException(`Board game with id ${id} not found`);
    }

    return updatedBoardGame;
  }

  async remove(id: string): Promise<void> {
    // Faltou tratar erro
    const result = await this.boardgameModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Board game with id: "${id}" not found`);
    }
  }
}
