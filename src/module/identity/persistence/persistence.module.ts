import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmPersistenceModule } from '@src/shared/module/persistence/typeorm/typeorm-persistence.module';
import { User } from './entity/user.entity';
import { UserRepository } from './repository/user.repository';

@Module({})
export class PersistenceModule {
  static forRoot(): DynamicModule {
    return {
      module: PersistenceModule,
      imports: [TypeOrmPersistenceModule.forFeature([User])],
      providers: [UserRepository],
      exports: [UserRepository],
    };
  }
}
