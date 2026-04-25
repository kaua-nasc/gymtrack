import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'bun:test';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { userFactory } from '@src/module/identity/__test__/factory/user.factory';
import { TrainingPlanModule } from '@src/module/training-plan/training-plan.module';
import { Tables } from '@testInfra/enum/table.enum';
import { testDbClient } from '@testInfra/knex.database';
import { createNestApp } from '@testInfra/test-e2e.setup';
import { sign } from 'jsonwebtoken';
import { SetupServer } from 'msw/node';
import { trainingPlanFactory } from '../../factory/training-plan.factory';
import { dayFactory } from '../../factory/day.factory';
import { exerciseFactory } from '../../factory/exercise.factory';
import { planSubscriptionFactory } from '../../factory/plan-subscription.factory';

describe('Workout Session Controller - (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;
  let url: string;
  let server: SetupServer;
  let configuration: { [key: string]: string | number | undefined };

  beforeAll(async () => {
    const setup = await createNestApp([TrainingPlanModule]);
    app = setup.app;
    module = setup.module;
    configuration = setup.configuration;
    server = setup.server;
    await app.listen(0);

    url = await app.getUrl();
  });

  beforeEach(async () => {
    await testDbClient(Tables.ActiveSetLog).del();
    await testDbClient(Tables.ActiveWorkoutSession).del();
    await testDbClient(Tables.PlanDayProgress).del();
    await testDbClient(Tables.ExerciseLog).del();
    await testDbClient(Tables.PlanSubscription).del();
    await testDbClient(Tables.Exercise).del();
    await testDbClient(Tables.Day).del();
    await testDbClient(Tables.TrainingPlan).del();
    await testDbClient(Tables.User).del();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(async () => {
    if (module) {
      await testDbClient(Tables.ActiveSetLog).del();
      await testDbClient(Tables.ActiveWorkoutSession).del();
      await testDbClient(Tables.PlanDayProgress).del();
      await testDbClient(Tables.ExerciseLog).del();
      await testDbClient(Tables.PlanSubscription).del();
      await testDbClient(Tables.Exercise).del();
      await testDbClient(Tables.Day).del();
      await testDbClient(Tables.TrainingPlan).del();
      await testDbClient(Tables.User).del();
      await module.close();
    }

    if (app) {
      await app.close();
    }
  });

  const getAuthorizationHeader = (userId: string) => {
    return {
      Authorization: `Bearer ${sign(
        {
          sub: userId,
        },
        configuration['auth.jwtSecret'] as string
      )}`,
    };
  };

  describe('Manage workout session lifecycle', () => {
    it('should create, log sets, resume and finish a workout session', async () => {
      // 1. Setup data
      const user = userFactory.build();
      await testDbClient(Tables.User).insert(user);

      const plan = trainingPlanFactory.build({ authorId: user.id });
      await testDbClient(Tables.TrainingPlan).insert(plan);

      const day = dayFactory.build({ trainingPlanId: plan.id });
      await testDbClient(Tables.Day).insert(day);

      const exercise = exerciseFactory.build({ dayId: day.id });
      await testDbClient(Tables.Exercise).insert(exercise);

      const subscription = planSubscriptionFactory.build({
        userId: user.id,
        trainingPlanId: plan.id,
      });
      await testDbClient(Tables.PlanSubscription).insert(subscription);

      const authHeader = getAuthorizationHeader(user.id!);

      // 2. Start session
      const startResponse = await fetch(`${url}/training-plan/session/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify({ dayId: day.id }),
      });

      expect(startResponse.status).toBe(HttpStatus.OK);
      const session = (await startResponse.json()) as {
        id: string;
        userId: string;
        currentExerciseId: string;
        planDayProgressId: string;
      };
      expect(session.userId).toBe(user.id!);
      expect(session.currentExerciseId).toBe(exercise.id!);

      // 3. Log a set
      const logSetResponse = await fetch(`${url}/training-plan/session/log-set`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify({
          exerciseId: exercise.id,
          reps: 10,
          weight: 60,
          rpe: 8,
        }),
      });

      expect(logSetResponse.status).toBe(HttpStatus.OK);
      const updatedSession = (await logSetResponse.json()) as {
        currentSetIndex: number;
        adaptiveRestDurationSeconds: number;
      };
      expect(updatedSession.currentSetIndex).toBe(1);
      expect(updatedSession.adaptiveRestDurationSeconds).toBe(90); // RPE 8 -> 90s

      // 4. Resume session (GET /active)
      const activeResponse = await fetch(`${url}/training-plan/session/active`, {
        method: 'GET',
        headers: authHeader,
      });

      expect(activeResponse.status).toBe(HttpStatus.OK);
      const activeSessionData = (await activeResponse.json()) as {
        id: string;
        logs: { exerciseId: string; reps: number; weight: number }[];
      };
      expect(activeSessionData.id).toBe(session.id!);
      expect(activeSessionData.logs).toHaveLength(1);

      // 5. Finish session
      const finishResponse = await fetch(`${url}/training-plan/session/finish`, {
        method: 'POST',
        headers: authHeader,
      });

      expect(finishResponse.status).toBe(HttpStatus.NO_CONTENT);

      // 6. Verify data persistent state
      // Active session should be deleted
      const sessionInDb = await testDbClient(Tables.ActiveWorkoutSession)
        .where({ id: session.id })
        .first();
      expect(sessionInDb).toBeUndefined();

      // Exercise log should be created
      const logsInDb = await testDbClient(Tables.ExerciseLog)
        .where({ userId: user.id, exerciseId: exercise.id })
        .first();
      expect(logsInDb).toBeDefined();
      // reps and weight are stored as strings in SQLite/simple-array or comma-separated text
      expect(logsInDb.reps).toContain('10');
      expect(logsInDb.weight).toContain('60');

      // Progress status should be COMPLETED
      const progressInDb = await testDbClient(Tables.PlanDayProgress)
        .where({ id: session.planDayProgressId })
        .first();
      expect(progressInDb.status).toBe('COMPLETED');
    }, 30000);

    it('should return existing session if user starts again', async () => {
      const user = userFactory.build();
      await testDbClient(Tables.User).insert(user);

      const plan = trainingPlanFactory.build({ authorId: user.id });
      await testDbClient(Tables.TrainingPlan).insert(plan);

      const day = dayFactory.build({ trainingPlanId: plan.id });
      await testDbClient(Tables.Day).insert(day);

      const subscription = planSubscriptionFactory.build({
        userId: user.id,
        trainingPlanId: plan.id,
      });
      await testDbClient(Tables.PlanSubscription).insert(subscription);

      const authHeader = getAuthorizationHeader(user.id!);

      const response1 = await fetch(`${url}/training-plan/session/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify({ dayId: day.id }),
      });

      const session1 = (await response1.json()) as { id: string };

      const response2 = await fetch(`${url}/training-plan/session/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify({ dayId: day.id }),
      });

      const session2 = (await response2.json()) as { id: string };

      expect(session1.id).toBe(session2.id);
    });

    it('should cancel an active workout session and set status to CANCELLED', async () => {
      const user = userFactory.build();
      await testDbClient(Tables.User).insert(user);

      const plan = trainingPlanFactory.build({ authorId: user.id });
      await testDbClient(Tables.TrainingPlan).insert(plan);

      const day = dayFactory.build({ trainingPlanId: plan.id });
      await testDbClient(Tables.Day).insert(day);

      const subscription = planSubscriptionFactory.build({
        userId: user.id,
        trainingPlanId: plan.id,
      });
      await testDbClient(Tables.PlanSubscription).insert(subscription);

      const authHeader = getAuthorizationHeader(user.id!);

      const startResponse = await fetch(`${url}/training-plan/session/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify({ dayId: day.id }),
      });

      const session = (await startResponse.json()) as {
        id: string;
        planDayProgressId: string;
      };

      const cancelResponse = await fetch(`${url}/training-plan/session/cancel`, {
        method: 'POST',
        headers: authHeader,
      });

      expect(cancelResponse.status).toBe(HttpStatus.NO_CONTENT);

      // Active session should be deleted
      const sessionInDb = await testDbClient(Tables.ActiveWorkoutSession)
        .where({ id: session.id })
        .first();
      expect(sessionInDb).toBeUndefined();

      // Progress status should be CANCELLED
      const progressInDb = await testDbClient(Tables.PlanDayProgress)
        .where({ id: session.planDayProgressId })
        .first();
      expect(progressInDb.status).toBe('CANCELLED');
    });

    it('should throw 404 when getting active session if none exists', async () => {
      const user = userFactory.build();
      await testDbClient(Tables.User).insert(user);
      const authHeader = getAuthorizationHeader(user.id!);

      const response = await fetch(`${url}/training-plan/session/active`, {
        method: 'GET',
        headers: authHeader,
      });

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
