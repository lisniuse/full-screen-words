import { resolve } from 'path';
import type { ConfigService } from '@nestjs/config';
import type { Params } from 'nestjs-pino';

/**
 * 构建 nestjs-pino 的 LoggerModule 选项。
 *
 * - 开发：彩色 pretty 输出，level=debug
 * - 生产：结构化 JSON，stdout + 按天/按大小滚动写入 LOG_DIR/app.log，level=info
 * - HTTP 自动埋点，按响应状态分级，敏感头自动 redact
 * - 默认排除常见噪音路径（health/metrics）
 */
export function buildPinoOptions(config: ConfigService): Params {
  const isProd = (config.get<string>('NODE_ENV') ?? 'development') === 'production';
  const level = config.get<string>('LOG_LEVEL') ?? (isProd ? 'info' : 'debug');
  const logDir = resolve(config.get<string>('LOG_DIR') ?? './logs');

  const prettyTarget = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      singleLine: false,
      translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
      ignore: 'pid,hostname,req.headers,res.headers',
      messageFormat: '{context} {msg}',
    },
  };

  const fileTarget = {
    target: 'pino-roll',
    options: {
      file: resolve(logDir, 'app.log'),
      frequency: 'daily',
      mkdir: true,
      size: '20m',
      dateFormat: 'yyyy-MM-dd',
      // Windows 默认不允许非管理员建 symlink，关掉避免 EPERM；
      // 文件名里已带日期，识别活跃文件按时间排序即可（按需求开管理员或 Dev Mode 才打开）
      symlink: false,
    },
    level,
  };

  // dev: pretty 彩色 console + 同时落盘
  // prod: stdout JSON + 落盘（同样滚动）
  const transport = isProd
    ? {
        targets: [
          { target: 'pino/file', options: { destination: 1 }, level },
          fileTarget,
        ],
      }
    : {
        targets: [
          { ...prettyTarget, level },
          fileTarget,
        ],
      };

  return {
    pinoHttp: {
      level,
      transport,

      // 请求级日志分级：5xx -> error, 4xx -> warn, 其余 info
      customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },

      // 敏感字段脱敏
      redact: {
        paths: [
          'req.headers.authorization',
          'req.headers.cookie',
          'req.body.password',
          'req.body.oldPassword',
          'req.body.newPassword',
        ],
        censor: '[REDACTED]',
      },

      // 不打印健康检查 / 静态资源等噪音
      autoLogging: {
        ignore: (req) => {
          const url = req.url ?? '';
          return url.startsWith('/health') || url.startsWith('/metrics');
        },
      },

      // 精简 req/res 序列化，避免 dump 一堆无用 headers
      serializers: {
        req(req) {
          return {
            method: req.method,
            url: req.url,
            remoteAddress: req.remoteAddress,
          };
        },
        res(res) {
          return { statusCode: res.statusCode };
        },
      },
    },
  };
}
