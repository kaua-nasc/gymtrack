import { DefaultEntity } from '@src/module/shared/module/persistence/typeorm/entity/default.entity';
import { Column, Entity, ManyToOne, type Relation } from 'typeorm';
import { TrainingPlan } from './training-plan.entity';

@Entity({ name: 'training_plan_comments' })
export class TrainingPlanComment extends DefaultEntity<TrainingPlanComment> {
  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({ type: 'uuid', nullable: false })
  authorId: string;

  @ManyToOne(
    () => TrainingPlan,
    (trainingPlan) => trainingPlan.comments,
    { onDelete: 'CASCADE' }
  )
  trainingPlan: Relation<TrainingPlan>;

  @Column({ type: 'uuid', nullable: false })
  trainingPlanId: string;
}
