import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { BillingSubscriptionHttpClient } from '@src/shared/module/integration/client/billing-subscription-http.client';
import { TrainingPlanHttpClient } from '@src/shared/module/integration/client/training-plan-http.client';
import {
  BillingSubscriptionPlanTrainingPlanQuantityApi,
  BillingSubscriptionStatusApi,
} from '@src/shared/module/integration/interface/billing-integration.interface';
import { DomainModuleIntegrationModule } from '@src/shared/module/integration/interface/domain-module-integration.module';
import {
  TrainingPlanCompleteApi,
  TrainingPlanExistsApi,
  TrainingPlanUpdateToInProgressApi,
} from '@src/shared/module/integration/interface/training-plan-integration.interface';
import { CreateUserUseCase } from './application/use-case/create-user.use-case';
import { GetUserUseCase } from './application/use-case/get-user.use-case';
import { UpdateUserAddCurrentTrainingPlanUseCase } from './application/use-case/update-user-add-current-training-plan.use-case';
import { UpdateUserCurrentTrainingPlanUseCase } from './application/use-case/update-user-current-training-plan.use-case';
import { UpdateUserFinishCurrentTrainingPlanUseCase } from './application/use-case/update-user-finish-current-training-plan.use-case';
import { UpdateUserNextTrainingPlanUseCase } from './application/use-case/update-user-next-training-plan.use-case';
import { AuthService, jwtConstants } from './core/service/authentication.service';
import { UserManagementService } from './core/service/user-management.service';
import { AuthResolver } from './http/graphql/resolver/auth.resolver';
import { UserResolver } from './http/graphql/resolver/user.resolver';
import { UserController } from './http/rest/controller/user.controller';
import { PersistenceModule } from './persistence/persistence.module';
import { UserRepository } from './persistence/repository/user.repository';

@Module({
  imports: [
    PersistenceModule.forRoot(),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60m' },
    }),
    //GraphQLModule.forRoot<ApolloDriverConfig>({
    //  autoSchemaFile: true,
    //  driver: ApolloDriver,
    //}),
    DomainModuleIntegrationModule,
  ],
  providers: [
    { provide: BillingSubscriptionStatusApi, useExisting: BillingSubscriptionHttpClient },
    {
      provide: BillingSubscriptionPlanTrainingPlanQuantityApi,
      useExisting: BillingSubscriptionHttpClient,
    },
    { provide: TrainingPlanCompleteApi, useExisting: TrainingPlanHttpClient },
    { provide: TrainingPlanExistsApi, useExisting: TrainingPlanHttpClient },
    { provide: TrainingPlanUpdateToInProgressApi, useExisting: TrainingPlanHttpClient },
    AuthService,
    AuthResolver,
    UserResolver,
    UserManagementService,
    CreateUserUseCase,
    GetUserUseCase,
    UpdateUserNextTrainingPlanUseCase,
    UpdateUserCurrentTrainingPlanUseCase,
    UpdateUserAddCurrentTrainingPlanUseCase,
    UserRepository,
    UpdateUserFinishCurrentTrainingPlanUseCase,
  ],
  controllers: [UserController],
})
export class IdentityModule {}
