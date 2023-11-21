import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CamelizePipe } from './pipes/camelize.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const CLIENT_WEB = process.env.CLIENT_WEB;
  const origin = [CLIENT_WEB];
  app.enableCors({
    origin,
  });
  app.useGlobalPipes(
    new CamelizePipe(),

    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  await app.listen(3000);
}
bootstrap();
