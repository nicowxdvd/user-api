import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  const configService = app.get(ConfigService);
  await app.listen(configService.get<number>('PORT') ?? 3001);

}
bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
