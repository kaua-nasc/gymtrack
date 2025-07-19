import { Injectable } from '@nestjs/common';
import { IdentityUserExistsApi } from '@src/module/shared/module/integration/interface/identity-integration.interface';
import { UserManagementService } from '../../core/service/user-management.service';

@Injectable()
export class IdentityApiProvider implements IdentityUserExistsApi {
  constructor(private readonly userManagementService: UserManagementService) {}
  userExists(userId: string): Promise<boolean> {
    return this.userManagementService.exists(userId);
  }
}
