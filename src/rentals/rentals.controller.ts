import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { RentalsService } from './rentals.service';
import { Rentals } from './schemas/rentals.schema';

@Controller('rentals')
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  @Get()
  findAll() {
    return this.rentalsService.findAll();
  }

  @Get('get-rentals-by-id/:id')
  async getRentalById(@Param('id') id: string) {
    return this.rentalsService.findRentalById(id);
  }

  @Get('get-rentals-by-user/:userId')
  async getUserById(@Param('userId') userId: string) {
    return this.rentalsService.findUserById(userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() rentals: Rentals) {
    return this.rentalsService.update(id, rentals);
  }

  @Post()
  create(@Body() rentals: Rentals) {
    return this.rentalsService.create(rentals);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rentalsService.remove(id);
  }
}
