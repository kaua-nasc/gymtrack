# Technical Design Document: Advanced Body Measurements

## 1. Overview

- **Feature Name:** Advanced Body Measurements & Composition Tracking
- **Summary:** This feature expands the user profile to track various body measurements (waist, chest, arms, etc.) and composition metrics (body fat %, muscle mass). It uses a dynamic but standardized approach, allowing users to track what they care about most over time.

## 2. Scope & Requirements

- **In Scope:**
    - `MeasurementType` enum with standardized body parts and composition metrics.
    - `BodyMeasurement` entity for historical tracking of different metric types.
    - API endpoints to add multiple measurements in one request.
    - API to retrieve history filtered by type or get the latest value for all types.
    - Automatic unit handling (Internal storage in Metric/%).
- **Out of Scope:**
    - Custom user-defined measurement types (fixed list only for now).
    - Visualizing trends (frontend).
- **Non-Functional Requirements:**
    - High precision for percentages and small measurements.
    - Efficient retrieval of the "latest" set of measurements.

## 3. Solution Design

### 3.1. Core Domain

- **Domain:** `Identity`
- **Rationale:** Body measurements are core physical attributes of the user profile.

### 3.2. API Design

- **Controller:** `UserController` (Existing)
- **Endpoints:**
    - `POST /user/profile/measurements` - `addMeasurements()`: Bulk add measurements (e.g., Waist, Chest, Body Fat).
    - `GET /user/profile/measurements` - `getMeasurementsHistory()`: Paginated history, filterable by `type`.
    - `GET /user/profile/measurements/latest` - `getLatestMeasurements()`: Returns the single most recent entry for every tracked measurement type.

### 3.3. Data Model (Persistence)

- **New Entities:**
    - `BodyMeasurement`: `id (UUID)`, `userId (UUID)`, `type (enum: MeasurementType)`, `value (decimal)`, `measuredAt (timestamp)`.
- **Enums:**
    - `MeasurementType`: `BODY_FAT`, `MUSCLE_MASS`, `BONE_MASS`, `WATER_PERCENTAGE`, `WAIST`, `CHEST`, `HIPS`, `NECK`, `BICEP_LEFT`, `BICEP_RIGHT`, `FOREARM_LEFT`, `FOREARM_RIGHT`, `THIGH_LEFT`, `THIGH_RIGHT`, `CALF_LEFT`, `CALF_RIGHT`.
- **Repository:** `BodyMeasurementRepository` (New).
- **Migration Plan:** Create a migration for the `body_measurements` table and the `measurement_type` enum.

### 3.4. Service & Business Logic

- **Service:** `UserManagementService` (Existing)
- **Core Logic:**
    - Use existing conversion utilities for mass (kg/lb) and length (cm/in).
    - For `POST /user/profile/measurements`, iterate through the list and save each entry.
    - For `getLatestMeasurements`, use a QueryBuilder to get the most recent entry per type for the authenticated user.
- **Transactions:** Use transactions for bulk saves.

### 3.5. Security & Authorization

- **Authentication:** `JwtAuthGuard`.
- **Authorization:** Standard ownership check (User can only manage their own measurements).
