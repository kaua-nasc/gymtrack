import { DefaultEntity } from '@src/module/shared/module/persistence/typeorm/entity/default.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TrainingPlan } from './training-plan.entity';
import { PlanAccessRequestStatus } from '../../core/enum/plan-access-request-status.enum';

@Entity('plan_access_request')
export class PlanAccessRequest extends DefaultEntity<PlanAccessRequest> {
  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @Column({ type: 'uuid', nullable: false })
  trainingPlanId: string;

  @ManyToOne(() => TrainingPlan, (trainingPlan) => trainingPlan.accessRequests, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'trainingPlanId' })
  trainingPlan: TrainingPlan;

  @Column({ type: 'enum', nullable: false, enum: PlanAccessRequestStatus })
  status: PlanAccessRequestStatus;
}
