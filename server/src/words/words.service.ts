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

    const payload = await this.openrouter.fetchWordInfo(word);

    const record = this.words.create({ text: word, payload });
    await this.words.save(record);

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
