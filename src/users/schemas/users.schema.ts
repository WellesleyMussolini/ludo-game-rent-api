import { BadRequestException } from '@nestjs/common';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { roles } from 'src/users/constants/user';

@Schema({ collection: 'user' })
export class User {
  @Prop({ required: [true, "The 'name' field can't be empty."] })
  name: string;

  @Prop({ required: [true, "The 'email' field can't be empty."] })
  email: string;

  @Prop({
    type: Date,
    required: false,
    default: null,
  })
  emailVerified: Date | null;

  @Prop({ required: [true, "The 'image' field can't be empty."] })
  image: string;

  @Prop({
    validate: {
      validator: (role: string) => {
        if (!role) {
          throw new BadRequestException("The field 'role' can't be empty");
        }
      },
    },
    enum: {
      values: roles,
      message: `The field 'role' must be one of the following values: ${roles.join(', ')}`,
    },
    required: [true, "The 'role' field can't be empty."],
  })
  role: string;
}

export const UsersSchema = SchemaFactory.createForClass(User);
