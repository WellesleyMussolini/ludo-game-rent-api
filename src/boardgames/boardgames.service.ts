import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BoardGame } from 'src/schemas/boardgames.schema';

@Injectable()
export class BoardGamesService {
  constructor(
    @InjectModel(BoardGame.name) private boardgameModel: Model<BoardGame>,
  ) {}

  findAll(): Promise<BoardGame[]> {
    return this.boardgameModel.find().exec();
  }

  async findOneById(id: string): Promise<BoardGame> {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid ID format');
    const boardGame = await this.boardgameModel.findById(id).exec();
    if (!boardGame)
      throw new NotFoundException(`Board game with id ${id} not found`);
    return boardGame;
  }

  async findOneByName(name: string): Promise<BoardGame[]> {
    const searchName = name.toLowerCase().replace(/-/g, ' ');
    const boardGames = await this.boardgameModel
      .find({
        name: { $regex: new RegExp(`^${searchName}$`, 'i') },
      })
      .exec();
    if (!boardGames.length)
      throw new NotFoundException(`No board games found with name ${name}`);
    return boardGames;
  }

  create(boardGame: BoardGame): Promise<BoardGame> {
    return new this.boardgameModel(boardGame).save();
  }

  async update(id: string, boardGame: BoardGame): Promise<BoardGame> {
    const updatedBoardGame = await this.boardgameModel
      .findByIdAndUpdate(id, boardGame, { new: true })
      .exec();
    if (!updatedBoardGame)
      throw new NotFoundException(`Board game with id ${id} not found`);
    return updatedBoardGame;
  }

  async remove(id: string): Promise<void> {
    const result = await this.boardgameModel.findByIdAndDelete(id).exec();
    if (!result)
      throw new NotFoundException(`Board game with id: "${id}" not found`);
  }
}
