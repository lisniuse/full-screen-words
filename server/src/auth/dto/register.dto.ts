import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @Length(3, 32)
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: '用户名仅允许字母、数字、下划线和短横线' })
  username: string;

  @IsString()
  @Length(6, 64)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: '密码至少包含 1 位字母与 1 位数字',
  })
  password: string;

  @IsOptional()
  @IsString()
  @Length(1, 32)
  nickname?: string;
}
