import { Module } from '@nestjs/common';
import { ConfigModule } from '@src/module/shared/module/config/config.module';
import { ConfigService } from '@src/module/shared/module/config/service/config.service';
import { TypeOrmPersistenceModule } from '@src/module/shared/module/persistence/typeorm/typeorm-persistence.module';
import { UserRepository } from './repository/user.repository';
import { dataSourceOptionsFactory } from './typeorm-datasource.factory';

@Module({
  imports: [
    TypeOrmPersistenceModule.forRoot({
      name: 'identity',
      imports: [ConfigModule.forRoot()],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return dataSourceOptionsFactory(configService);
      },
    }),
  ],
  providers: [UserRepository],
  exports: [UserRepository],
})
export class IdentityPersistenceModule {}
