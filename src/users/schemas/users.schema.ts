import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'user' })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ type: Boolean, required: false, default: null })
  emailVerified: boolean | null;

  @Prop({ required: true })
  image: string;

  @Prop({
    enum: ['USER', 'ADMIN'],
    required: true,
  })
  role: string;
}

export const UsersSchema = SchemaFactory.createForClass(User);
