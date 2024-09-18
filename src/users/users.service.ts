import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/users.schema';
import { Model } from 'mongoose';
import { handleErrors } from 'src/utils/handle-error';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOneById(id: string): Promise<User> {
    try {
      const user = await this.userModel.findById(id).exec();

      // REDUNDANTE
      if (!user) {
        throw new NotFoundException();
      }

      return user;
    } catch (error) {
      if (!id) {
        throw new NotFoundException("User id can't be empty");
      }
      handleErrors({ error, message: 'User Id not found', id });
    }
  }

  async update(id: string, user: User): Promise<User> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, user, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return updatedUser;
  }
}
