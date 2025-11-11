import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable cookie parser (required for reading cookies)
  app.use(cookieParser);

  // Enable CORS with credentials support
  app.enableCors({
    origin: 'http://akk-frontend.panel.evonix-development.tech',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Set-Cookie'],
  });

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(4000);
}
bootstrap();
