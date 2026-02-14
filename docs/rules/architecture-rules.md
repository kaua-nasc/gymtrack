# 🏛️ GymTrack Architectural Rules

**Parent Document:** [GEMINI.md](../../GEMINI.md)

This document details the architectural standards, patterns, and conventions for the GymTrack backend. Adherence to these rules is mandatory for all code contributions.

---

### 🏗️ Core Architecture: Modular Layers

The application follows a strict layered architecture within each domain module. Data flows in a single direction, ensuring separation of concerns.

**Flow:** `Client → Controller → Service → Repository → Entity`

1.  **Controller (`http/rest/controller/`)**
    *   **Responsibility:** The only entry point for web requests. Handles HTTP transport concerns.
    *   **Tasks:** Parses request bodies, validates Data Transfer Objects (DTOs), and delegates business logic to the appropriate service. It should not contain any business logic itself.
    *   **Decorators:** Must be decorated with `@ApiTags` for Swagger, and endpoints must use `@ApiOperation` and `@ApiResponse`.

2.  **Service (`core/service/`)**
    *   **Responsibility:** Executes core business logic. Orchestrates data flow and interacts with repositories.
    *   **Tasks:** Implements use cases, performs complex calculations, manages transactions, and throws domain-specific exceptions (e.g., `UserNotFoundException`) which are then handled by a global exception filter. It is completely decoupled from HTTP.

3.  **Repository (`persistence/repository/`)**
    *   **Responsibility:** Abstracts data persistence. Mediates between the service layer and the database.
    *   **Tasks:** Handles all database operations (CRUD). Uses TypeORM's `EntityManager` or `QueryBuilder`. May also interact with caching services for performance optimization.

4.  **Entity (`persistence/entity/`)**
    *   **Responsibility:** Defines the data model and database schema using TypeORM decorators.
    *   **Tasks:** Represents a database table. Contains properties decorated with `@Column`, `@ManyToOne`, etc. All persistence entities must inherit from `DefaultEntity`.

---

### 📂 System & Module Organization

The codebase is divided into independent domains, each with a consistent internal structure.

#### Core Domains

*   **`src/module/identity/`**: Manages users, authentication, authorization, profiles, and social features (e.g., follows). Connects to the `identity` database.
*   **`src/module/training-plan/`**: Manages training plans, exercises, subscriptions, and user feedback. Connects to the `training-plan` database.
*   **`src/module/shared/`**: A collection of reusable infrastructure modules. **It contains no business logic.** Key sub-modules include:
    *   `persistence/`: Shared persistence logic, including the base repository and entity.
    *   `config/`: Application configuration management.
    *   `logger/`: Centralized logging services.
    *   `cache/`: Caching abstractions (e.g., Redis).
    *   `auth/`: JWT strategies and guards.
    *   `integration/`: Interfaces for cross-module communication.

#### Module Structure

Each domain module (`identity`, `training-plan`) follows this prescribed structure:

```
src/module/{domain}/
├── core/
│   └── service/         # Business logic
├── http/
│   └── rest/
│       ├── controller/  # API controllers
│       └── dto/         # Request/Response objects
├── persistence/
│   ├── entity/          # TypeORM entities
│   ├── repository/      # Data access layer
│   └── migration/       # Database migrations
├── integration/
│   └── provider/        # Concrete implementation of shared interfaces
└── __test__/
    ├── e2e/             # End-to-end tests (.spec.ts)
    └── factory/         # Object Mother test data factories
```

---

### 🧬 Code Archetypes (Standard Patterns)

*   **Entities**:
    *   **Inheritance**: Must extend `DefaultEntity`.
    *   **Path**: `import { DefaultEntity } from '@src/module/shared/module/persistence/typeorm/entity/default.entity';`
    *   **Implementation**: Use TypeORM decorators (`@Entity`, `@Column`).

*   **Repositories**:
    *   **Inheritance**: Must extend `DefaultTypeOrmRepository<T>`.
    *   **Path**: `import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';`
    *   **Injection**: Inject the correct `DataSource` via `@InjectDataSource('{domain}')`.

*   **DTOs**:
    *   **Implementation**: Use `class-validator` for request validation and `@ApiProperty` from `@nestjs/swagger` for API documentation.

---

### 🔀 Decoupled Integration Contract

Direct inter-module communication is **strictly forbidden**. Modules must communicate via shared interfaces.

1.  **Define Contract**: Create an `interface` in `src/module/shared/integration/interface/`. This defines the methods the consumer module can call.
2.  **Implement Provider**: The source module implements this interface in its `integration/provider/` directory. This class is exported from the source module.
3.  **Inject and Consume**: The consumer module imports the interface from `shared` and uses NestJS DI to inject the implementation.

---

### 🧪 Testing Strategy

*   **Unit Tests**: Not explicitly shown in the structure, but services should be unit-tested where logic is complex.
*   **E2E Tests (`__test__/e2e/`)**: Test entire features from the controller down to the database. Use `supertest` for HTTP requests.
*   **Factories (`__test__/factory/`)**: Use the "Object Mother" pattern to create consistent test data (e.g., `UserFactory`).
*   **Global Test Setup (`/test/`)**: The root `/test` directory contains global setup files for the entire test environment, including:
    *   `test-e2e.setup.ts`: Global configuration for E2E tests.
    *   `msw.setup.ts`: Mock Service Worker setup for mocking external APIs.
    *   `knex.database.ts`: Database cleanup and seeding logic.

---

### 🚀 Naming & Development Standards

| Type | Convention | Example |
| :--- | :--- | :--- |
| **Class** | `PascalCase{Type}` | `UserManagementService`, `CreatePlanDto` |
| **Files** | `kebab-case.{type}.ts` | `user-management.service.ts`, `training-plan.entity.ts` |
| **Tests** | `*.spec.ts` | `authentication.spec.ts`, `create-plan.e2e.spec.ts` |
| **Interfaces** | `IPascalCase` | `IUserPublicApi` |

*   **Serialization**: Use `class-transformer`. `@Exclude()` sensitive data like passwords from responses. `@Expose()` can be used to explicitly include fields.
*   **Configuration**: Always use `ConfigService`. **Never** access `process.env` directly outside of the `ConfigModule`.
*   **Safety**:
    *   Always `await` promises to ensure proper error handling and stack traces.
    *   Avoid the `n+1` problem by using `relations` or `QueryBuilder` joins in TypeORM to fetch related entities eagerly.
