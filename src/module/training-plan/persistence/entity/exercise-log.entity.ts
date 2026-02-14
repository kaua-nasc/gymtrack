import { DefaultEntity } from '@src/module/shared/module/persistence/typeorm/entity/default.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Exercise } from './exercise.entity';
import { User } from '@src/module/identity/persistence/entity/user.entity';

@Entity({ name: 'exercise_logs' })
export class ExerciseLog extends DefaultEntity<ExerciseLog> {
  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid', nullable: false })
  exerciseId: string;

  @ManyToOne(() => Exercise, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exerciseId' })
  exercise: Exercise;

  @Column({ type: 'simple-array', nullable: false })
  reps: number[];

  @Column({ type: 'simple-array', nullable: false })
  weight: number[];

  @Column({ type: 'text', nullable: true })
  notes?: string;
}
