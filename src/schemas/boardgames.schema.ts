import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class BoardGame {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  price: string;

  @Prop({ required: true })
  ageToPlay: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  playTime: string;

  @Prop({ required: true })
  minimumPlayersToPlay: string;

  @Prop({ required: true })
  maximumPlayersToPlay: string;
}

export const BoardGameSchema = SchemaFactory.createForClass(BoardGame);
