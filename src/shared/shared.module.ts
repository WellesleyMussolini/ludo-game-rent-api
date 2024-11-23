import { Module } from '@nestjs/common';
import { SharedService } from './shared.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Rentals, RentalSchema } from 'src/rentals/schemas/rentals.schema';
import {
  BoardGame,
  BoardGameSchema,
} from 'src/boardgames/schemas/boardgames.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Rentals.name, schema: RentalSchema },
      { name: BoardGame.name, schema: BoardGameSchema },
    ]),
  ],
  providers: [SharedService],
  exports: [SharedService],
})
export class SharedModule {}
