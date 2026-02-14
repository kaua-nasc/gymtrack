# Skill: Technical Design Document Creator

## Summary

This skill guides you through the creation of a Technical Design Document (TDD) for new features in the GymTrack project. A TDD ensures that new development adheres to the established architectural rules and best practices.

**Goal:** To produce a clear, comprehensive design plan before implementation begins, facilitating better reviews and alignment with project standards.

## Core Mandates

- **Use this skill when:** Proposing any new feature or significant change that impacts the API, database, or cross-module logic.
- **Source of Truth:** The design must be grounded in the principles defined in `docs/rules/architecture-rules.md` and `docs/rules/general-rules.md`.

---

## The Workflow

1.  **Initiate**: When you need to design a new feature, invoke this skill.
2.  **Complete the Template**: Fill out each section of the template below. Be thorough. This is your plan for implementation.
3.  **Review**: Share the completed document with other developers for feedback.
4.  **Implement**: Once the design is approved, use it as the blueprint for your code.

---

## <available_resources>

-   **Architecture Rules:** `docs/rules/architecture-rules.md`
-   **General Rules & Policies:** `docs/rules/general-rules.md`
-   **Test Patterns:** `docs/rules/test-patterns.md`

---

## template: Technical Design Document

## 1. Overview

-   **Feature Name:** A concise, descriptive name for the feature.
-   **Jira/Ticket:** (Optional) Link to the corresponding issue.
-   **Summary:** Briefly describe the feature's purpose and the problem it solves for the user.

## 2. Scope & Requirements

-   **In Scope:** List the concrete deliverables. What will be built?
-   **Out of Scope:** Clearly state what will *not* be built to manage expectations.
-   **Non-Functional Requirements:** (e.g., Performance targets, idempotency needs).

## 3. Solution Design

### 3.1. Core Domain

-   **Domain:** Which primary domain does this belong to? (`Identity`, `Training Plan`).
-   **Rationale:** Justify why it fits there.

### 3.2. API Design

-   **Controller:** `[New/Existing] {ControllerName}`
-   **Endpoints:**
    -   `POST /route` - `methodName()`: Description.
    -   `GET /route/:id` - `methodName()`: Description.
-   **Request/Response DTOs:** Define the shape of the DTOs, including validation rules (`class-validator`) and Swagger annotations (`@ApiProperty`).

    ```typescript
    // Example: CreateTrainingPlanRequestDto
    export class CreateTrainingPlanRequestDto {
      @ApiProperty({ example: 'My Awesome Plan' })
      @IsString()
      @IsNotEmpty()
      name: string;
    }
    ```

### 3.3. Data Model (Persistence)

-   **New Entities:** List any new database entities required. Include their key fields.
    -   `NewEntity`: `field_one (string)`, `field_two (number)`.
-   **Entity Changes:** Describe modifications to existing entities.
-   **Repository:** `[New/Existing] {RepositoryName}`. Will it use `QueryBuilder` for complex queries?
-   **Migration Plan:** High-level description of the required `up` and `down` migrations.

### 3.4. Service & Business Logic

-   **Service:** `[New/Existing] {ServiceName}`
-   **Core Logic:** Describe the main steps the service will perform.
-   **Transactions:** Identify any operations that must be transactional. Adhere to the service-level transaction pattern.
-   **Error Handling:** List the potential failure scenarios and the NestJS HTTP exceptions that will be thrown (e.g., `NotFoundException`, `ForbiddenException`).
-   **Domain Events:** Will this feature emit any domain events? If so, what are they and what payload do they carry?

### 3.5. Integration (Cross-Module / External)

-   **Dependencies:** Does this feature depend on another module (e.g., `Identity`) or an external service?
-   **Integration Contract:** If yes, define the interface to be used for decoupling, as per the architectural rules. `shared/integration/interface`.
-   **Provider Implementation:** Where will the implementation of this interface live? `integration/provider/`.

### 3.6. Security & Authorization

-   **Authentication:** Which endpoints require authentication? (`JwtAuthGuard`).
-   **Authorization:** What ownership or permission checks are needed within the service logic? (e.g., "User can only edit their own training plan").

## 4. Open Questions & Considerations

-   List any unresolved questions or design trade-offs that need further discussion.
