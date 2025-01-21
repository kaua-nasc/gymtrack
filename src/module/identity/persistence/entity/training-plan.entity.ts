import { DefaultEntity } from '@src/shared/module/persistence/typeorm/entity/default.entity';
import { Entity, ManyToMany } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'user_training_plans' })
export class TrainingPlan extends DefaultEntity<TrainingPlan> {
  @ManyToMany(() => User, (user) => user.trainingPlans, {
    onDelete: 'CASCADE',
  })
  users: User[];
}
