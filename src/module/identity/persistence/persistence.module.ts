import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmPersistenceModule } from '@src/shared/module/persistence/typeorm/typeorm-persistence.module';
import { User } from './entity/user.entity';
import { UserRepository } from './repository/user.repository';

@Module({})
export class PersistenceModule {
  static forRoot(opts?: { migrations?: string[] }): DynamicModule {
    const { migrations } = opts || {};
    return {
      module: PersistenceModule,
      imports: [
        TypeOrmPersistenceModule.forRoot({
          migrations,
          entities: [User],
        }),
      ],
      providers: [UserRepository],
      exports: [UserRepository],
    };
  }
}
