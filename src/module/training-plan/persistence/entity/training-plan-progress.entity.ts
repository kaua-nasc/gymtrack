import { TrainingPlanProgressStatus } from '@src/module/training-plan/core/enum/training-plan-progress-status.enum';
import { DefaultEntity } from '@src/module/shared/module/persistence/typeorm/entity/default.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'training_plans_progress' })
export class TrainingPlanProgress extends DefaultEntity<TrainingPlanProgress> {
  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @Column({ type: 'uuid', nullable: false })
  trainingPlanId: string;

  @Column({ type: 'enum', enum: TrainingPlanProgressStatus, nullable: false })
  status: TrainingPlanProgressStatus;
}
