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
