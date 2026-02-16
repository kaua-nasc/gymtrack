import { DefaultEntity } from '@src/module/shared/module/persistence/typeorm/entity/default.entity';
import { Column, Entity, JoinColumn, OneToOne, type Relation } from 'typeorm';
import { PlanSubscription } from './plan-subscription.entity';

@Entity({ name: 'plan_subscription_privacy_settings' })
export class PlanSubscriptionPrivacySettings extends DefaultEntity<PlanSubscriptionPrivacySettings> {
  @OneToOne(
    () => PlanSubscription,
    (subscription) => subscription.privacySettings,
    {
      onDelete: 'CASCADE',
    }
  )
  @JoinColumn()
  planSubscription: Relation<PlanSubscription>;

  @Column({ default: true })
  shareProgress: boolean;

  @Column({ default: false })
  sharePersonalMetrics: boolean;
}
