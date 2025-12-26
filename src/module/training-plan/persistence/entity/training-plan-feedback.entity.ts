import { DefaultEntity } from '@src/module/shared/module/persistence/typeorm/entity/default.entity';
import { Column, Entity, JoinColumn, ManyToOne, type Relation } from 'typeorm';
import { TrainingPlan } from './training-plan.entity';

@Entity({ name: 'training_plan_feedbacks' })
export class TrainingPlanFeedback extends DefaultEntity<TrainingPlanFeedback> {
  @Column({ type: 'uuid', nullable: false })
  trainingPlanId: string;

  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @Column({ type: 'decimal', nullable: false })
  rating: number;

  @Column({ type: 'text', nullable: true })
  message: string | null;

  @ManyToOne(() => TrainingPlan, (trainingPlan) => trainingPlan.feedbacks, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'trainingPlanId' })
  trainingPlan: Relation<TrainingPlan>;
}
