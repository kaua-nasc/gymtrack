# E2E Test Patterns

## Standard Lifecycle Hooks

Use these standard hooks to manage the app state, database, and mocks.

```typescript
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'bun:test';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { Tables } from '@testInfra/enum/table.enum';
import { testDbClient } from '@testInfra/knex.database';
import { testCacheClient } from '@testInfra/test-cache.setup';
import { createNestApp } from '@testInfra/test-e2e.setup';
import { SetupServerApi } from 'msw/node';

describe('Feature Controller (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;
  let url: string;
  let server: SetupServerApi;
  let configuration: { [key: string]: string | number | undefined };

  beforeAll(async () => {
    // Import the specific module being tested
    const setup = await createNestApp([TargetModule]);
    app = setup.app;
    module = setup.module;
    server = setup.server;
    configuration = setup.configuration;
    await app.listen(0);

    url = await app.getUrl();
  });

  beforeEach(async () => {
    // Clean relevant database tables and cache
    await testDbClient(Tables.TargetEntity).del();
    await testCacheClient.clean();
  });

  afterEach(() => {
    // Reset MSW handlers between tests
    server.resetHandlers();
  });

  afterAll(async () => {
    if (module) {
      // Clean DB on teardown
      await testDbClient(Tables.TargetEntity).del();
      await testCacheClient.clean();
      await module.close();
    }
    if (app) {
      await app.close();
    }
  });
});
```

## Authentication Handling

Generate JWT tokens using the test configuration.

```typescript
import { sign } from 'jsonwebtoken';

const getAuthorizationHeader = (userId: string) => {
  return {
    Authorization: `Bearer ${sign(
      { sub: userId },
      configuration['auth.jwtSecret'] as string
    )}`,
  };
};

// Usage in fetch
const response = await fetch(`${url}/resource`, {
  headers: {
    ...getAuthorizationHeader(user.id),
  },
});
```

## Mocking External Services with MSW

Use `server.use` with `http` from `msw` to intercept external API calls.

```typescript
import { HttpResponse, http } from 'msw';

server.use(
  http.get(
    `${configuration['externalApi.url']}/resource/${id}`,
    () => HttpResponse.json({ data: 'mocked' })
  )
);
```

## Using Database Client (Knex)

Use `testDbClient` to verify records in the database or seed data.

```typescript
// Seed data
await testDbClient(Tables.Entity).insert(data);

// Verify data
const records = await testDbClient(Tables.Entity).select('*');
expect(records).toHaveLength(1);
```
