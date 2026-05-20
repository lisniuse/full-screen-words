/**
 * 数据迁移脚本：将 ../data/*.json 导入 SQLite 的 words 表
 * 用法：cd server && npm run seed
 */
import 'reflect-metadata';
import * as fs from 'fs';
import * as path from 'path';
import { NestFactory } from '@nestjs/core';

import { AppModule } from '../app.module';
import { WordsService } from '../words/words.service';

async function main() {
  const dataDir = path.resolve(process.cwd(), '..', 'data');
  if (!fs.existsSync(dataDir)) {
    // eslint-disable-next-line no-console
    console.error(`找不到数据目录：${dataDir}`);
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule);
  const words = app.get(WordsService);

  const files = fs.readdirSync(dataDir).filter((f) => f.endsWith('.json'));
  // eslint-disable-next-line no-console
  console.log(`发现 ${files.length} 个单词缓存文件，开始导入...`);

  let ok = 0;
  let skipped = 0;
  for (const file of files) {
    const text = file.replace(/\.json$/, '');
    const full = path.join(dataDir, file);
    try {
      const raw = fs.readFileSync(full, 'utf8');
      // 校验是合法 JSON
      JSON.parse(raw);
      await words.upsertRaw(text, raw);
      ok += 1;
    } catch (err: any) {
      skipped += 1;
      // eslint-disable-next-line no-console
      console.warn(`跳过 ${file}：${err.message}`);
    }
  }
  // eslint-disable-next-line no-console
  console.log(`完成。成功 ${ok}，跳过 ${skipped}`);
  await app.close();
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
