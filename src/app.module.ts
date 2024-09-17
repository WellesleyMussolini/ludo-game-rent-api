import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BoardGamesModule } from './boardgames/boardgames.module';
import * as dotenv from 'dotenv';
import { UsersModule } from './users/users.module';

dotenv.config();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.DATABASE_URL),
    BoardGamesModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
