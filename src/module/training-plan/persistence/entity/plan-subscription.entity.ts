import { DefaultEntity } from '@src/module/shared/module/persistence/typeorm/entity/default.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { TrainingPlan } from './training-plan.entity';
import { PlanDayProgress } from './plan-day-progress.entity';
import { PlanSubscriptionStatus } from '../../core/enum/plan-subscription-status.enum';

@Entity({ name: 'plan_subscription' })
export class PlanSubscription extends DefaultEntity<PlanSubscription> {
  @Column({ type: 'uuid', nullable: false })
  trainingPlanId: string;

  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @Column({
    type: 'enum',
    enum: PlanSubscriptionStatus,
    default: PlanSubscriptionStatus.notStarted,
  })
  status: PlanSubscriptionStatus;

  @OneToMany(
    () => PlanDayProgress,
    (planDayProgress) => planDayProgress.planSubscription,
    { cascade: true }
  )
  planDayProgress: PlanDayProgress;

  @ManyToOne(() => TrainingPlan, (trainingPlan) => trainingPlan.planSubscriptions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'trainingPlanId' })
  trainingPlan: TrainingPlan;
}
