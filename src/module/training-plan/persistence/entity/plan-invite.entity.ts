import { DefaultEntity } from '@src/module/shared/module/persistence/typeorm/entity/default.entity';
import { Column, Entity, ManyToOne, JoinColumn, type Relation } from 'typeorm';
import { PlanInviteStatus } from '../../core/enum/plan-invite-status.enum';
import { TrainingPlan } from './training-plan.entity';

@Entity({ name: 'plan_invites' })
export class PlanInvite extends DefaultEntity<PlanInvite> {
  @Column({ type: 'uuid', nullable: false })
  planId: string;

  @ManyToOne(
    () => TrainingPlan,
    (plan) => plan.invites,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'planId' })
  trainingPlan: Relation<TrainingPlan>;

  @Column({ type: 'uuid', nullable: false })
  senderId: string;

  @Column({ type: 'uuid', nullable: true })
  recipientId: string | null;

  @Column({ type: 'varchar', nullable: false, width: 255 })
  recipientEmail: string;

  @Column({
    type: 'enum',
    enum: PlanInviteStatus,
    default: PlanInviteStatus.PENDING,
  })
  status: PlanInviteStatus;
}
