import { Module } from '@nestjs/common';
import { PersistenceModule } from './persistence/persistence.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthService, jwtConstants } from './core/service/authentication.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { DomainModuleIntegrationModule } from '@src/shared/module/integration/interface/domain-module-integration.module';
import { AuthResolver } from './http/graphql/resolver/auth.resolver';
import { UserResolver } from './http/graphql/resolver/user.resolver';
import { UserManagementService } from './core/service/user-management.service';
import { UserRepository } from './persistence/repository/user.repository';
import {
  BillingSubscriptionPlanTrainingPlanQuantityApi,
  BillingSubscriptionStatusApi,
} from '@src/shared/module/integration/interface/billing-integration.interface';
import { BillingSubscriptionHttpClient } from '@src/shared/module/integration/client/billing-subscription-http.client';
import { TrainingPlanExistsApi } from '@src/shared/module/integration/interface/training-plan-integration.interface';
import { TrainingPlanHttpClient } from '@src/shared/module/integration/client/training-plan-http.client';

@Module({
  imports: [
    PersistenceModule.forRoot(),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60m' },
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: true,
      driver: ApolloDriver,
    }),
    DomainModuleIntegrationModule,
  ],
  providers: [
    {
      provide: BillingSubscriptionStatusApi,
      useExisting: BillingSubscriptionHttpClient,
    },
    {
      provide: BillingSubscriptionPlanTrainingPlanQuantityApi,
      useExisting: BillingSubscriptionHttpClient,
    },
    {
      provide: TrainingPlanExistsApi,
      useExisting: TrainingPlanHttpClient,
    },
    AuthService,
    AuthResolver,
    UserResolver,
    UserManagementService,
    UserRepository,
  ],
})
export class IdentityModule {}
