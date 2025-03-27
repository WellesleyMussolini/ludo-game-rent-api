import { Model, Types } from 'mongoose';
import { BoardGame } from '../schemas/boardgames.schema';

export async function fetchBoardGameById({
  boardGameModel,
  boardgameId,
}: {
  boardGameModel: Model<BoardGame>;
  boardgameId: string | Types.ObjectId;
}): Promise<BoardGame> {
  const boardgame: BoardGame = await boardGameModel
    .findById(boardgameId)
    .exec();
  return boardgame;
}
