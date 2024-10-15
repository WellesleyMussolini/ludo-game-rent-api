import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Rentals, RentalSchema } from './schemas/rentals.schema';
import { RentalsService } from './rentals.service';
import { RentalsController } from './rentals.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Rentals.name,
        schema: RentalSchema,
      },
    ]),
  ],
  providers: [RentalsService],
  controllers: [RentalsController],
})
export class RentalsModule {}
