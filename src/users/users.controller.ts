import { Controller, Get, Body, Param, Put, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './schemas/users.schema';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('search')
  async findOne(@Query('id') id: string) {
    return this.usersService.findOneById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() user: User) {
    return this.usersService.update(id, user);
  }
}
