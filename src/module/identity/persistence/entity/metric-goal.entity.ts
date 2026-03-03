import { DefaultEntity } from '@src/module/shared/module/persistence/typeorm/entity/default.entity';
import { Column, Entity, ManyToOne, type Relation } from 'typeorm';
import { User } from './user.entity';
import { MetricGoalStatus } from '../../core/enum/metric-goal-status.enum';

@Entity({ name: 'metric_goals' })
export class MetricGoal extends DefaultEntity<MetricGoal> {
  @Column()
  type: string; // 'WEIGHT' or MeasurementType

  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? Number(value) : value),
    },
  })
  startingValue: number;

  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? Number(value) : value),
    },
  })
  targetValue: number;

  @Column({ type: 'timestamp', nullable: true })
  deadline?: Date;

  @Column({ type: 'timestamp', nullable: true })
  achievedAt?: Date;

  @Column({ type: 'enum', enum: MetricGoalStatus, default: MetricGoalStatus.ACTIVE })
  status: MetricGoalStatus;

  @Column()
  userId: string;

  @ManyToOne(
    () => User,
    { onDelete: 'CASCADE' }
  )
  user: Relation<User>;
}
