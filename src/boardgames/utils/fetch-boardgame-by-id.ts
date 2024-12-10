import { BadRequestException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { BoardGame } from '../schemas/boardgames.schema';

export async function fetchBoardGameById({
  boardGameModel,
  boardgameId,
}: {
  boardGameModel: Model<BoardGame>;
  boardgameId: string | Types.ObjectId;
}): Promise<BoardGame> {
  const isObjectIdValid: boolean = !Types.ObjectId.isValid(boardgameId);

  const boardgame: BoardGame = await boardGameModel
    .findById(boardgameId)
    .exec();

  const isNotFound: boolean = !boardgame;

  if (isObjectIdValid) {
    throw new BadRequestException(`Invalid board game ID: ${boardgameId}`);
  }

  if (isNotFound) {
    throw new BadRequestException(
      `BoardGame with id '${boardgameId}' not found.`,
    );
  }

  return boardgame;
}
