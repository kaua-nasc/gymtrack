# 🧪 E2E Test Boilerplate

Every feature must have a corresponding E2E test in `__test__/e2e/`.

```typescript
import { INestApplication } from '@nestjs/common';
import { createNestApp } from '@testInfra/test-e2e.setup';
import { testDbClient } from '@testInfra/knex.database';
import { Tables } from '@testInfra/enum/table.enum';
import { MyModule } from '@src/module/my/my.module';

describe('My Feature (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createNestApp([MyModule]); // Import target module
    await app.listen(0);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await testDbClient()(Tables.TARGET_TABLE).del(); // Clean DB
  });

  it('POST /my-feature', async () => {
    const payload = { name: 'Test' };

    const response = await fetch(`${await app.getUrl()}/my-feature`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.name).toBe('Test');
  });
});
```
