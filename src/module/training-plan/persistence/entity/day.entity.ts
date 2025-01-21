import { DefaultEntity } from '@src/shared/module/persistence/typeorm/entity/default.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { TrainingPlan } from './training-plan.entity';
import { Training } from './training.entity';

@Entity({ name: 'days' })
export class Day extends DefaultEntity<Day> {
  @OneToMany(() => Training, (training) => training.day, { cascade: true })
  trainings: Training[];

  @Column({ type: 'uuid', nullable: false })
  trainingPlanId: string;

  @ManyToOne(() => TrainingPlan, (trainingPlan) => trainingPlan.days, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  trainingPlan: TrainingPlan;
}
