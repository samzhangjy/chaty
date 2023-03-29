import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as fs from 'fs';

async function bootstrap() {
  const configApp: NestExpressApplication = await NestFactory.create(AppModule);
  const config: ConfigService = configApp.get(ConfigService);
  const privateKeyLoc = config.get<string>('HTTPS_PRIVATE_KEY');
  const certLoc = config.get<string>('HTTPS_PUBLIC_CERT');

  const httpsOptions = {
    key: privateKeyLoc ? fs.readFileSync(privateKeyLoc) : undefined,
    cert: certLoc ? fs.readFileSync(certLoc) : undefined,
  };

  console.log(
    `\x1b[34m[Https] Chaty configured with private key at ${privateKeyLoc} and certifacate at ${certLoc}.\x1b[0m`,
  );

  const app: NestExpressApplication = await NestFactory.create(AppModule, {
    httpsOptions,
  });
  const port: number = config.get<number>('PORT');

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(port, () => {
    console.log(
      `\x1b[34m[Web] Chaty available on ${config.get<string>(
        'BASE_URL',
      )}.\x1b[0m`,
    );
  });
}

bootstrap();
