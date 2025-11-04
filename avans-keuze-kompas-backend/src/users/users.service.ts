import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findAll() {
    return this.userModel.find().exec();
  }

  async findOne(id: string) {
    return this.userModel.findById(id).exec();
  }
  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    return user.save();
  }

  async update(id: string, data: Partial<CreateUserDto>) {
    return this.userModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string) {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async setRecommendedVkms(userId: string, vkmIds: string[]) {
    const user = await this.userModel
      .findByIdAndUpdate(userId, { recommended_vkms: vkmIds }, { new: true })
      .populate('recommended_vkms');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
