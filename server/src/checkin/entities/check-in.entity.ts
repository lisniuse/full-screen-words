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

@Entity('check_ins')
@Index(['userId', 'date'], { unique: true })
export class CheckIn {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (u) => u.checkIns, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  /** YYYY-MM-DD */
  @Column({ type: 'varchar', length: 10 })
  date: string;

  @Column({ type: 'integer', default: 0 })
  expReward: number;

  @CreateDateColumn()
  createdAt: Date;
}
