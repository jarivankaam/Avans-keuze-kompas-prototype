import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { VkmModule } from './vkm/vkm.module';
import { SyncModule } from './sync/sync.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://jari_db_user:JNOHtMfl9bJvBqR6@cluster0.7tvrpj5.mongodb.net/VKM?retryWrites=true&w=majority&appName=Cluster0',
    ),
    AuthModule,
    UsersModule,
    VkmModule,
    SyncModule,
  ],
})
export class AppModule {}
