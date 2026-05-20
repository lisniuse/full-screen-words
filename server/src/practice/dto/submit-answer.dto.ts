import { IsInt, IsString, Length, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SubmitAnswerDto {
  @IsString()
  @Length(1, 64)
  word: string;

  @IsString()
  @Length(1, 32)
  formType: string;

  /** 例句索引（在该 formType 的 examples 数组中的下标） */
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(20)
  exampleIndex: number;

  /** 用户输入 */
  @IsString()
  @Length(0, 1000)
  actual: string;
}
