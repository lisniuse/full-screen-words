import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserStats } from './user-stats.entity';
import { PracticeRecord } from '../../practice/entities/practice-record.entity';
import { CheckIn } from '../../checkin/entities/check-in.entity';
import { UserBadge } from '../../badges/entities/user-badge.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 32 })
  username: string;

  @Column({ type: 'varchar', length: 100 })
  passwordHash: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  nickname: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => UserStats, (s) => s.user)
  stats?: UserStats;

  @OneToMany(() => PracticeRecord, (r) => r.user)
  practiceRecords?: PracticeRecord[];

  @OneToMany(() => CheckIn, (c) => c.user)
  checkIns?: CheckIn[];

  @OneToMany(() => UserBadge, (ub) => ub.user)
  userBadges?: UserBadge[];
}
