import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

const FORBIDDEN_SECRETS = new Set(['dev-secret', 'change-me', 'please-change-me-to-a-long-random-string']);

function validateConfig(config: ConfigService) {
  const secret = config.get<string>('JWT_SECRET');
  if (!secret) {
    throw new Error('[fatal] JWT_SECRET 未设置。请在 server/.env 中配置一个长随机字符串。');
  }
  if (secret.length < 16) {
    throw new Error('[fatal] JWT_SECRET 长度不足 16，太弱。请使用至少 32 字符的随机串。');
  }
  if (FORBIDDEN_SECRETS.has(secret)) {
    throw new Error('[fatal] JWT_SECRET 仍是模板默认值，必须改成真实随机串。');
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  validateConfig(config);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const corsOrigin = config.get<string>('CORS_ORIGIN') ?? 'http://localhost:2022';
  app.enableCors({
    origin: corsOrigin.split(',').map((o) => o.trim()),
    credentials: true,
  });

  const port = Number(config.get<string>('PORT') ?? 5321);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`[server] http://localhost:${port}`);
}

bootstrap();
