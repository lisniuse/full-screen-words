import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { WordsService } from './words.service';
import { RandomWordsQueryDto, WordInfoDto } from './dto/word-info.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('words')
export class WordsController {
  constructor(private readonly words: WordsService) {}

  @Get('random')
  random(@Query() q: RandomWordsQueryDto) {
    return { words: this.words.generateRandomWords(q.count ?? 200) };
  }

  // 单词释义：可能调用 OpenRouter，限制 20 次 / 分钟防止刷外网额度
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @UseGuards(JwtAuthGuard)
  @Post('info')
  info(@Body() dto: WordInfoDto) {
    return this.words.getWordInfo(dto.word);
  }
}
