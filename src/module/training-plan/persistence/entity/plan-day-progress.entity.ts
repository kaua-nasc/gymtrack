import { DefaultEntity } from '@src/module/shared/module/persistence/typeorm/entity/default.entity';
import { Column, Entity, JoinColumn, ManyToOne, type Relation } from 'typeorm';
import { PlanDayProgressStatus } from '../../core/enum/plan-day-progress-status.enum';
import { Day } from './day.entity';
import { PlanSubscription } from './plan-subscription.entity';

@Entity({ name: 'plan_day_progress' })
export class PlanDayProgress extends DefaultEntity<PlanDayProgress> {
  @Column({ type: 'uuid', nullable: false })
  planSubscriptionId: string;

  @Column({ type: 'uuid', nullable: false })
  dayId: string;

  @Column({
    type: 'enum',
    enum: PlanDayProgressStatus,
    default: PlanDayProgressStatus.IN_PROGRESS,
  })
  status: PlanDayProgressStatus;

  @ManyToOne(
    () => PlanSubscription,
    (subscription) => subscription.planDayProgress,
    {
      nullable: false,
      onDelete: 'CASCADE',
    }
  )
  @JoinColumn({ name: 'planSubscriptionId' })
  planSubscription: PlanSubscription;

  @ManyToOne(
    () => Day,
    (day) => day.planDayProgress,
    {
      nullable: false,
      onDelete: 'CASCADE',
    }
  )
  @JoinColumn({ name: 'dayId' })
  day: Relation<Day>;
}
