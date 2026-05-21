import { IsInt, IsOptional, IsString, Length, Matches, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class WordInfoDto {
  @IsString()
  @Length(1, 64)
  word: string;
}

export class RandomWordsQueryDto {
  @IsOptional()
  @IsString()
  @Length(1, 32)
  @Matches(/^[a-zA-Z0-9_-]+$/)
  level?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(3000)
  count?: number;
}
