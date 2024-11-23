import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Rentals, RentalSchema } from './schemas/rentals.schema';
import { RentalsService } from './rentals.service';
import { RentalsController } from './rentals.controller';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Rentals.name,
        schema: RentalSchema,
      },
    ]),
    SharedModule,
  ],
  providers: [RentalsService],
  controllers: [RentalsController],
  exports: [MongooseModule],
})
export class RentalsModule {}
