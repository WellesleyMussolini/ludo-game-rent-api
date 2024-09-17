import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BoardGame, BoardGameSchema } from 'src/schemas/boardgames.schema';
import { BoardGamesService } from './boardgames.service';
import { BoardGamesController } from './boardgames.controller';

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
