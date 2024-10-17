import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { RentalStatus } from 'src/rentals/types/rental.types';

@Schema({ collection: 'rentals' })
export class Rentals {
  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  userName: string;

  @Prop({ type: String, required: true })
  userImage: string;

  @Prop({ type: String, required: true })
  userEmail: string;

  @Prop({ type: Types.ObjectId, required: true })
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

  @Prop({ type: String, required: true })
  price: string;
}

export const RentalSchema = SchemaFactory.createForClass(Rentals);
