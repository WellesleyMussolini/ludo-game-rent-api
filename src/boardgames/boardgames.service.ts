import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BoardGame } from 'src/boardgames/schemas/boardgames.schema';
import { handleErrors } from 'src/utils/handle-error';
import { CreateBoardGameDto } from './dto/boardgames.dto';

// BUGS

/* 
BUG: SE O VALOR DO ID ESTIVER VAZIO O RETORNO NO POSTMAN VAI SER:
{
    "message": "BoardGame name can't be empty",
    "error": "Not Found",
    "statusCode": 404
}


BUG: O JOGO MONOPOLY NAO PODE SER ENCONTRADO PELO ID E ELE FOI CRIADO PELO POSTMAN.
O JOGO PODE SER ENCONTRADO PELO NAME MAS NÃO PELO ID.

{
    "message": "BoardGame id not found",
    "error": "Not Found",
    "statusCode": 404
}

BUG: AS MENSAGES DE ERROR AO CRIAR UM JOGO COM UM DOS CAMPOS VAZIOS ESTÁ SENDO:

{
    "statusCode": 500,
    "message": "Internal server error"
}

DEVERIA SER UMA DAS MENSAGEMS QUE ESTÁ NO DTO E NÃO "INTERNAL SERVER ERROR".
*/

@Injectable()
export class BoardGamesService {
  constructor(
    @InjectModel(BoardGame.name)
    private boardgameModel: Model<BoardGame>,
  ) {}

  findAll(): Promise<BoardGame[]> {
    return this.boardgameModel.find().exec();
  }

  async findOneById(id: string): Promise<BoardGame> {
    try {
      const boardgame = await this.boardgameModel.findById(id).exec();

      const boardgameNotFound = Types.ObjectId.isValid(id) || !boardgame;

      // PARECE SER REDUNDANTE ESSA LOGIC MAS POR ALGUM MOTIVO, MAS SEM ELA QUANDO NÃO ENCONTRADO O ID, O VALOR RETORNADO É UM OBJETO VAZIO
      if (boardgameNotFound) {
        throw new NotFoundException({
          error: 'BoardGame Not Found',
          statusCode: 404,
          message: `BoardGame '${id}' not found.`,
        });
      }

      return boardgame;
    } catch (error) {
      if (!id) {
        throw new NotFoundException("BoardGame id can't be empty");
      }
      handleErrors({ error, message: `BoardGame id not found` });
    }
  }

  async findOneByName(name: string): Promise<BoardGame[]> {
    try {
      const searchName = name.toLowerCase().replace(/-/g, ' ');

      const boardgames = await this.boardgameModel
        .find({
          name: { $regex: new RegExp(`^${searchName}$`, 'i') },
        })
        .exec();

      const boardgameNotFound =
        boardgames.length === 0 || !boardgames.length || !boardgames;

      // PARECE SER REDUNDANTE ESSA LOGIC MAS POR ALGUM MOTIVO, MAS SEM ELA QUANDO NÃO ENCONTRADO O NAME, O VALOR RETORNADO É UM ARRAY VAZIO
      if (boardgameNotFound) {
        throw new NotFoundException({
          error: 'BoardGame Not Found',
          statusCode: 404,
          message: `BoardGame '${name}' not found.`,
        });
      }

      return boardgames;
    } catch (error) {
      const isNameEmpty = !name || !name.length || name.length === 0;
      if (isNameEmpty) {
        throw new NotFoundException("BoardGame name can't be empty");
      }
      handleErrors({
        error,
        message: `BoardGame '${name}' not found`,
      });
    }
  }

  async findOne({
    id,
    name,
  }: {
    id?: string;
    name?: string;
  }): Promise<BoardGame | Array<BoardGame>> {
    return id ? this.findOneById(id) : this.findOneByName(name);
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
    const updatedBoardGame = await this.boardgameModel
      .findByIdAndUpdate(id, boardGame, { new: true })
      .exec();

    if (!updatedBoardGame) {
      throw new NotFoundException(`Board game with id ${id} not found`);
    }

    return updatedBoardGame;
  }

  async remove(id: string): Promise<void> {
    const result = await this.boardgameModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Board game with id: "${id}" not found`);
    }
  }
}
