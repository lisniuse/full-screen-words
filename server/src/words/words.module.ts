import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Word } from './entities/word.entity';
import { WordsService } from './words.service';
import { WordsController } from './words.controller';
import { OpenRouterService } from './openrouter.service';

@Module({
  imports: [TypeOrmModule.forFeature([Word])],
  providers: [WordsService, OpenRouterService],
  controllers: [WordsController],
  exports: [WordsService],
})
export class WordsModule {}
