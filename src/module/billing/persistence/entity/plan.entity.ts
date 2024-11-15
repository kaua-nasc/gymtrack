import { DefaultEntity } from '@src/shared/module/persistence/typeorm/entity/default.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { PlanInterval } from '../../core/model/plan.model';
import { Subscription } from './subscription.entity';

@Entity({ name: 'plans' })
export class Plan extends DefaultEntity<Plan> {
  @Column({ nullable: false, type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  description?: string | null;

  @Column({ nullable: false, type: 'varchar' })
  amount: string;

  @Column({ nullable: false, type: 'varchar' })
  currency: string;

  @Column({ nullable: false, type: 'enum', enum: PlanInterval })
  interval: PlanInterval;

  @Column({ type: 'int' })
  trialPeriod: number | null = null;

  @Column({ type: 'int' })
  trainingPlanQuantity: number;

  @OneToMany(() => Subscription, (sub) => sub.plan)
  subscriptions?: Subscription[];
}
