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
import { JwtService } from '@nestjs/jwt';
import { TestingModule } from '@nestjs/testing';
import { userFactory } from '@src/module/identity/__test__/factory/user.factory';
import { TrainingPlanModule } from '@src/module/training-plan/training-plan.module';
import { Tables } from '@testInfra/enum/table.enum';
import { testDbClient } from '@testInfra/knex.database';
import { createNestApp } from '@testInfra/test-e2e.setup';
import { SetupServer } from 'msw/node';
import { dayFactory } from '../../factory/day.factory';
import { exerciseFactory } from '../../factory/exercise.factory';
import { exerciseLogFactory } from '../../factory/exercise-log.factory';
import { planSubscriptionFactory } from '../../factory/plan-subscription.factory';
import { trainingPlanFactory } from '../../factory/training-plan.factory';

describe('Exercise Log Controller - (e2e)', () => {
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
    await testDbClient(Tables.ExerciseLog).del();
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
      await testDbClient(Tables.ExerciseLog).del();
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
      Authorization: `Bearer ${new JwtService().sign(
        {
          sub: userId,
        },
        { secret: configuration['auth.jwtSecret'] as string }
      )}`,
    };
  };

  describe('POST /exercise-log', () => {
    it('should create an exercise log successfully', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });
      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      const day = dayFactory.build({ trainingPlanId: trainingPlan.id });
      await testDbClient(Tables.Day).insert(day);
      const exercise = exerciseFactory.build({ dayId: day.id });
      await testDbClient(Tables.Exercise).insert(exercise);

      const logRequest = {
        userId: user.id,
        exerciseId: exercise.id,
        reps: [12, 10, 8],
        weight: [60, 65, 70],
        notes: 'Good progress',
      };

      const response = await fetch(`${url}/exercise-log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(user.id!),
        },
        body: JSON.stringify(logRequest),
      });

      expect(response.status).toBe(HttpStatus.CREATED);
      const logs = await testDbClient(Tables.ExerciseLog).select('*');
      expect(logs).toHaveLength(1);
    });
  });

  describe('GET /exercise-log/history/:userId/:exerciseId', () => {
    it('should return exercise log history for a user', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });
      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      const day = dayFactory.build({ trainingPlanId: trainingPlan.id });
      await testDbClient(Tables.Day).insert(day);
      const exercise = exerciseFactory.build({ dayId: day.id });
      await testDbClient(Tables.Exercise).insert(exercise);

      const log = exerciseLogFactory.build({
        userId: user.id,
        exerciseId: exercise.id,
        reps: [10, 10], // Knex might expect a string or it might handle array if using a specific plugin, but let's see.
        weight: [50, 50],
      });

      // Knex pg simple-array needs to be a string for insertion if not handled by an interceptor
      await testDbClient(Tables.ExerciseLog).insert({
        ...log,
        reps: log.reps?.join(','),
        weight: log.weight?.join(','),
      });

      const response = await fetch(
        `${url}/exercise-log/history/${user.id}/${exercise.id}`,
        {
          headers: {
            ...getAuthorizationHeader(user.id!),
          },
        }
      );

      expect(response.status).toBe(HttpStatus.OK);
      const body = (await response.json()) as { exerciseId: string }[];
      expect(body).toHaveLength(1);
      expect(body[0].exerciseId).toBe(exercise.id!);
    });
  });

  describe('GET /exercise-log/activity/weekly/:userId', () => {
    it('should return weekly activity with training on current day', async () => {
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

      // 1. Start session
      await fetch(`${url}/training-plan/session/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify({ dayId: day.id }),
      });

      // 2. Log a set (to have logs so finish works)
      await fetch(`${url}/training-plan/session/log-set`, {
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

      // 3. Finish session (marks progress as COMPLETED)
      await fetch(`${url}/training-plan/session/finish`, {
        method: 'POST',
        headers: authHeader,
      });

      const response = await fetch(`${url}/exercise-log/activity/weekly`, {
        headers: {
          ...authHeader,
        },
      });

      expect(response.status).toBe(HttpStatus.OK);
      const body = (await response.json()) as Record<string, boolean>;

      const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
      const todayIndex = new Date().getDay();
      const todayKey = dayNames[todayIndex];

      expect(body[todayKey]).toBe(true);
    }, 30000);
  });
});
