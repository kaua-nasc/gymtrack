# 🏗️ NestJS Domain Generation Rules

This document provides a comprehensive guide for adding new functionality to the GymTrack project while maintaining architectural integrity, ensuring loose coupling, and providing full test coverage.

## 🏛️ 1. Modular Layered Architecture

All new features must follow the strict layered flow:
**Controller → Service → Repository → Entity**

- **Controller (`http/rest/controller/`)**: Entry point for HTTP requests. Handles transport concerns (parsing, validation, Swagger).
- **Service (`core/service/`)**: Core business logic. Orchestrates data flow and interacts with repositories.
- **Repository (`persistence/repository/`)**: Data access layer. Mediates between services and the database.
- **Entity (`persistence/entity/`)**: Database schema definition. Must extend `DefaultEntity`.

## 🔀 2. Module Communication (HTTP & Decoupling)

**Direct inter-module communication is strictly forbidden.** Modules must communicate through shared interfaces and providers.

### Workflow:
1.  **Define Contract**: Create an interface in `src/module/shared/integration/interface/`.
2.  **Implement Provider**: The source module (e.g., `Identity`) implements this interface in its `integration/provider/` directory.
3.  **Register Provider**: Export the provider from the source module's main file.
4.  **Inject and Consume**: The target module (e.g., `TrainingPlan`) imports the interface from `shared` and injects it into its service.

### Example Contract (`IUserPublicApi.ts`):
```typescript
export interface IUserPublicApi {
  exists(userId: string): Promise<boolean>;
  getProfile(userId: string): Promise<UserProfileDto>;
}
```

## 🧪 3. E2E Testing Strategy

Every new feature **MUST** have a corresponding E2E test in `__test__/e2e/`.

- **Framework**: Bun + NestJS TestingModule.
- **Data Lifecycle**:
    - `beforeAll`: Initialize app and factories.
    - `beforeEach`: Clean relevant database tables using `testDbClient()(Tables.NAME).del()`.
    - `afterAll`: Close app and clean up.
- **Assertions**: Verify status codes, body response shape, and side effects (DB state).

### E2E Boilerplate:
```typescript
import { INestApplication } from '@nestjs/common';
import { createNestApp } from '@testInfra/test-e2e.setup';
import { testDbClient } from '@testInfra/knex.database';
import { Tables } from '@testInfra/enum/table.enum';
import { MyModule } from '@src/module/my/my.module';

describe('My Feature (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createNestApp([MyModule]);
    await app.listen(0);
  });

  afterAll(async () => await app.close());

  beforeEach(async () => {
    await testDbClient()(Tables.TARGET_TABLE).del();
  });

  it('POST /endpoint', async () => {
    const response = await fetch(`${await app.getUrl()}/endpoint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ... }),
    });
    expect(response.status).toBe(201);
  });
});
```

## 🧬 4. Code Patterns & Archetypes

### Entity Pattern:
```typescript
@Entity('table_name')
export class MyEntity extends DefaultEntity {
  @Column()
  name: string;
}
```

### Repository Pattern:
```typescript
@Injectable()
export class MyRepository extends DefaultTypeOrmRepository<MyEntity> {
  constructor(@InjectDataSource('{domain}') private readonly dataSource: DataSource) {
    super(MyEntity, dataSource.createEntityManager());
  }
}
```

### Service Pattern:
```typescript
@Injectable()
export class MyService {
  constructor(private readonly repository: MyRepository) {}

  async create(dto: CreateDto): Promise<MyEntity> {
    const entity = this.repository.create(dto);
    return this.repository.save(entity);
  }
}
```
