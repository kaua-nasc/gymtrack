import { DefaultEntity } from '@src/module/shared/module/persistence/typeorm/entity/default.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TrainingPlan } from './training-plan.entity';

@Entity('plan_participant')
export class PlanParticipant extends DefaultEntity<PlanParticipant> {
  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @Column({ type: 'uuid', nullable: false })
  trainingPlanId: string;

  @ManyToOne(() => TrainingPlan, (trainingPlan) => trainingPlan.privateParticipants, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'trainingPlanId' })
  trainingPlan: TrainingPlan;

  @Column({ type: 'timestamp' })
  expiration_date: Date;

  @Column({ type: 'timestamp' })
  approved_at: Date;
}
