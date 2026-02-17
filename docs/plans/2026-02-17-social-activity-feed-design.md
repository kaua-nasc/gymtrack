# Design Document: Social Activity Feed

## Overview
This document outlines the design for the **Social Activity Feed** feature in GymTrack. This feature introduces a way for users to see the activity of the people they follow, such as completing workouts, creating plans, and following other users.

## Architecture

We will implement an **Event-Driven Architecture (EDA)** using NestJS's internal `EventEmitter2`. This decouples the core domain logic (Identity, Training Plan) from the Activity Feed feature.

### 1. Data Model (`Activity` Entity)

A new `Activity` entity will be created in `src/module/activity/persistence/entity/activity.entity.ts`.

**Schema:**
*   `id`: UUID (Primary Key) - Inherited from `DefaultEntity`.
*   `actorId`: UUID (Foreign Key to `User`) - The user who performed the action.
*   **Index:** `actorId` + `createdAt` (Composite Index for fast feed queries).
*   `type`: Enum (`ActivityType`)
    *   `USER_FOLLOWED`
    *   `TRAINING_PLAN_CREATED`
    *   `TRAINING_PLAN_LIKED`
    *   `WORKOUT_COMPLETED`
*   `targetId`: UUID (Optional) - ID of the related entity (e.g., the followed user's ID or the plan ID).
*   `metadata`: JSONB (Optional) - Stores lightweight snapshot data (e.g., `planName`, `dayName`) to reduce join complexity on read.
*   `createdAt`: Timestamp - Inherited from `DefaultEntity`.

### 2. Event Workflow

The following services will be updated to emit events after successful operations:

| Service | Method | Event Name | Payload |
| :--- | :--- | :--- | :--- |
| `UserManagementService` | `followUser` | `activity.user.followed` | `{ followerId, followedId }` |
| `TrainingPlanManagementService` | `create` | `activity.training-plan.created` | `{ authorId, trainingPlanId, planName }` |
| `TrainingPlanManagementService` | `like` | `activity.training-plan.liked` | `{ userId, trainingPlanId }` |
| `PlanSubscriptionManagementService` | `createDayProgress` | `activity.workout.completed` | `{ userId, trainingPlanId, dayId }` |

### 3. Activity Listener

A new `ActivityListener` (`src/module/activity/core/listener/activity.listener.ts`) will subscribe to these events and persist `Activity` records via `ActivityService`.

### 4. Feed Retrieval Logic

The `ActivityService.getFeed(userId)` method will:
1.  Call `UserManagementService.getFollowing(userId)` to get a list of followed user IDs.
2.  Query the `Activity` repository:
    ```sql
    SELECT * FROM activity 
    WHERE actor_id IN (:followingIds) 
    ORDER BY created_at DESC
    LIMIT :limit
    ```
3.  Support **Cursor-based Pagination** consistent with existing endpoints.

## API Endpoints

### `GET /activity/feed`
*   **Auth:** Required (JWT).
*   **Query Params:**
    *   `limit`: Number (default 10).
    *   `cursor`: String (base64 encoded timestamp).
*   **Response:**
    ```json
    {
      "data": [
        {
          "id": "uuid",
          "type": "WORKOUT_COMPLETED",
          "actorId": "uuid",
          "targetId": "uuid",
          "metadata": { "planName": "Push Day" },
          "createdAt": "2023-10-27T10:00:00Z"
        }
      ],
      "nextCursor": "...",
      "hasNextPage": true
    }
    ```

## Implementation Steps

1.  **Scaffold Module:** Create `src/module/activity` structure.
2.  **Database:** Define `Activity` entity and repository.
3.  **Service:** Implement `ActivityService` for creating and querying activities.
4.  **Events:** Update existing services (`Identity`, `TrainingPlan`) to emit events.
5.  **Listener:** Implement `ActivityListener` to handle events and save activities.
6.  **Controller:** Expose `GET /activity/feed`.
7.  **Tests:** specific unit and e2e tests.
