import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Vkm, VkmSchema } from '../vkm/schemas/vkm.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema, collection: 'users' },
      { name: Vkm.name, schema: VkmSchema, collection: 'VKM' },
    ]),
  ],
  controllers: [SyncController],
  providers: [SyncService],
})
export class SyncModule {}