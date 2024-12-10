import { Model } from 'mongoose';
import { UpdateResult } from 'mongodb';
import { BoardGame } from 'src/boardgames/schemas/boardgames.schema';

export const updateRentedGame = async ({
  boardgame,
  boardGameModel,
  adjust,
}: {
  boardgame: BoardGame;
  boardGameModel: Model<BoardGame>;
  adjust: number;
}): Promise<UpdateResult> => {
  const updatedRentedGames: number = Math.max(
    0,
    parseInt(boardgame.rentedGames, 10) + adjust,
  );

  return await boardGameModel
    .updateOne(
      { _id: boardgame['_id'] },
      { rentedGames: updatedRentedGames.toString() },
    )
    .exec();
};
