import { BadRequestException } from '@nestjs/common';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { status } from 'src/boardgames/constants/boardgame';

@Schema()
export class BoardGame {
  @Prop({ required: [true, "The 'name' field can't be empty."] })
  name: string;

  @Prop({ type: String, required: [true, "The 'image' field can't be empty."] })
  image: string;

  @Prop({
    required: [true, "The 'status' field can't be empty."],
    enum: {
      values: status,
      message: `The field 'status' must be one of the following values: ${status.join(', ')}`,
    },
    validate: {
      validator: (status: string) => {
        if (!status) {
          throw new BadRequestException("The field 'role' can't be empty");
        }
      },
    },
  })
  status: string;

  @Prop({
    required: [true, "The 'price' field can't be empty."],
  })
  price: string;

  @Prop({
    required: [true, "The 'ageToPlay' field can't be empty."],
  })
  ageToPlay: string;

  @Prop({
    required: [true, "The 'description' field can't be empty."],
  })
  description: string;

  @Prop({
    required: [true, "The 'playTime' field can't be empty."],
  })
  playTime: string;

  @Prop({
    required: [true, "The 'minimumPlayersToPlay' field can't be empty."],
  })
  minimumPlayersToPlay: string;

  @Prop({
    required: [true, "The 'maximumPlayersToPlay' field can't be empty."],
  })
  maximumPlayersToPlay: string;

  @Prop({
    required: [true, "The 'rentalDurationDays' field can't be empty."],
    type: String,
  })
  rentalDurationDays: string;
}

export const BoardGameSchema = SchemaFactory.createForClass(BoardGame);
