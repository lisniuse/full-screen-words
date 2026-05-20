import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class WordInfoDto {
  @IsString()
  @Length(1, 64)
  word: string;
}

export class RandomWordsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2000)
  count?: number;
}
