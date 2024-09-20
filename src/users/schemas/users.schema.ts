import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { roles } from 'src/users/constants/user';

@Schema({ collection: 'user' })
export class User {
  @Prop({ required: [true, "The 'name' field can't be empty."] })
  name: string;

  @Prop({ required: [true, "The 'email' field can't be empty."] })
  email: string;

  @Prop({
    type: Boolean,
    required: [true, "The 'emailVerified' field can't be empty."],
    default: false,
  })
  emailVerified: boolean;

  @Prop({ required: [true, "The 'image' field can't be empty."] })
  image: string;

  @Prop({
    enum: roles,
    validate: {
      validator: function (value: string) {
        return value && roles.includes(value);
      },
    },
    required: [true, "The 'role' field can't be empty."],
  })
  role: string;
}

export const UsersSchema = SchemaFactory.createForClass(User);
