import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { AppResolver } from './app.resolver';
import { IdentityModule } from './module/identity/identity.module';
import { TrainingPlanModule } from './module/training-plan/training-plan.module';
import { ConfigModule } from './shared/module/config/config.module';
import { TypeOrmPersistenceModule } from './shared/module/persistence/typeorm/typeorm-persistence.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: true,
      driver: ApolloDriver,
    }),
    ConfigModule.forRoot(),
    TypeOrmPersistenceModule.forRoot({}),
    IdentityModule,
    TrainingPlanModule,
  ],
  providers: [AppResolver],
})
export class AppModule {}
