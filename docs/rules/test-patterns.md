### 🎯 Strategy & Scope

* **E2E**: User-flow validation (HTTP + DB). Located in `__test__/e2e/`.
* **Integration**: Interaction between layers (Service + Repo).
* **Unit**: Isolated logic. Located in `core/service/*.spec.ts`. **Rules**: Mock all dependencies; no real DB; test only the service's internal logic.

### 🛠️ Core Stack

* **Runner**: `bun:test`.
* **Infra**: `@nestjs/testing` (`TestingModule`).
* **HTTP**: Native `fetch` (standard) or `supertest` (fluent assertions).
* **Mocking**: `msw` (External APIs), `jest.mock` (Unit dependencies).
* **Data**: `factory.ts` + `@faker-js/faker`.
* **Direct Access**: `testDbClient` (Knex/SQL) & `testCacheClient` (Redis).

### 🏗️ E2E Lifecycle & Isolation

* **Setup (`beforeAll`)**:
* Init App via `createNestApp`.
* Start MSW (`server.listen()`).
* Bind to random port (`app.listen(0)`).


* **Teardown (`afterAll`)**: Close MSW, wipe DB/Cache, close App.
* **Isolation (`beforeEach`)**: Delete all table data (`testDbClient().del()`) and clear cache. **Every test starts from zero.**
* **Reset (`afterEach`)**: `server.resetHandlers()` to clear MSW overrides.

### 🏭 Test Data Factories

* **Pattern**: Use "Object Mothers" in `__test__/factory/*.factory.ts`.
* **Usage**: `.build()` for defaults, `.extend({ ... })` for specific states.
* **Example**: `const user = userFactory.build({ email: 'test@gym.com' });`

### 🔍 Mocking External Services (MSW)

* **Concept**: Intercept outgoing HTTP calls to other domains (Identity, Storage).
* **Pattern**:
```typescript
server.use(http.get('*/user/exists/:id', () => HttpResponse.json({ exists: true })));

```

### ✅ Best Practices

* **Assertions**: Status codes first, then body shape, then side-effects (DB query).
* **Simplicity**: No complex logic inside tests. Straightforward Input → Output.
* **Cleanliness**: Use factories to hide object construction noise.
* **Independence**: Tests must pass regardless of execution order.