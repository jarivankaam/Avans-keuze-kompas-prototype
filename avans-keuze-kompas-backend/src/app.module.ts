import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { VkmModule } from './vkm/vkm.module';
import { SyncModule } from './sync/sync.module';
import { AuthModule } from './auth/auth.module';
import configuration from './config/configuration';
import { ConfigValidationService } from './config/config-validation.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: ConfigValidationService.validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.url'),
      }),
    }),
    AuthModule,
    UsersModule,
    VkmModule,
    SyncModule,
  ],
})
export class AppModule {}
