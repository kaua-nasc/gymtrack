# Technical Design Document: User Metrics Tracking

## 1. Overview

- **Feature Name:** User Metrics Tracking (Weight, Height, and Units)
- **Summary:** This feature allows users to track their body weight and height over time, supporting both metric and imperial units. It provides a way to maintain a current profile state while keeping a historical log of weight entries for progress tracking.

## 2. Scope & Requirements

- **In Scope:**
    - Adding `height`, `currentWeight`, `weightUnit`, and `heightUnit` to the `User` entity.
    - Creating a `WeightLog` entity for historical weight tracking.
    - API endpoints to update profile metrics and add weight log entries.
    - Automatic update of `currentWeight` when a new log entry is added.
    - Unit conversion logic (internal storage in Metric).
- **Out of Scope:**
    - Charts or visual progress representations (frontend concern).
    - Tracking other body metrics like body fat % or muscle mass (future scope).
- **Non-Functional Requirements:**
    - Precision in unit conversions.
    - Consistency between `User` profile and `WeightLog`.

## 3. Solution Design

### 3.1. Core Domain

- **Domain:** `Identity`
- **Rationale:** Body metrics are personal profile information closely tied to the user's identity and physical state within the system.

### 3.2. API Design

- **Controller:** `UserController` (Existing)
- **Endpoints:**
    - `PATCH /user/profile/metrics` - `updateMetrics()`: Updates height, current weight, and unit preferences.
    - `POST /user/profile/weight` - `addWeightEntry()`: Adds a new weight entry to the historical log and updates the user's current weight.
    - `GET /user/profile/weight-history` - `getWeightHistory()`: Retrieves paginated historical weight entries.

### 3.3. Data Model (Persistence)

- **New Entities:**
    - `WeightLog`: `id (UUID)`, `userId (UUID)`, `weight (decimal)`, `measuredAt (timestamp)`.
- **Entity Changes:**
    - `User`: Add `height` (decimal), `currentWeight` (decimal), `weightUnit` (enum: kg, lb), `heightUnit` (enum: cm, ft-in).
- **Repository:** `WeightLogRepository` (New), `UserRepository` (Existing).
- **Migration Plan:** Create a migration to add columns to the `users` table and create the `weight_logs` table.

### 3.4. Service & Business Logic

- **Service:** `UserManagementService` (Existing)
- **Core Logic:**
    - Store all values in Kilograms (kg) and Centimeters (cm) internally for consistency.
    - Handle conversions if the user's preferred unit is Imperial.
    - When adding a weight entry, update the `User` entity's `currentWeight` field in the same transaction.
- **Transactions:** Use `dataSource.transaction` in `UserManagementService` for atomic updates.
- **Error Handling:** Standard `UserNotFoundException`.

### 3.5. Security & Authorization

- **Authentication:** `JwtAuthGuard` (Existing).
- **Authorization:** Enforcement that a user can only access or modify their own data using the ID from the JWT token.
