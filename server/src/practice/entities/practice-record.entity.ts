import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('practice_records')
@Index(['userId', 'createdAt'])
export class PracticeRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (u) => u.practiceRecords, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @Column({ type: 'varchar', length: 64 })
  word: string;

  @Column({ type: 'varchar', length: 32 })
  formType: string;

  @Column({ type: 'text' })
  expected: string;

  @Column({ type: 'text' })
  actual: string;

  @Column({ type: 'boolean' })
  correct: boolean;

  @Column({ type: 'integer', default: 0 })
  expGained: number;

  @Column({ type: 'integer', default: 0 })
  comboAtTime: number;

  @CreateDateColumn()
  createdAt: Date;
}
