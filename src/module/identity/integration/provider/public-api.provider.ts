import { Injectable } from '@nestjs/common';
import { IdentityUserExistsApi } from '@src/module/shared/module/integration/interface/identity-integration.interface';
import { IdentityUser } from '@src/module/shared/module/integration/interface/identity-user-integration.interface';
import { UserManagementService } from '../../core/service/user-management.service';

@Injectable()
export class IdentityApiProvider implements IdentityUserExistsApi {
  constructor(private readonly userManagementService: UserManagementService) {}
  userExists(userId: string): Promise<boolean> {
    return this.userManagementService.existsById(userId);
  }

  async getUser(userId: string): Promise<IdentityUser> {
    const user = await this.userManagementService.getUserById(userId);
    return { ...user };
  }

  async getUsers(userIds: string[]): Promise<IdentityUser[]> {
    const users = await this.userManagementService.getUsersByIds(userIds);
    return users.map((user) => ({ ...user }));
  }
}
