import { IsString, Length, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @Length(6, 64)
  oldPassword: string;

  @IsString()
  @Length(6, 64)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: '新密码至少包含 1 位字母与 1 位数字',
  })
  newPassword: string;
}
