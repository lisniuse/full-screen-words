import {
  BadRequestException,
  ConflictException,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User } from '../users/entities/user.entity';
import { UserStats } from '../users/entities/user-stats.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  /**
   * 用户不存在时与该假 hash 做一次 bcrypt.compare，保持响应耗时与正常路径一致，
   * 防止攻击者通过响应时间差枚举用户名。
   */
  private dummyHash = '';

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(UserStats) private readonly stats: Repository<UserStats>,
    private readonly jwt: JwtService,
  ) {}

  async onModuleInit() {
    // 任意常量字符串，仅用于一致的 bcrypt 耗时；rounds 与真实密码相同
    this.dummyHash = await bcrypt.hash(
      '__not_a_real_password_placeholder__',
      10,
    );
  }

  async register(dto: RegisterDto) {
    const exists = await this.users.findOne({ where: { username: dto.username } });
    if (exists) throw new ConflictException('用户名已被注册');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.users.create({
      username: dto.username,
      passwordHash,
      nickname: dto.nickname ?? dto.username,
    });
    await this.users.save(user);

    const stats = this.stats.create({ userId: user.id });
    await this.stats.save(stats);

    return this.signToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findOne({ where: { username: dto.username } });
    // 无论用户是否存在都走一次 bcrypt.compare，保证耗时一致
    const hashToCheck = user?.passwordHash ?? this.dummyHash;
    const ok = await bcrypt.compare(dto.password, hashToCheck);
    if (!user || !ok) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    return this.signToken(user);
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('用户不存在');
    const ok = await bcrypt.compare(dto.oldPassword, user.passwordHash);
    if (!ok) throw new UnauthorizedException('原密码错误');
    if (dto.oldPassword === dto.newPassword) {
      throw new BadRequestException('新密码不能与原密码相同');
    }
    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.users.save(user);
    return { ok: true };
  }

  private signToken(user: User) {
    const token = this.jwt.sign({ sub: user.id, username: user.username });
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
      },
    };
  }
}
