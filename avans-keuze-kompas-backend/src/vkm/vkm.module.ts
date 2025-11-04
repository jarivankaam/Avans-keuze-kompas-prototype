import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Vkm, VkmSchema } from './schemas/vkm.schema';
import { VkmService } from './vkm.service';
import { VkmController } from './vkm.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Vkm.name, schema: VkmSchema, collection: 'VKM' },
    ]),
  ],
  controllers: [VkmController],
  providers: [VkmService],
})
export class VkmModule {}
