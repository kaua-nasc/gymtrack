import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmPersistenceModule } from '@src/shared/module/persistence/typeorm/typeorm-persistence.module';
import { TrainingPlanRepository } from './repository/training-plan.repository';
import { TrainingPlan } from './entity/training-plan.entity';
import { Day } from './entity/day.entity';
import { Exercise } from './entity/exercise.entity';
import { Training } from './entity/training.entity';

@Module({})
export class TrainingPlanPersistenceModule {
  static forRoot(opts?: { migrations?: string[] }): DynamicModule {
    const { migrations } = opts || {};
    return {
      module: TrainingPlanPersistenceModule,
      imports: [
        TypeOrmPersistenceModule.forRoot({
          migrations,
          entities: [TrainingPlan, Day, Training, Exercise],
        }),
      ],
      providers: [TrainingPlanRepository],
      exports: [TrainingPlanRepository],
    };
  }
}
