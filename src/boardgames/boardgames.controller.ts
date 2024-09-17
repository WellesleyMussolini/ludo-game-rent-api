import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { BoardGamesService } from './boardgames.service';
import { BoardGame } from 'src/boardgames/schemas/boardgames.schema';

@Controller('boardgames')
export class BoardGamesController {
  constructor(private readonly boardGamesService: BoardGamesService) {}

  @Get()
  findAll() {
    return this.boardGamesService.findAll();
  }

  @Get('search')
  async findOne(@Query('id') id?: string, @Query('name') name?: string) {
    if (!id && !name) {
      throw new BadRequestException('No search criteria provided');
    }
    return id
      ? this.boardGamesService.findOneById(id)
      : this.boardGamesService.findOneByName(name);
  }

  @Post()
  create(@Body() boardGame: BoardGame) {
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
