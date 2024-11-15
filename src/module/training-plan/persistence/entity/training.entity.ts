import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Day } from './day.entity';
import { DefaultEntity } from '@src/shared/module/persistence/typeorm/entity/default.entity';
import { Exercise } from './exercise.entity';

@Entity({ name: 'trainings' })
export class Training extends DefaultEntity<Training> {
  title: string;

  @ManyToOne(() => Day, (day) => day.trainings, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  day: Day;

  @OneToMany(() => Exercise, (exercise) => exercise.training, { cascade: true })
  exercises: Exercise[];
}
