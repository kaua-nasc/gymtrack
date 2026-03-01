# Technical Design Document: User Metrics Goals

## 1. Overview

- **Feature Name:** User Metrics Goals (Targets and History)
- **Summary:** This feature allows users to set specific targets for their weight and other body measurements. It tracks progress automatically as new data is logged, maintains a history of achieved or abandoned goals, and provides insights into how close a user is to their target.

## 2. Scope & Requirements

- **In Scope:**
    - `MetricGoal` entity to store target values, deadlines, and current status.
    - Automatic detection of goal direction (Loss vs Gain).
    - Automatic achievement detection when logging new weight or measurements.
    - Progress percentage calculation.
    - API endpoints to create, list, and manage goals.
- **Out of Scope:**
    - Push notifications when a goal is achieved (future scope).
    - Social sharing of goals.
- **Non-Functional Requirements:**
    - Atomicity: Goal achievement check must happen within the measurement logging transaction.
    - Precision: Consistent unit handling (Metric internal).

## 3. Solution Design

### 3.1. Core Domain

- **Domain:** `Identity`
- **Rationale:** Goals are personal objectives directly tied to the user's physical profile and transformation journey.

### 3.2. API Design

- **Controller:** `UserController` (Existing)
- **Endpoints:**
    - `POST /user/profile/goals` - `createGoal()`: Set a new target for a metric.
    - `GET /user/profile/goals` - `getGoals()`: Retrieve all goals (active and historical).
    - `PATCH /user/profile/goals/:id` - `updateGoalStatus()`: Manually update status (e.g., ABANDONED).

### 3.3. Data Model (Persistence)

- **New Entities:**
    - `MetricGoal`: 
        - `id (UUID)`
        - `userId (UUID)`
        - `type (string)`: e.g., 'WEIGHT' or a value from `MeasurementType`.
        - `startingValue (decimal)`: The value when the goal was set.
        - `targetValue (decimal)`: The desired objective.
        - `deadline (timestamp, nullable)`
        - `achievedAt (timestamp, nullable)`
        - `status (enum: ACTIVE, ACHIEVED, ABANDONED)`
- **Repository:** `MetricGoalRepository` (New).
- **Migration Plan:** Create `metric_goals` table and `metric_goal_status` enum.

### 3.4. Service & Business Logic

- **Service:** `UserManagementService` (Existing)
- **Core Logic:**
    - **Goal Creation**: Snapshot the current value of the metric as `startingValue`.
    - **Directionality**: 
        - If `targetValue < startingValue`, it's a "Decrease" goal.
        - If `targetValue > startingValue`, it's a "Increase" goal.
    - **Auto-Achievement**: 
        - Hook into `addWeightLog` and `addBodyMeasurements`.
        - Find `ACTIVE` goals for that type.
        - Mark as `ACHIEVED` if the new value meets or exceeds the target in the correct direction.
- **Transactions**: Goal checks must be part of the measurement saving transaction.

### 3.5. Security & Authorization

- **Authentication:** `JwtAuthGuard`.
- **Authorization:** Standard ownership check (User can only manage their own goals).
