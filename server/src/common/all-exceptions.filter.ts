import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { PinoLogger } from 'nestjs-pino';
import type { Request, Response } from 'express';

/**
 * 全局异常过滤器：把所有未捕获错误以结构化形式写入 pino。
 *
 * - 4xx 走 warn，5xx 走 error
 * - 完整记录 stack、错误类型、请求路径、方法、reqId、当前 userId（若已认证）
 * - 仍然让 NestJS 把 HTTP 响应正常返回客户端
 */
@Injectable()
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly logger: PinoLogger,
    private readonly httpAdapterHost: HttpAdapterHost,
  ) {
    this.logger.setContext('Exception');
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request & { id?: string; user?: { id: number; username: string } }>();
    const res = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody =
      exception instanceof HttpException
        ? (exception.getResponse() as Record<string, unknown> | string)
        : { statusCode: status, message: 'Internal server error' };

    // 写日志：5xx error / 4xx warn
    const meta = {
      statusCode: status,
      method: req?.method,
      url: req?.url ?? httpAdapter.getRequestUrl(req),
      reqId: (req as any)?.id,
      userId: req?.user?.id,
      err: this.normalizeError(exception),
    };

    if (status >= 500) {
      this.logger.error(meta, 'Unhandled exception');
    } else {
      this.logger.warn(meta, 'Request rejected');
    }

    httpAdapter.reply(res, responseBody, status);
  }

  private normalizeError(e: unknown) {
    if (e instanceof Error) {
      return {
        type: e.name,
        message: e.message,
        stack: e.stack,
        // 一些 ORM 错误会带额外字段，例如 code, detail
        ...(typeof (e as any).code === 'string' ? { code: (e as any).code } : {}),
        ...(typeof (e as any).detail === 'string'
          ? { detail: (e as any).detail }
          : {}),
      };
    }
    return { value: e };
  }
}
