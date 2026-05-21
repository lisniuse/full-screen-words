import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { Word } from './entities/word.entity';
import { OpenRouterService } from './openrouter.service';

interface WordEntry {
  word: string;
  translations?: { translation: string; type?: string }[];
  phrases?: { phrase: string; translation: string }[];
}

export interface LevelMeta {
  id: string;
  label: string;
  count: number;
}

interface LoadedLevel extends LevelMeta {
  words: string[];
}

@Injectable()
export class WordsService implements OnModuleInit {
  private readonly logger = new Logger(WordsService.name);

  /** 同一单词的并发请求共享同一 Promise，避免重复打 OpenRouter + 写库竞态 */
  private readonly inflight = new Map<string, Promise<any>>();

  /** 加载到内存的词库：每个等级一组英文单词数组 */
  private levels: LoadedLevel[] = [];
  /** 所有词库的小写单词并集，作为 /words/info 的白名单 */
  private masterSet = new Set<string>();

  constructor(
    @InjectRepository(Word) private readonly words: Repository<Word>,
    private readonly openrouter: OpenRouterService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    const dir =
      this.config.get<string>('WORDLISTS_DIR') ??
      resolve(process.cwd(), '..', 'data', 'wordlists');
    const indexPath = resolve(dir, 'index.json');
    if (!existsSync(indexPath)) {
      throw new Error(`wordlist index not found: ${indexPath}`);
    }

    const metaList: LevelMeta[] = JSON.parse(readFileSync(indexPath, 'utf8'));
    const loaded: LoadedLevel[] = [];
    for (const meta of metaList) {
      const file = resolve(dir, `${meta.id}.json`);
      if (!existsSync(file)) {
        this.logger.warn(`wordlist ${meta.id} missing file ${file}, skipped`);
        continue;
      }
      const raw: WordEntry[] = JSON.parse(readFileSync(file, 'utf8'));
      const words = raw
        .map((e) => (typeof e.word === 'string' ? e.word.trim() : ''))
        .filter(Boolean);
      loaded.push({ id: meta.id, label: meta.label, count: words.length, words });
      for (const w of words) this.masterSet.add(w.toLowerCase());
    }
    this.levels = loaded;
    this.logger.log(
      `loaded ${loaded.length} wordlists, master whitelist size ${this.masterSet.size}`,
    );
  }

  listLevels(): LevelMeta[] {
    return this.levels.map(({ id, label, count }) => ({ id, label, count }));
  }

  /** 从指定等级里随机抽取 count 个不重复单词；level 不存在则回退到第一个 */
  generateRandomWords(levelId: string | undefined, count: number): string[] {
    const level =
      this.levels.find((l) => l.id === levelId) ?? this.levels[0];
    if (!level) return [];
    const n = Math.max(1, Math.min(count, 3000));
    const pool = level.words;
    const k = Math.min(n, pool.length);
    // Fisher-Yates 部分洗牌：O(k)，避免拷贝整个池子
    const arr = pool.slice();
    for (let i = 0; i < k; i++) {
      const j = i + Math.floor(Math.random() * (arr.length - i));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, k);
  }

  async getWordInfo(word: string) {
    if (!word || typeof word !== 'string') {
      throw new BadRequestException('无效的单词参数');
    }
    if (this.masterSet.size > 0 && !this.masterSet.has(word.toLowerCase())) {
      throw new BadRequestException('不支持的单词');
    }

    const existing = await this.words.findOne({ where: { text: word } });
    if (existing) {
      return this.safeParse(existing.payload);
    }

    // 同 word 并发：共享 in-flight Promise
    const cached = this.inflight.get(word);
    if (cached) return cached;

    const promise = this.fetchAndPersist(word).finally(() => {
      this.inflight.delete(word);
    });
    this.inflight.set(word, promise);
    return promise;
  }

  private async fetchAndPersist(word: string) {
    const payload = await this.openrouter.fetchWordInfo(word);

    // upsert 而非 save：即便另一进程已写入，也只更新而不抛 UNIQUE
    await this.words.upsert({ text: word, payload }, ['text']);

    return this.safeParse(payload);
  }

  /** 直接写入（用于 seed） */
  async upsertRaw(word: string, payload: string) {
    const existing = await this.words.findOne({ where: { text: word } });
    if (existing) {
      existing.payload = payload;
      return this.words.save(existing);
    }
    return this.words.save(this.words.create({ text: word, payload }));
  }

  /** 仅从缓存读取，不调外网。脏数据会被清理。返回 null 表示无缓存。 */
  async getCachedInfo(word: string): Promise<any | null> {
    const row = await this.words.findOne({ where: { text: word } });
    if (!row) return null;
    try {
      return JSON.parse(row.payload);
    } catch {
      // 脏数据：删除以便下次重拉
      await this.words.remove(row);
      return null;
    }
  }

  private safeParse(payload: string) {
    try {
      return JSON.parse(payload);
    } catch {
      return null;
    }
  }
}
