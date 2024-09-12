import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BoardGamesModule } from './boardgames/boardgames.module';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.DATABASE_URL),
    BoardGamesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }