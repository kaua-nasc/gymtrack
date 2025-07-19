import { DefaultEntity } from '@src/module/shared/module/persistence/typeorm/entity/default.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Exercise } from './exercise.entity';
import { TrainingPlan } from './training-plan.entity';
import { PlanDayProgress } from './plan-day-progress.entity';

@Entity({ name: 'days' })
export class Day extends DefaultEntity<Day> {
  @Column({ type: 'varchar', nullable: false, unique: true, width: 255 })
  name: string;

  @Column({ type: 'uuid', nullable: false })
  trainingPlanId: string;

  @ManyToOne(() => TrainingPlan, (trainingPlan) => trainingPlan.days, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'trainingPlanId' })
  trainingPlan: TrainingPlan;

  @OneToMany(() => Exercise, (exercise) => exercise.day, { cascade: true })
  exercises: Exercise[];

  @OneToMany(() => PlanDayProgress, (planDayProgress) => planDayProgress.day, {
    cascade: true,
  })
  planDayProgress: PlanDayProgress;
}
