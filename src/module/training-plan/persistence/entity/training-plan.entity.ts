import { TrainingPlanLevel } from '@src/module/training-plan/core/enum/training-plan-level.enum';
import { TrainingPlanType } from '@src/module/training-plan/core/enum/training-plan-type.enum';
import { TrainingPlanVisibility } from '@src/module/training-plan/core/enum/training-plan-visibility.enum';
import { DefaultEntity } from '@src/module/shared/module/persistence/typeorm/entity/default.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Day } from './day.entity';
import { PlanSubscription } from './plan-subscription.entity';
import { PlanAccessRequest } from './plan-access-request.entity';
import { PlanParticipant } from './plan-participant.entity';

@Entity({ name: 'training_plans' })
export class TrainingPlan extends DefaultEntity<TrainingPlan> {
  @Column({ type: 'varchar', nullable: false, unique: true, width: 255 })
  name: string;

  @OneToMany(() => Day, (day) => day.trainingPlan, { cascade: true })
  days: Day[];

  @Column({ type: 'uuid', nullable: false })
  authorId: string;

  @Column({ type: 'int', nullable: false })
  timeInDays: number;

  @Column({ type: 'enum', enum: TrainingPlanType, nullable: false })
  type: TrainingPlanType;

  @Column({ type: 'text', nullable: true })
  observation?: string;

  @Column({ type: 'text', nullable: true })
  pathology?: string;

  @Column({ type: 'enum', enum: TrainingPlanVisibility, nullable: false })
  visibility: TrainingPlanVisibility;

  @Column({ type: 'enum', enum: TrainingPlanLevel, nullable: false })
  level: TrainingPlanLevel;

  @Column({ type: 'int', nullable: true })
  maxSubscriptions?: number;

  @OneToMany(() => PlanSubscription, (subscription) => subscription.trainingPlan, {
    cascade: true,
  })
  planSubscriptions: PlanSubscription[];

  @OneToMany(() => PlanAccessRequest, (request) => request.trainingPlan, {
    cascade: true,
  })
  accessRequests: PlanAccessRequest[];

  @OneToMany(
    () => PlanParticipant,
    (privateParticipants) => privateParticipants.trainingPlan,
    { cascade: true }
  )
  privateParticipants: PlanParticipant[];
}
