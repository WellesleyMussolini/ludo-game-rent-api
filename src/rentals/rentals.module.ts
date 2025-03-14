import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Rentals, RentalSchema } from './schemas/rentals.schema';
import { RentalsService } from './rentals.service';
import { RentalsController } from './rentals.controller';
import { BoardGamesModule } from 'src/boardgames/boardgames.module';
import { UsersModule } from 'src/users/users.module';
import { User, UsersSchema } from 'src/users/schemas/users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Rentals.name,
        schema: RentalSchema,
      },
      {
        name: User.name,
        schema: UsersSchema,
      },
    ]),
    BoardGamesModule,
    UsersModule,
  ],
  providers: [RentalsService],
  controllers: [RentalsController],
  exports: [MongooseModule],
})
export class RentalsModule {}
