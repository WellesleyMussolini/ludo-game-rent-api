import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { BoardGamesService } from './boardgames.service';
import { BoardGame } from 'src/boardgames/schemas/boardgames.schema';
import { CreateBoardGameDto } from './dto/boardgames.dto';

@Controller('boardgames')
export class BoardGamesController {
  constructor(private readonly boardGamesService: BoardGamesService) {}

  @Get()
  findAll() {
    return this.boardGamesService.findAll();
  }

  @Get('get-by-id/:id')
  async getById(@Param('id') id: string) {
    return this.boardGamesService.getById(id);
  }

  @Get('search-by-name')
  async findBoardgameByName(@Query('name') name?: string) {
    return this.boardGamesService.findByName(name);
  }

  @Post()
  create(@Body() boardGame: CreateBoardGameDto) {
    return this.boardGamesService.create(boardGame);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() boardGame: BoardGame) {
    return this.boardGamesService.update(id, boardGame);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.boardGamesService.remove(id);
  }
}
