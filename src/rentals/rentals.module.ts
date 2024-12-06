import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Rentals, RentalSchema } from './schemas/rentals.schema';
import { RentalsService } from './rentals.service';
import { RentalsController } from './rentals.controller';
import { BoardGamesModule } from 'src/boardgames/boardgames.module';
import { UpdateRentedGames } from './services/update-rented-games.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Rentals.name,
        schema: RentalSchema,
      },
    ]),
    BoardGamesModule,
  ],
  providers: [RentalsService, UpdateRentedGames],
  controllers: [RentalsController],
  exports: [MongooseModule],
})
export class RentalsModule {}
