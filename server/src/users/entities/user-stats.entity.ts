import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_stats')
export class UserStats {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (u) => u.stats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @Column({ type: 'integer', default: 0 })
  totalExp: number;

  @Column({ type: 'integer', default: 0 })
  combo: number;

  @Column({ type: 'integer', default: 0 })
  maxCombo: number;

  @Column({ type: 'integer', default: 0 })
  totalAnswers: number;

  @Column({ type: 'integer', default: 0 })
  correctAnswers: number;

  /** 累计学习/查询过的不同单词数（去重） */
  @Column({ type: 'integer', default: 0 })
  wordsLearned: number;

  /** 连续打卡天数 */
  @Column({ type: 'integer', default: 0 })
  streakDays: number;

  /** 最长连续打卡天数 */
  @Column({ type: 'integer', default: 0 })
  longestStreak: number;

  /** 最近一次打卡日期（YYYY-MM-DD） */
  @Column({ type: 'varchar', length: 10, nullable: true })
  lastCheckInDate: string | null;

  @UpdateDateColumn()
  updatedAt: Date;
}
