import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { RentalStatus } from 'src/rentals/types/rental.types';

@Schema({ collection: 'rentals' })
export class Rentals {
  @Prop({
    type: Types.ObjectId,
    required: true,
    validate: {
      validator: Types.ObjectId.isValid,
      message: 'Invalid user id format',
    },
  })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  userName: string;

  @Prop({
    type: String,
    required: true,
    validate: {
      validator: (cpf: string) => !!cpf,
      message: 'CPF is required to rent a boardgame.',
    },
  })
  userCpf: string;

  @Prop({ type: String, required: true })
  userImage: string;

  @Prop({ type: String, required: true })
  userEmail: string;

  @Prop({
    type: Types.ObjectId,
    required: true,
    validate: {
      validator: Types.ObjectId.isValid,
      message: 'Invalid boardgame id format',
    },
  })
  boardgameId: Types.ObjectId;

  @Prop({ type: String, required: true })
  boardgameName: string;

  @Prop({ type: String, required: true })
  boardgameImage: string;

  @Prop({ type: String, required: true })
  rentalDurationDays: string;

  @Prop({ type: Date, required: false })
  rentalStartDate?: Date;

  @Prop({ type: Date, required: false })
  rentalEndDate?: Date;

  @Prop({
    type: String,
    enum: RentalStatus,
    required: false,
    default: RentalStatus.ACTIVE,
  })
  rentalStatus?: RentalStatus;

  @Prop({
    type: Date,
    required: false,
    validate: {
      validator: function (this: Rentals, date: Date) {
        return !this.rentalStartDate || date > this.rentalStartDate;
      },
      message: 'ReturnedAt date must be later than rental start date',
    },
  })
  returnedAt?: Date;

  @Prop({ type: String, required: true })
  price: string;
}

export const RentalSchema = SchemaFactory.createForClass(Rentals);
