import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BoardGamesModule } from 'src/boardgames/boardgames.module';
import * as dotenv from 'dotenv';
import { UsersModule } from 'src/users/users.module';
import { ScheduleModule } from '@nestjs/schedule';
import { RentalStatusUpdaterService } from './services/rental-status-updater.service';
import { RentalsModule } from './rentals/rentals.module';
import { Rentals, RentalSchema } from './rentals/schemas/rentals.schema';

dotenv.config();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.DATABASE_URL),
    BoardGamesModule,
    UsersModule,
    RentalsModule,
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([{ name: Rentals.name, schema: RentalSchema }]),
  ],
  controllers: [],
  providers: [RentalStatusUpdaterService],
})
export class AppModule {}
