import { Module } from '@nestjs/common';
import { IdentityPersistenceModule } from './persistence/identity-persistence.module';
import { DomainModuleIntegrationModule } from '../shared/module/integration/interface/domain-module-integration.module';
import { AuthService } from './core/service/authentication.service';
import { UserManagementService } from './core/service/user-management.service';
import { UserRepository } from './persistence/repository/user.repository';
import { AuthModule } from '../shared/module/auth/auth.module';
import { AuthController } from './http/rest/controller/auth.controller';
import { UserController } from './http/rest/controller/user.controller';

@Module({
  imports: [IdentityPersistenceModule, DomainModuleIntegrationModule, AuthModule],
  providers: [AuthService, UserManagementService, UserRepository],
  controllers: [AuthController, UserController],
})
export class IdentityModule {}
