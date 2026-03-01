import { DefaultEntity } from '@src/module/shared/module/persistence/typeorm/entity/default.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'weight_logs' })
export class WeightLog extends DefaultEntity<WeightLog> {
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  weight: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  measuredAt: Date;

  @Column()
  userId: string;

  @ManyToOne(
    () => User,
    { onDelete: 'CASCADE' }
  )
  user: User;
}
