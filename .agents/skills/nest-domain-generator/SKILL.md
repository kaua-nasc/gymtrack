---
name: nest-domain-generator
description: "Orchestrated creation of new NestJS domain features, services, and modules following modular layered architecture. Ensures loose coupling through decoupled integration contracts, standard naming conventions, and generates complete E2E tests for all new functionality. Use when: (1) Creating a new module, (2) Adding a new service/controller/repository to an existing module, or (3) Implementing cross-module communication using shared interfaces."
---

# NestJS Domain Generator

This skill guides you through the process of adding new functionality to the GymTrack project while maintaining architectural integrity and ensuring full test coverage.

## 🚀 Standard Workflow

### 1. Research & Design
- **Analyze Requirement**: Determine which module the feature belongs to.
- **Identify Dependencies**: Does this feature need data from another module?
- **Define Archetypes**: See [references/archetypes.md](references/archetypes.md) for boilerplate.

### 2. Implementation Phase
Follow the modular layers in order:
1.  **Entity**: Define the DB schema in `persistence/entity/`.
2.  **Migration**: Write a migration for the new entity.
3.  **Repository**: Create the data access layer in `persistence/repository/`.
4.  **Service**: Implement business logic in `core/service/`.
5.  **Controller & DTO**: Create the API entry point in `http/rest/`.

### 3. Integration Phase (Decoupling)
If communicating between modules (e.g., Training Plan needs Identity data):
- **Contract**: Define an interface in `src/module/shared/integration/interface/`.
- **Provider**: Implement the provider in the source module's `integration/provider/`.
- **Injection**: Inject the interface in the consumer's service using the shared token.
- See [references/integration-patterns.md](references/integration-patterns.md) for details.

### 4. Validation Phase (E2E Testing)
- **Generate Test**: Create a `.spec.ts` file in `__test__/e2e/`.
- **Boilerplate**: Use the structure in [references/e2e-boilerplate.md](references/e2e-boilerplate.md).
- **Run Tests**: Use `bun run test:e2e` to verify.

## 🏛️ Architectural Rules
- **No Direct Imports**: Never import a service/repository from another domain module.
- **Naming**: `kebab-case.type.ts` for files, `PascalCaseType` for classes.
- **Layered Flow**: Always `Controller -> Service -> Repository -> Entity`.
- **Inheritance**: Entities must extend `DefaultEntity`, Repositories must extend `DefaultTypeOrmRepository`.
