import { Controller, Get, Body, Param, Put } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/schemas/users.schema';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('get-by-id/:id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() user: User) {
    return this.usersService.update(id, user);
  }
}
