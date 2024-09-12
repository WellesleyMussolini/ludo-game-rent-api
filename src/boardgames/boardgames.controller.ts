import { Controller, Get, Post, Body, Param, Put, Delete, Query, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { BoardGamesService } from './boardgames.service';
import { BoardGame } from 'src/schemas/boardgames.schema';

@Controller('boardgames')
export class BoardGamesController {
    constructor(private readonly boardGamesService: BoardGamesService) { }

    @Get()
    async findAll() {
        return this.boardGamesService.findAll();
    }

    @Get('search')
    async findOne(@Query('id') id?: string, @Query('name') name?: string) {
        try {
            if (id) {
                return this.boardGamesService.findOneById(id);
            } else if (name) {
                return this.boardGamesService.findOneByName(name);
            } else {
                throw new BadRequestException('No search criteria provided');
            }
        } catch (error) {
            throw new InternalServerErrorException(`Error in findOne: ${error.message}`);
        }
    }

    @Post()
    async create(@Body() boardGame: BoardGame) {
        return this.boardGamesService.create(boardGame);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() boardGame: BoardGame) {
        return this.boardGamesService.update(id, boardGame);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.boardGamesService.remove(id);
    }
}
