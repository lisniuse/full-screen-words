import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { PracticeService } from './practice.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../common/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('practice')
export class PracticeController {
  constructor(private readonly practice: PracticeService) {}

  @Post('submit')
  submit(@CurrentUser() user: CurrentUserPayload, @Body() dto: SubmitAnswerDto) {
    return this.practice.submit(user.id, dto);
  }

  @Post('learned/:word')
  learned(@CurrentUser() user: CurrentUserPayload, @Param('word') word: string) {
    return this.practice.markLearned(user.id, word);
  }

  @Get('mastered/:word')
  mastered(@CurrentUser() user: CurrentUserPayload, @Param('word') word: string) {
    return this.practice.getMasteredExamples(user.id, word);
  }

  @Get('learned-words')
  learnedWords(@CurrentUser() user: CurrentUserPayload) {
    return this.practice.listLearnedWords(user.id);
  }

  @Get('recent')
  recent(
    @CurrentUser() user: CurrentUserPayload,
    @Query('limit') limit?: string,
  ) {
    const n = limit ? Math.min(parseInt(limit, 10) || 20, 100) : 20;
    return this.practice.listRecent(user.id, n);
  }
}
