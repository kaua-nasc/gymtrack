import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmPersistenceModule } from '@src/shared/module/persistence/typeorm/typeorm-persistence.module';
import { UserRepository } from './repository/user.repository';
import { User } from './entity/user.entity';
import { TrainingPlan } from './entity/training-plan.entity';

@Module({})
export class PersistenceModule {
  static forRoot(opts?: { migrations?: string[] }): DynamicModule {
    const { migrations } = opts || {};
    return {
      module: PersistenceModule,
      imports: [
        TypeOrmPersistenceModule.forRoot({
          migrations,
          entities: [User, TrainingPlan],
        }),
      ],
      providers: [UserRepository],
      exports: [UserRepository],
    };
  }
}
