import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/users/schemas/users.schema';
import { Model } from 'mongoose';
import { handleErrors } from 'src/utils/handle-error';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async findAll(): Promise<User[]> {
    try {
      return await this.userModel.find().exec();
    } catch (error) {
      handleErrors({ error });
    }
  }

  async findById(id: string): Promise<User> {
    try {
      const user = await this.userModel.findById(id).exec();

      if (!user) {
        throw new NotFoundException();
      }

      return user;
    } catch (error) {
      handleErrors({ error, message: 'User Id not found' });
    }
  }

  async update(id: string, user: User): Promise<User> {
    try {
      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, user, { new: true, runValidators: true })
        .exec();

      if (!updatedUser) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      return updatedUser;
    } catch (error) {
      handleErrors({ error });
    }
  }
}
