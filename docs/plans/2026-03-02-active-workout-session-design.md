# Active Workout Session Design

The Active Workout Session feature introduces a guided, real-time workout 
experience. It lets you track your progress set-by-set, provides adaptive 
rest timers, and ensures you can resume your session across different devices.

## Overview

The "Start Workout" mode transitions the application from a passive logger 
to an active training partner. By maintaining a live session state on the 
backend, the system can provide intelligent feedback during the workout and 
ensure no data is lost if the app is closed.

## Architecture

This feature follows a stateful, hybrid persistence model. While the final 
results are stored in the historical `exercise_logs` table, the "live" state 
resides in a dedicated session manager.

### Data model

The core of this feature is the `ActiveWorkoutSession` entity. This entity 
tracks the current state of a user's workout without cluttering the 
permanent progress tables.

- **`ActiveWorkoutSession`**:
  - `id`: UUID (Primary Key)
  - `userId`: UUID (Index)
  - `planDayProgressId`: UUID (Link to the current day's progress)
  - `currentExerciseId`: UUID (Pointer to the active exercise)
  - `currentSetIndex`: Integer (Zero-based index of the active set)
  - `restStartedAt`: Timestamp (Nullable, set when a set is completed)
  - `adaptiveRestDurationSeconds`: Integer (Calculated rest time)
  - `startedAt`: Timestamp
  - `lastActiveAt`: Timestamp (Used for session timeout/cleanup)

- **`ActiveSetLog`**:
  - `id`: UUID
  - `sessionId`: UUID
  - `exerciseId`: UUID
  - `setIndex`: Integer
  - `reps`: Integer
  - `weight`: Decimal
  - `rpe`: Integer (1-10, used for adaptive rest calculation)

## API design

The following endpoints manage the lifecycle of a workout session.

### Start session
`POST /training-plan/session/start`

Initiates a new session for a specific training day. If a session already 
exists, it returns the existing one.

**Request body:**
```json
{
  "dayId": "uuid"
}
```

### Resume session
`GET /training-plan/session/active`

Retrieves the current active session for the authenticated user. Used when 
re-opening the app to restore the guided UI.

### Log set
`PATCH /training-plan/session/log-set`

Records a completed set, calculates the next rest period, and advances the 
session pointer.

**Request body:**
```json
{
  "reps": 10,
  "weight": 60,
  "rpe": 8
}
```

**Adaptive Logic:**
The backend calculates the next rest duration based on the `rpe`:
- RPE 1-6: Standard rest (e.g., 60s)
- RPE 7-8: Increased rest (e.g., 90s)
- RPE 9-10: Maximum rest (e.g., 120s)

### Finish session
`POST /training-plan/session/finish`

Concludes the workout. It moves all data from `ActiveSetLog` to the 
permanent `exercise_logs`, updates the `PlanDayProgress` status, and 
deletes the active session.

## Testing strategy

- **Unit tests**: Focus on the adaptive rest calculation logic and the 
  session pointer advancement.
- **E2E tests**: Verify the full lifecycle: `start` -> `log-set` -> `resume` 
  on a "new device" (simulated) -> `finish`.
- **Concurrency**: Ensure a user cannot have two active sessions 
  simultaneously.

## Next steps

1. Implement the `ActiveWorkoutSession` and `ActiveSetLog` entities.
2. Create the `WorkoutSessionService` to handle the business logic.
3. Develop the REST controllers and DTOs.
4. Integrate the adaptive rest logic.
