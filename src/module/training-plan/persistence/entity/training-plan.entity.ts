import { TrainingLevel } from '@src/module/training-plan/core/enum/training-level.enum';
import { TrainingType } from '@src/module/training-plan/core/enum/training-type.enum';
import { DefaultEntity } from '@src/shared/module/persistence/typeorm/entity/default.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Day } from './day.entity';

@Entity({ name: 'training_plans' })
export class TrainingPlan extends DefaultEntity<TrainingPlan> {
  @Column({ type: 'varchar', nullable: false })
  name: string;

  @OneToMany(() => Day, (day) => day.trainingPlan, { cascade: true })
  days: Day[];

  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @Column({ type: 'int', nullable: false })
  timeInDays: number;

  @Column({ type: 'enum', enum: TrainingType, nullable: false })
  type: TrainingType;

  @Column({ type: 'text', nullable: true })
  observation: string | null;

  @Column({ type: 'text', nullable: true })
  pathology: string | null;

  @Column({ type: 'enum', enum: TrainingLevel, nullable: false })
  level: TrainingLevel;
}
