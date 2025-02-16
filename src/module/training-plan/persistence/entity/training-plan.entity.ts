import { TrainingPlanLevel } from '@src/module/training-plan/core/enum/training-plan-level.enum';
import { TrainingPlanType } from '@src/module/training-plan/core/enum/training-plan-type.enum';
import { TrainingPlanVisibility } from '@src/module/training-plan/core/enum/training-plan-visibility.enum';
import { DefaultEntity } from '@src/shared/module/persistence/typeorm/entity/default.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Day } from './day.entity';

@Entity({ name: 'training_plans' })
export class TrainingPlan extends DefaultEntity<TrainingPlan> {
  @Column({ type: 'varchar', nullable: false, unique: true, width: 255 })
  name: string;

  @OneToMany(() => Day, (day) => day.trainingPlan, { cascade: true })
  days: Day[];

  @Column({ type: 'uuid', nullable: false })
  authorId: string;

  @Column({ type: 'uuid', nullable: true })
  lastUpdatedBy?: string;

  @Column({ type: 'int', nullable: false })
  timeInDays: number;

  @Column({ type: 'enum', enum: TrainingPlanType, nullable: false })
  type: TrainingPlanType;

  @Column({ type: 'text', nullable: true })
  observation?: string;

  @Column({ type: 'text', nullable: true })
  pathology?: string;

  @Column({ type: 'enum', enum: TrainingPlanVisibility, nullable: false })
  visibility: TrainingPlanVisibility;

  @Column({ type: 'enum', enum: TrainingPlanLevel, nullable: false })
  level: TrainingPlanLevel;
}
