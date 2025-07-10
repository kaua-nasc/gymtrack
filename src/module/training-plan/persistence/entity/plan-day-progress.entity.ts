import { DefaultEntity } from '@src/module/shared/module/persistence/typeorm/entity/default.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { PlanSubscription } from './plan-subscription.entity';
import { Day } from './day.entity';

@Entity({ name: 'plan_day_progress' })
export class PlanDayProgress extends DefaultEntity<PlanDayProgress> {
  @Column({ type: 'uuid', nullable: false })
  planSubscriptionId: string;

  @Column({ type: 'uuid', nullable: false })
  dayId: string;

  @ManyToOne(() => PlanSubscription, (subscription) => subscription.planDayProgress, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  planSubscription: PlanSubscription;

  @ManyToOne(() => Day, (day) => day.planDayProgress, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  day: Day;
}
