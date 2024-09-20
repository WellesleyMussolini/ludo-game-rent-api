import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  BoardGame,
  BoardGameSchema,
} from 'src/boardgames/schemas/boardgames.schema';
import { BoardGamesService } from 'src/boardgames/boardgames.service';
import { BoardGamesController } from 'src/boardgames/boardgames.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: BoardGame.name,
        schema: BoardGameSchema,
      },
    ]),
  ],
  providers: [BoardGamesService],
  controllers: [BoardGamesController],
})
export class BoardGamesModule {}
