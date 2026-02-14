# Skill: E2E Test Generator

## Summary

This skill generates a boilerplate E2E (End-to-End) test file for a NestJS controller, following the established conventions of the GymTrack project.

**Goal:** To accelerate test creation by providing a standard, ready-to-use template that includes setup, teardown, and mocking infrastructure.

## Core Mandates

- **Use this skill when:** You need to create a new `.spec.ts` file for testing a controller's endpoints.
- **Mimic the existing patterns:** The generated code adheres strictly to the project's testing standards. Do not deviate unless the pattern itself is being updated.

---

## The Workflow

### 1. Identify Target and Dependencies

- **Controller:** The NestJS controller that you are testing.
- **Module:** The module where the controller is declared.
- **Data Factories:** Identify which factories (e.g., `userFactory`, `trainingPlanFactory`) will be needed to create test data.
- **External Calls:** Identify any HTTP requests made to other services. These will need to be mocked using MSW.

### 2. Generate the Test File

1.  Create a new file under the appropriate module's `__test__/e2e/` directory. For a controller named `MyFeatureController`, the file should be named `my-feature.spec.ts`.
2.  Use the template below as the starting point.
3.  **Fill in the placeholders:**
    *   `MyFeatureController`: The name of your controller.
    *   `MyFeatureModule`: The name of the NestJS module.
    *   `my-feature.factory`: The relevant data factory.
    *   `Tables.MyFeatureTable`: The database table enum for the feature's data.

### 3. Implement the Test Cases

-   Write `describe` blocks for each controller method or endpoint group (e.g., `Create Feature`, `List Features`).
-   Write `it` blocks for each specific test case (e.g., "should create a feature successfully", "should return 404 if feature not found").
-   Use data factories to build your request payloads and seed the database.
-   If the endpoint calls an external service, use `server.use(http.get(...))` to mock the response for that specific test.
-   Use `fetch` to make the request to your application's endpoint.
-   Use `expect` to assert the response status, body, and any database side-effects.

---

## <available_resources>

### Test Infrastructure

-   **App Creation:** `@testInfra/test-e2e.setup` -> `createNestApp`
-   **DB Client:** `@testInfra/knex.database` -> `testDbClient`
-   **Cache Client:** `@testInfra/test-cache.setup` -> `testCacheClient`
-   **DB Table Enums:** `@testInfra/enum/table.enum` -> `Tables`

### Data Factories

-   Located in `src/module/<module-name>/__test__/factory/`
-   Example: `import { userFactory } from '@src/module/identity/__test__/factory/user.factory';`

---

## template: E2E Test for `{{FEATURE_NAME}}Controller`

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
import { {{YOUR_MODULE}} } from '@src/module/{{MODULE_PATH}}/{{MODULE_FILE}}';
import { {{factoryName}} } from '@src/module/{{MODULE_PATH}}/__test__/factory/{{FACTORY_FILE}}';
import { Tables } from '@testInfra/enum/table.enum';
import { testDbClient } from '@testInfra/knex.database';
import { testCacheClient } from '@testInfra/test-cache.setup';
import { createNestApp } from '@testInfra/test-e2e.setup';
import { HttpResponse, http } from 'msw';
import { SetupServerApi } from 'msw/node';
import request from 'supertest'; // Or use fetch

describe('{{FEATURE_NAME}} Controller (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;
  let url: string;
  let server: SetupServerApi;
  let configuration: { [key: string]: string | number | undefined };

  beforeAll(async () => {
    // Pass in all modules required for this test
    const setup = await createNestApp([{{YOUR_MODULE}}]);
    app = setup.app;
    module = setup.module;
    server = setup.server;
    configuration = setup.configuration;
    await app.listen(0);

    url = await app.getUrl();
  });

  beforeEach(async () => {
    // Clean all tables used in this test suite
    await testDbClient(Tables.{{TABLE_NAME}}).del();
    // Example: await testDbClient(Tables.User).del();
  });

  afterEach(() => {
    // Reset MSW handlers after each test
    server.resetHandlers();
  });

  afterAll(async () => {
    // Close MSW server
    server.close();

    if (module) {
      // Clean tables again to leave a clean state
      await testDbClient(Tables.{{TABLE_NAME}}).del();
      await module.close();
    }

    if (app) {
      await app.close();
    }
  });

  describe('Endpoint Group Description', () => {
    it('should do something and return expected result', async () => {
      // 1. Arrange
      // Mock external HTTP calls if needed
      // server.use(
      //   http.get('http://external-service.com/resource/123', () =>
      //     HttpResponse.json({ exists: true }),
      //   ),
      // );

      // Use factories to create test data
      const testData = {{factoryName}}.build();

      // Seed the database if necessary
      // await testDbClient(Tables.{{TABLE_NAME}}).insert(testData);

      const payload = {
        /* ... */
      };

      // 2. Act
      const response = await fetch(`${url}/{{FEATURE_ROUTE}}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // 3. Assert
      expect(response.status).toBe(HttpStatus.CREATED);

      const result = await testDbClient(Tables.{{TABLE_NAME}})
        .select('*')
        .where({ id: testData.id });
      expect(result).toHaveLength(1);
    });

    it('should return 4xx or 5xx on failure', async () => {
      // Arrange

      // Act
      const response = await fetch(`${url}/{{FEATURE_ROUTE}}/non-existent-id`, {
        method: 'GET',
      });

      // Assert
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
```
