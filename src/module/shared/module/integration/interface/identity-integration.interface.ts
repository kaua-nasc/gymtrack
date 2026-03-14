import { IdentityUser } from './identity-user-integration.interface';

export interface IdentityUserExistsApi {
  userExists(userId: string): Promise<boolean>;
  getUser(userId: string): Promise<IdentityUser>;
  getUsers(userIds: string[]): Promise<IdentityUser[]>;
  getTrainerId(studentId: string): Promise<string | null>;
}

export const IdentityUserExistsApi = Symbol('IdentityUserExistsApi');
