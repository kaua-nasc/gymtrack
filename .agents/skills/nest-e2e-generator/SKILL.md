---
name: nest-e2e-generator
description: Comprehensive generation of NestJS E2E tests using Bun, MSW, and TypeORM. Use when you need to create or update E2E tests for modules, focusing on database cleanup (Knex), Redis cleanup, JWT authentication, and mocking external services via MSW. Ensures consistency with `@testInfra` patterns and project architecture.
---

# NestJS E2E Test Generator

This skill guides the creation of high-quality, project-compliant E2E tests for NestJS modules.

## Standard Workflow

1.  **Understand the Target Module**: Identify the module to be tested and its external dependencies (APIs, databases, cache).
2.  **Locate Infrastructure**: Ensure imports from `@testInfra` are correct.
    -   `@testInfra/enum/table.enum` for `Tables`.
    -   `@testInfra/knex.database` for `testDbClient`.
    -   `@testInfra/test-cache.setup` for `testCacheClient`.
    -   `@testInfra/test-e2e.setup` for `createNestApp`.
3.  **Define Test Structure**: Use the boilerplate and standard lifecycle hooks.
4.  **Implement Authentication**: If the endpoint is protected, use `getAuthorizationHeader`.
5.  **Mock External APIs**: Identify cross-module calls (e.g., Training Plan calling Identity) and mock them using MSW.
6.  **Verify Database State**: Use `testDbClient` to assert records are created/deleted correctly.

## Execution Scripts

Use these `package.json` scripts to run and debug tests:

- **Run all E2E tests**: `bun run test:e2e`
- **Run E2E tests in watch mode**: `bun run test:e2e:watch`
- **Setup test database**: `bun run test:db:setup` (Uses `.env.test`)
- **Drop test database**: `bun run test:db:drop` (Uses `.env.test`)
- **Run a specific test**: `bun test src/path/to/test.spec.ts`

## 🛠️ Troubleshooting & Common Failures
- **Relation Not Found**: `relation "table_name" does not exist`? You forgot to migrate the test database. Run `bun run test:db:setup`.
- **Foreign Key Violation**: Ensure the `beforeEach` del orders respect dependencies (e.g., delete children before parents).
- **In-Memory vs Persistent Database**: The project uses a persistent PostgreSQL for tests. Changes from one test may affect others if not cleaned properly in `beforeEach`.

## ⏱️ Test Performance & Timeouts
- **Workers**: Use `--workers=1` when running multiple tests that share the same database to avoid state leakage and deadlocks.

## Reference Materials

-   **Test Patterns**: See [references/patterns.md](references/patterns.md) for snippets on lifecycle hooks, Auth handling, and MSW mocking.

## Best Practices

-   **Isolate Modules**: Only import the target module in `createNestApp` if possible.
-   **Clean Before Tests**: Always clean relevant DB tables and Redis keys in `beforeEach` and `afterAll`.
-   **Use Factories**: Leverage existing factories in `__test__/factory/` for consistent data.
-   **Listen on Port 0**: Use `app.listen(0)` in `beforeAll` to avoid port conflicts and `app.getUrl()` to get the base URL.
-   **Prefer `fetch`**: Use the native `fetch` (provided by Bun) for making requests to the test app URL.
