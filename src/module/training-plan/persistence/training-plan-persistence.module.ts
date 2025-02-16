import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@src/shared/module/config/config.module';
import { TypeOrmPersistenceModule } from '@src/shared/module/persistence/typeorm/typeorm-persistence.module';
import { DataSource } from 'typeorm';
import { Day } from './entity/day.entity';
import { Exercise } from './entity/exercise.entity';
import { TrainingPlanProgress } from './entity/training-plan-progress.entity';
import { TrainingPlan } from './entity/training-plan.entity';
import { DayRepository } from './repository/day.repository';
import { ExerciseRepository } from './repository/exercise.repository';
import { TrainingPlanProgressRepository } from './repository/training-plan-progress.repository';
import { TrainingPlanRepository } from './repository/training-plan.repository';

@Module({})
export class TrainingPlanPersistenceModule {
  static forRoot(opts?: { migrations?: string[] }): DynamicModule {
    const { migrations } = opts || {};
    return {
      module: TrainingPlanPersistenceModule,
      imports: [
        TypeOrmPersistenceModule.forRoot({
          migrations,
          entities: [TrainingPlan, Day, Exercise, TrainingPlanProgress],
        }),
        ConfigModule.forRoot(),
      ],
      providers: [
        {
          provide: TrainingPlanRepository,
          useFactory: function (datasource: DataSource) {
            return new TrainingPlanRepository(datasource.manager);
          },
          inject: [DataSource],
        },
        {
          provide: DayRepository,
          useFactory: (datasource: DataSource) => new DayRepository(datasource.manager),
          inject: [DataSource],
        },
        {
          provide: ExerciseRepository,
          useFactory: (datasource: DataSource) =>
            new ExerciseRepository(datasource.manager),
          inject: [DataSource],
        },
        {
          provide: TrainingPlanProgressRepository,
          useFactory: (datasource: DataSource) =>
            new TrainingPlanProgressRepository(datasource.manager),
          inject: [DataSource],
        },
      ],
      exports: [
        TrainingPlanRepository,
        DayRepository,
        ExerciseRepository,
        TrainingPlanProgressRepository,
      ],
    };
  }
}
