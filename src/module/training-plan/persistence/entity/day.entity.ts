import { DefaultEntity } from '@src/shared/module/persistence/typeorm/entity/default.entity';
import { Entity, ManyToOne, OneToMany } from 'typeorm';
import { TrainingPlan } from './training-plan.entity';
import { Training } from './training.entity';

@Entity({ name: 'days' })
export class Day extends DefaultEntity<Day> {
  @OneToMany(() => Training, (training) => training.day, { cascade: true })
  trainings: Training[];

  @ManyToOne(() => TrainingPlan, (trainingPlan) => trainingPlan.days, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  trainingPlan: TrainingPlan;
}
