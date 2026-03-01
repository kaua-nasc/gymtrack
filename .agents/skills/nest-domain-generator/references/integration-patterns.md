# 🔀 Decoupled Integration Patterns

Direct inter-module communication is forbidden. Follow this workflow to enable one module to call another.

## 1. Define the Interface (The Contract)

Add the interface to `src/module/shared/integration/interface/`.

```typescript
// src/module/shared/integration/interface/user-public-api.interface.ts
export interface IUserPublicApi {
  exists(userId: string): Promise<boolean>;
  getProfile(userId: string): Promise<any>;
}
```

## 2. Implement the Provider (The Implementation)

The source module (e.g., `Identity`) implements this interface.

```typescript
// src/module/identity/integration/provider/identity-public-api.provider.ts
import { Injectable } from '@nestjs/common';
import { IUserPublicApi } from '@src/module/shared/integration/interface/user-public-api.interface';
import { UserManagementService } from '../../core/service/user-management.service';

@Injectable()
export class IdentityPublicApiProvider implements IUserPublicApi {
  constructor(private readonly userService: UserManagementService) {}

  async exists(userId: string): Promise<boolean> {
    return this.userService.exists(userId);
  }

  async getProfile(userId: string): Promise<any> {
    return this.userService.getProfile(userId);
  }
}
```

## 3. Register and Export

Export the provider from the source module's main file using a token.

```typescript
// src/module/identity/identity.module.ts
@Module({
  providers: [
    UserManagementService,
    {
      provide: 'IUserPublicApi',
      useClass: IdentityPublicApiProvider,
    },
  ],
  exports: ['IUserPublicApi'],
})
export class IdentityModule {}
```

## 4. Consume via DI

The target module (e.g., `TrainingPlan`) injects the interface using the token.

```typescript
// src/module/training-plan/core/service/plan-management.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { IUserPublicApi } from '@src/module/shared/integration/interface/user-public-api.interface';

@Injectable()
export class PlanManagementService {
  constructor(
    @Inject('IUserPublicApi') private readonly userApi: IUserPublicApi,
  ) {}

  async createPlan(userId: string) {
    const userExists = await this.userApi.exists(userId);
    // ...
  }
}
```
