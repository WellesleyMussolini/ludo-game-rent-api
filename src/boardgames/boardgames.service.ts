import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { BoardGame } from "src/schemas/boardgames.schema";


@Injectable()
export class BoardGamesService {
    constructor(@InjectModel(BoardGame.name) private boardgameModel: Model<BoardGame>) { }

    async findAll(): Promise<BoardGame[]> {
        return this.boardgameModel.find().exec();
    }

    async findOneById(id?: string): Promise<BoardGame> {
        if (id) {
            if (!Types.ObjectId.isValid(id)) {
                throw new BadRequestException('Invalid ID format');
            }
            try {
                const boardGame = await this.boardgameModel.findById(id).exec();
                if (!boardGame) {
                    throw new NotFoundException(`Board game with id ${id} not found`);
                }
                return boardGame;
            } catch (error) {
                throw new InternalServerErrorException(`Failed to find board game by id: ${error.message}`);
            }
        } else {
            throw new BadRequestException('No ID provided');
        }
    }

    async findOneByName(name?: string): Promise<BoardGame[]> {
        if (name) {
            try {
                const boardGames = await this.boardgameModel.find({ name: { $regex: name, $options: 'i' } }).exec();
                if (boardGames.length === 0) {
                    throw new NotFoundException(`No board games found with name ${name}`);
                }
                return boardGames;
            } catch (error) {
                throw new InternalServerErrorException(`Failed to find board game by name: ${error.message}`);
            }
        } else {
            throw new BadRequestException('No name provided');
        }
    }

    async create(boardGame: BoardGame): Promise<BoardGame> {
        const createdBoardGame = new this.boardgameModel(boardGame);
        return createdBoardGame.save();
    }

    async update(id: string, boardGame: BoardGame): Promise<BoardGame> {
        const updatedBoardGame = await this.boardgameModel.findByIdAndUpdate(id, boardGame, { new: true }).exec();
        if (!updatedBoardGame) {
            throw new NotFoundException(`Board game with id ${id} not found`);
        }
        return updatedBoardGame;
    }

    async remove(id: string): Promise<void> {
        const result = await this.boardgameModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException(`Board game with id ${id} not found`);
        }
    }
}