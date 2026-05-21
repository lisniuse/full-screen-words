import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as randomWordsPkg from 'random-words';

import { Word } from './entities/word.entity';
import { OpenRouterService } from './openrouter.service';

const wordList: string[] = (randomWordsPkg as any).wordList ?? [];
const generate = (randomWordsPkg as any).generate;

@Injectable()
export class WordsService {
  /** 同一单词的并发请求共享同一 Promise，避免重复打 OpenRouter + 写库竞态 */
  private readonly inflight = new Map<string, Promise<any>>();

  constructor(
    @InjectRepository(Word) private readonly words: Repository<Word>,
    private readonly openrouter: OpenRouterService,
  ) {}

  generateRandomWords(count: number): string[] {
    const c = Math.max(1, Math.min(count, 2000));
    return generate({ exactly: c });
  }

  async getWordInfo(word: string) {
    if (!word || typeof word !== 'string') {
      throw new BadRequestException('无效的单词参数');
    }
    if (wordList.length > 0 && !wordList.includes(word)) {
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
