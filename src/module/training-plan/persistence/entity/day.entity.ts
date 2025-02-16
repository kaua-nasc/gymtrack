import { DefaultEntity } from '@src/shared/module/persistence/typeorm/entity/default.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Exercise } from './exercise.entity';
import { TrainingPlan } from './training-plan.entity';

@Entity({ name: 'days' })
export class Day extends DefaultEntity<Day> {
  @Column({ type: 'varchar', nullable: false, unique: true, width: 255 })
  name: string;

  @OneToMany(() => Exercise, (exercise) => exercise.day, { cascade: true })
  exercises: Exercise[];

  @Column({ type: 'uuid', nullable: false })
  trainingPlanId: string;

  @ManyToOne(() => TrainingPlan, (trainingPlan) => trainingPlan.days, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  trainingPlan: TrainingPlan;
}
