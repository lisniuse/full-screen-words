import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('badges')
export class Badge {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  code: string;

  @Column({ type: 'varchar', length: 64 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'varchar', length: 16, default: '🏅' })
  icon: string;

  @Column({ type: 'varchar', length: 16, default: 'common' })
  tier: string;

  @Index()
  @Column({ type: 'integer', default: 0 })
  sortOrder: number;
}
