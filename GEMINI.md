# 🤖 GymTrack AI Context Index (GEMINI.md)

This document is the entry point for AI models and contributors. It links to the strict engineering standards required for this project. **Always refer to these documents before generating code.**

## 🛠️ Core Tech Stack

* **Runtime:** [Bun](https://bun.sh/)
* **Framework:** [NestJS](https://nestjs.com/) (TypeScript)
* **Database:** PostgreSQL (via TypeORM)
* **Validation:** Class-validator / Zod
* **Testing:** `bun:test`, MSW (Mock Service Worker)
* **Linter/Formatter:** Biome

## 📘 Architectural Rules

**Focus:** Structure, Naming, and Domain Boundaries.
Contains the modular layered architecture (`Controller -> Service -> Repository -> Entity`), naming conventions (PascalCase vs kebab-case), and the strict **Cross-Module Integration** contract.

> **Open this when:** Creating new modules, defining entities, or establishing communication between `Identity` and `Training Plan`.

@./documentation/rules/architecture-rules.md

## 🧪 Test Patterns and Best Practices

**Focus:** Reliability and Isolation.
Defines the strategy for **Unit** (isolated/mocked), **Integration**, and **E2E** tests. Includes the lifecycle hooks for DB/Cache cleanup and the usage of "Object Mother" factories.

> **Open this when:** Writing `.spec.ts` files, creating data factories, or mocking external API calls with MSW.

@./documentation/rules/test-patterns.md


## 🧠 Global Rules & Policies

**Focus:** Cross-cutting Concerns and Standards.
The single source of truth for **Global Error Handling**, **Transaction Management (Service-level)**, **Domain Events**, **Pagination**, and **Idempotency**.

> **Open this when:** Handling failures, managing DB consistency, implementing logging, or designing API responses and DTOs.

@./documentation/rules/general-rules.md


## ⚠️ Compliance Guardrail

All generated code must be validated against these rules. MCPs (Model Context Protocols) are supporting tools and **never** override the constraints defined in the files above.