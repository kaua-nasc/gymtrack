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
import { sign } from 'jsonwebtoken';
import { HttpResponse, http } from 'msw';
import { SetupServer } from 'msw/node';

// IMPORT TARGET MODULE AND FACTORIES HERE

describe('TARGET_NAME - TARGET_NAME Controller - (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;
  let _url: string;
  let server: SetupServer;
  let configuration: { [key: string]: string | number | undefined };

  beforeAll(async () => {
    // Import target module
    const setup = await createNestApp([
      /* TARGET_MODULE */
    ]);
    app = setup.app;
    module = setup.module;
    configuration = setup.configuration;
    server = setup.server;
    await app.listen(0);

    _url = await app.getUrl();
  });

  beforeEach(async () => {
    // Clean relevant tables
    await testDbClient(Tables.User).del();
    // await testDbClient(Tables.TargetTable).del();
    await testCacheClient.clean();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(async () => {
    server.close();
    if (module) {
      await testDbClient(Tables.User).del();
      // await testDbClient(Tables.TargetTable).del();
      await testCacheClient.clean();
      await module.close();
    }

    if (app) {
      await app.close();
    }
  });

  const _getAuthorizationHeader = (userId: string) => {
    return {
      Authorization: `Bearer ${sign(
        { sub: userId },
        configuration['auth.jwtSecret'] as string
      )}`,
    };
  };

  describe('Feature Description', () => {
    it('should behave correctly when [condition]', async () => {
      // 1. Prepare Data (Factories + DB insertion)
      // const user = userFactory.build();
      // await testDbClient(Tables.User).insert(user);
      // 2. Mock External APIs if needed
      // server.use(
      //   http.get(`${configuration['identityApi.url']}/...`, () => HttpResponse.json({ ... }))
      // );
      // 3. Perform Request
      // const response = await fetch(`${url}/endpoint`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json', ...getAuthorizationHeader(user.id) },
      //   body: JSON.stringify({ ... }),
      // });
      // 4. Assertions
      // expect(response.status).toBe(HttpStatus.CREATED);
      // const dbRecord = await testDbClient(Tables.TargetTable).select('*');
      // expect(dbRecord).toHaveLength(1);
    });
  });
});
