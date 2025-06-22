import { ExerciseType } from '@src/module/training-plan/core/enum/exercise-type.enum';
import { DefaultEntity } from '@src/module/shared/module/persistence/typeorm/entity/default.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Day } from './day.entity';

@Entity({ name: 'exercises' })
export class Exercise extends DefaultEntity<Exercise> {
  @Column({ type: 'varchar', nullable: false, unique: true, width: 255 })
  name: string;

  @Column({ type: 'uuid', nullable: false })
  dayId: string;

  @Column({ type: 'enum', enum: ExerciseType, nullable: false })
  type: ExerciseType;

  @Column({ type: 'int', nullable: false })
  setsNumber: number;

  @Column({ type: 'int', nullable: false })
  repsNumber: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  observation: string;

  @ManyToOne(() => Day, (day) => day.id, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  day: Day;
}
