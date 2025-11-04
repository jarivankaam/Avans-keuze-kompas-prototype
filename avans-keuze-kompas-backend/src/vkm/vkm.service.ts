import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vkm } from './schemas/vkm.schema';
import { CreateVkmDto } from './dto/create-vkm.dto';

@Injectable()
export class VkmService {
  constructor(@InjectModel(Vkm.name) private model: Model<Vkm>) {}

  async findAll() {
    return this.model.find().exec();
  }

  async findOne(id: string) {
    return this.model.findById(id).exec();
  }

  async create(data: CreateVkmDto) {
    return new this.model(data).save();
  }

  async update(id: string, data: Partial<CreateVkmDto>) {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string) {
    return this.model.findByIdAndDelete(id).exec();
  }
}