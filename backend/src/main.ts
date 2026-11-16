/* istanbul ignore file */
import Config from './config.js';

import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument, observeEnabled } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: observeEnabled ? ObserveInstrument : undefined,
  });

  app.enableCors({
    origin: Config.CORS_ORIGIN
  });

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(Config.PORT ?? 3001, () => console.log(`Running backend at ${Config.PORT}`));
}
await bootstrap();
