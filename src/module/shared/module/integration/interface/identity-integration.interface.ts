export interface IdentityUserExistsApi {
  userExists(userId: string): Promise<boolean>;
}

export const IdentityUserExistsApi = Symbol('IdentityUserExistsApi');
