import { Model } from 'mongoose';
import { UpdateResult } from 'mongodb';
import { BoardGame } from 'src/boardgames/schemas/boardgames.schema';

export const updateRentedGame = async ({
  boardgame,
  boardGameModel,
  copies,
}: {
  boardgame: BoardGame;
  boardGameModel: Model<BoardGame>;
  copies: number;
}): Promise<UpdateResult> => {
  const updatedRentedGames: number = Math.max(
    0,
    parseInt(boardgame.rentedGames, 10) + copies,
  );

  return await boardGameModel
    .updateOne(
      { _id: boardgame['_id'] },
      { rentedGames: updatedRentedGames.toString() },
    )
    .exec();
};
