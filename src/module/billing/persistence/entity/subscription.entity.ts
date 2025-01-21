import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { DefaultEntity } from '@src/shared/module/persistence/typeorm/entity/default.entity';
import { Plan } from './plan.entity';
import { SubscriptionStatus } from '../../core/model/subscription.model';

@Entity({ name: 'subscriptions' })
export class Subscription extends DefaultEntity<Subscription> {
  @Column({ type: 'varchar' })
  userId: string;

  @Column({ type: 'varchar' })
  planId: string;

  @Column({ type: 'enum', enum: SubscriptionStatus })
  status: SubscriptionStatus;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate?: Date | null;

  @Column({ type: 'boolean', default: true })
  autoRenew: boolean = true;

  @ManyToOne(() => Plan, (plan) => plan.subscriptions, { nullable: false })
  @JoinColumn({ name: 'planId' }) // Define explicitamente o nome da coluna de chave estrangeira
  plan: Plan;
}
