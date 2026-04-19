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
import { TrainingPlanModule } from '@src/module/training-plan/training-plan.module';
import { Tables } from '@testInfra/enum/table.enum';
import { testDbClient } from '@testInfra/knex.database';
import { createNestApp } from '@testInfra/test-e2e.setup';
import { sign } from 'jsonwebtoken';
import { SetupServer } from 'msw/node';
import { dayFactory } from '../../factory/day.factory';
import { trainingPlanFactory } from '../../factory/training-plan.factory';
import { exerciseFactory } from '../../factory/exercise.factory';
import { ExerciseType } from '@src/module/training-plan/core/enum/exercise-type.enum';
import { Exercise } from '@src/module/training-plan/persistence/entity/exercise.entity';

describe('Exercise Controller - (e2e)', () => {
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
    await testDbClient(Tables.Exercise).del();
    await testDbClient(Tables.Day).del();
    await testDbClient(Tables.TrainingPlan).del();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(async () => {
    if (module) {
      await testDbClient(Tables.Exercise).del();
      await testDbClient(Tables.Day).del();
      await testDbClient(Tables.TrainingPlan).del();
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

  describe('POST /exercise', () => {
    it('should create an exercise successfully', async () => {
      const trainingPlan = trainingPlanFactory.build();
      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      const day = dayFactory.build({ trainingPlanId: trainingPlan.id });
      await testDbClient(Tables.Day).insert(day);

      const exerciseRequest = {
        name: 'Bench Press',
        dayId: day.id,
        type: ExerciseType.work,
        setsNumber: 3,
        repsNumber: 10,
        description: 'Push the bar up',
      };

      const response = await fetch(`${url}/exercise`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(trainingPlan.authorId!),
        },
        body: JSON.stringify(exerciseRequest),
      });

      expect(response.status).toBe(HttpStatus.CREATED);
      const exercises = await testDbClient(Tables.Exercise).select('*');
      expect(exercises).toHaveLength(1);
    });
  });

  describe('GET /exercise/list/:trainingId', () => {
    it('should list exercises for a day', async () => {
      const trainingPlan = trainingPlanFactory.build();
      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      const day = dayFactory.build({ trainingPlanId: trainingPlan.id });
      await testDbClient(Tables.Day).insert(day);

      const exercise = exerciseFactory.build({ dayId: day.id });
      await testDbClient(Tables.Exercise).insert(exercise);

      const response = await fetch(`${url}/exercise/list/${day.id}`, {
        headers: {
          ...getAuthorizationHeader(trainingPlan.authorId!),
        },
      });

      expect(response.status).toBe(HttpStatus.OK);
      const body = await response.json();
      expect(body).toHaveLength(1);
    });
  });

  describe('GET /exercise/:exerciseId', () => {
    it('should get an exercise by id', async () => {
      const trainingPlan = trainingPlanFactory.build();
      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      const day = dayFactory.build({ trainingPlanId: trainingPlan.id });
      await testDbClient(Tables.Day).insert(day);

      const exercise = exerciseFactory.build({ dayId: day.id });
      await testDbClient(Tables.Exercise).insert(exercise);

      const response = await fetch(`${url}/exercise/${exercise.id}`, {
        headers: {
          ...getAuthorizationHeader(trainingPlan.authorId!),
        },
      });

      expect(response.status).toBe(HttpStatus.OK);
      const body = (await response.json()) as Partial<Exercise>;
      expect(body.id).toBe(exercise.id);
    });
  });

  describe('DELETE /exercise/:exerciseId', () => {
    it('should delete an exercise successfully (soft delete)', async () => {
      const trainingPlan = trainingPlanFactory.build();
      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      const day = dayFactory.build({ trainingPlanId: trainingPlan.id });
      await testDbClient(Tables.Day).insert(day);

      const exercise = exerciseFactory.build({ dayId: day.id });
      await testDbClient(Tables.Exercise).insert(exercise);

      const response = await fetch(`${url}/exercise/${exercise.id}`, {
        method: 'DELETE',
        headers: {
          ...getAuthorizationHeader(trainingPlan.authorId!),
        },
      });

      expect(response.status).toBe(HttpStatus.OK);
      const dbExercise = await testDbClient(Tables.Exercise)
        .where({ id: exercise.id })
        .first();
      expect(dbExercise.deletedAt).not.toBeNull();
    });
  });
});
