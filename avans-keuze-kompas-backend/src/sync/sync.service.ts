import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import { User } from '../users/schemas/user.schema';
import { Vkm } from '../vkm/schemas/vkm.schema';

@Injectable()
export class SyncService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Vkm.name) private vkmModel: Model<Vkm>,
  ) {}

  private readonly n8nWebhookUrl =
    'https://n8n.srv1048217.hstgr.cloud/webhook-test/a291d2db-bb14-4f78-b677-c0656f5bf00c';

  async sendAllUsersAndVkmToN8n() {
    const users = await this.userModel.find().select('group').exec();
    const vkm = await this.vkmModel.find().exec();

    const payload = { users, vkm };
    const response = await axios.post(this.n8nWebhookUrl, payload);
    return { status: response.status, data: response.data };
  }

  async sendUserAndVkmToN8n(userId: string) {
    const user = await this.userModel.findById(userId).select('group').exec();
    if (!user) throw new NotFoundException('User not found');

    const vkm = await this.vkmModel.find().exec();
    const payload = { user, vkm };
    const response = await axios.post(this.n8nWebhookUrl, payload);
    return { status: response.status, data: response.data };
  }
}
