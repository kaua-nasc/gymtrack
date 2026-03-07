import { DefaultEntity } from '@src/module/shared/module/persistence/typeorm/entity/default.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, type Relation } from 'typeorm';
import { PlanDayProgress } from './plan-day-progress.entity';
import { ActiveSetLog } from './active-set-log.entity';

@Entity({ name: 'active_workout_sessions' })
export class ActiveWorkoutSession extends DefaultEntity<ActiveWorkoutSession> {
  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @Column({ type: 'uuid', nullable: false })
  planDayProgressId: string;

  @Column({ type: 'uuid', nullable: true })
  currentExerciseId?: string;

  @Column({ type: 'int', default: 0 })
  currentSetIndex: number;

  @Column({ type: 'timestamp', nullable: true })
  restStartedAt?: Date;

  @Column({ type: 'int', nullable: true })
  adaptiveRestDurationSeconds?: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  startedAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastActiveAt: Date;

  @ManyToOne(() => PlanDayProgress, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'planDayProgressId' })
  planDayProgress: Relation<PlanDayProgress>;

  @OneToMany(() => ActiveSetLog, (log) => log.session)
  logs: Relation<ActiveSetLog[]>;
}
