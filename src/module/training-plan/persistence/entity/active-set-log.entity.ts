import { DefaultEntity } from '@src/module/shared/module/persistence/typeorm/entity/default.entity';
import { Column, Entity, JoinColumn, ManyToOne, type Relation } from 'typeorm';
import { ActiveWorkoutSession } from './active-workout-session.entity';
import { Exercise } from './exercise.entity';

@Entity({ name: 'active_set_logs' })
export class ActiveSetLog extends DefaultEntity<ActiveSetLog> {
  @Column({ type: 'uuid', nullable: false })
  sessionId: string;

  @Column({ type: 'uuid', nullable: false })
  exerciseId: string;

  @Column({ type: 'int', nullable: false })
  setIndex: number;

  @Column({ type: 'int', nullable: false })
  reps: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: false })
  weight: number;

  @Column({ type: 'int', nullable: true })
  rpe?: number;

  @ManyToOne(() => ActiveWorkoutSession, (session) => session.logs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sessionId' })
  session: Relation<ActiveWorkoutSession>;

  @ManyToOne(() => Exercise, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exerciseId' })
  exercise: Relation<Exercise>;
}
