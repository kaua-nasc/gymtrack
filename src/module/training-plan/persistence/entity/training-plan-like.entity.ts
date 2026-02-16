import { DefaultEntity } from '@src/module/shared/module/persistence/typeorm/entity/default.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, type Relation } from 'typeorm';
import { TrainingPlan } from './training-plan.entity';

@Index(['trainingPlanId', 'likedBy'], { unique: true })
@Entity({ name: 'training_plan_likes' })
export class TrainingPlanLike extends DefaultEntity<TrainingPlanLike> {
  @Column({ type: 'uuid', nullable: false })
  likedBy: string;

  @Column({ type: 'uuid', nullable: false })
  trainingPlanId: string;

  @ManyToOne(
    () => TrainingPlan,
    (trainingPlan) => trainingPlan.likes,
    {
      nullable: false,
      onDelete: 'CASCADE',
    }
  )
  @JoinColumn({ name: 'trainingPlanId' })
  trainingPlan: Relation<TrainingPlan>;
}
