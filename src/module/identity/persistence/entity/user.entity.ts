import { DefaultEntity } from '@src/shared/module/persistence/typeorm/entity/default.entity';
import { Entity, Column, ManyToMany } from 'typeorm';
import { TrainingPlan } from './training-plan.entity';

@Entity({ name: 'users' })
export class User extends DefaultEntity<User> {
  @Column({ type: 'varchar', length: 100, nullable: false })
  firstName: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  lastName: string;

  @Column({ type: 'varchar', length: 150, unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  password: string;

  @ManyToMany(() => TrainingPlan, (trainingPlan) => trainingPlan.users, { cascade: true })
  trainingPlans: TrainingPlan[];
}
