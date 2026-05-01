import { Module } from '@nestjs/common';
import { AuthModule } from '../shared/module/auth/auth.module';
import { EmailModule } from '../shared/module/email/email.module';
import { DomainModuleIntegrationModule } from '../shared/module/integration/interface/domain-module-integration.module';
import { StorageModule } from '../shared/module/storage/storage.module';
import { AuthService } from './core/service/authentication.service';
import { TrainerRelationshipService } from './core/service/trainer-relationship.service';
import { UserFollowsService } from './core/service/user-follows.service';
import { UserManagementService } from './core/service/user-management.service';
import { UserMetricsService } from './core/service/user-metrics.service';
import { UserPrivacyService } from './core/service/user-privacy.service';
import { AuthController } from './http/rest/controller/auth.controller';
import { UserController } from './http/rest/controller/user.controller';
import { IdentityPersistenceModule } from './persistence/identity-persistence.module';
import { UserProfileController } from './http/rest/controller/user-profile.controller';
import { UserTrainerController } from './http/rest/controller/user-trainer.controller';

@Module({
  imports: [
    IdentityPersistenceModule,
    DomainModuleIntegrationModule,
    AuthModule,
    EmailModule,
    StorageModule,
  ],
  providers: [
    AuthService,
    UserManagementService,
    UserMetricsService,
    UserFollowsService,
    TrainerRelationshipService,
    UserPrivacyService,
  ],
  controllers: [
    AuthController,
    UserController,
    UserProfileController,
    UserTrainerController,
  ],
})
export class IdentityModule {}
