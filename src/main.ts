import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //ENABLING PIPES
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  //APPLICATION PORT
  //await app.listen(14000);
  await app.listen(14000);
}
bootstrap();
