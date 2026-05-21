import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger as PinoLogger } from 'nestjs-pino';
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
  // bufferLogs: 在 pino 加载前的启动阶段日志先缓冲，等 useLogger 注入后统一冲刷
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(PinoLogger));

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
  app.get(PinoLogger).log(`Listening on http://localhost:${port}`, 'Bootstrap');
}

bootstrap();
