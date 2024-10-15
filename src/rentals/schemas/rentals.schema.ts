import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { RentalHistory } from 'src/types/rental.types';
import { User } from 'src/users/schemas/users.schema';
import { HandleRentalValidator } from '../services/handle-rental-validator';

@Schema({ collection: 'rentals' })
export class Rentals {
  @Prop({ type: Object, required: true })
  user: User;

  @Prop({
    type: Array<RentalHistory>,
    required: true,
    validate: { validator: HandleRentalValidator },
  })
  rentalHistory: RentalHistory[];
}

export const RentalSchema = SchemaFactory.createForClass(Rentals);
