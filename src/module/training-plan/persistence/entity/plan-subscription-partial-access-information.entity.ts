import { DefaultEntity } from '@src/module/shared/module/persistence/typeorm/entity/default.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { PlanSubscription } from './plan-subscription.entity';

@Entity('plan_subscription_partial_access_information')
export class PlanSubscriptionPartialAccessInformation extends DefaultEntity<PlanSubscriptionPartialAccessInformation> {
  @Column({ type: 'uuid', nullable: true })
  planSubscriptionId: string;

  @OneToOne(
    () => PlanSubscription,
    (subscription) => subscription.partialAccessInformation,
    {
      onDelete: 'CASCADE',
    }
  )
  @JoinColumn({ name: 'planSubscriptionId' })
  planSubscription: PlanSubscription;

  @Column({ type: 'boolean', default: false })
  showDayProgress: boolean;
}
