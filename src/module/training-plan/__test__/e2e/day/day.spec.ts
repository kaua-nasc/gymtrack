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
import { dayFactory } from '../../factory/day.factory';
import { trainingPlanFactory } from '../../factory/training-plan.factory';
import { ExerciseType } from '@src/module/training-plan/core/enum/exercise-type.enum';

describe('Day Controller - (e2e)', () => {
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
    await testDbClient(Tables.Day).del();
    await testDbClient(Tables.TrainingPlan).del();
    await testDbClient(Tables.User).del();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(async () => {
    if (module) {
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

  describe('POST /day', () => {
    it('should create a day successfully', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });
      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);

      const dayRequest = {
        name: 'New Training Day',
        trainingPlanId: trainingPlan.id,
      };

      const response = await fetch(`${url}/day`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(user.id!),
        },
        body: JSON.stringify(dayRequest),
      });

      expect(response.status).toBe(HttpStatus.CREATED);
      const days = await testDbClient(Tables.Day).select('*');
      expect(days).toHaveLength(1);
      expect(days[0].name).toBe(dayRequest.name);
    });

    it('should return 400 when trainingPlanId is invalid', async () => {
      const user = userFactory.build();
      const dayRequest = {
        name: 'Invalid Day',
        trainingPlanId: 'not-a-uuid',
      };

      const response = await fetch(`${url}/day`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(user.id!),
        },
        body: JSON.stringify(dayRequest),
      });

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('POST /day/list', () => {
    it('should create many days with exercises successfully', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });
      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);

      const daysRequest = [
        {
          name: 'Day 1',
          trainingPlanId: trainingPlan.id,
          exercises: [
            {
              name: 'Exercise 1',
              type: ExerciseType.work,
              setsNumber: 3,
              repsNumber: 10,
              description: 'Desc 1',
            },
          ],
        },
        {
          name: 'Day 2',
          trainingPlanId: trainingPlan.id,
          exercises: [
            {
              name: 'Exercise 2',
              type: ExerciseType.cardio,
              setsNumber: 1,
              repsNumber: 1,
              description: 'Desc 2',
            },
          ],
        },
      ];

      const response = await fetch(`${url}/day/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(user.id!),
        },
        body: JSON.stringify(daysRequest),
      });

      expect(response.status).toBe(HttpStatus.CREATED);
      const days = await testDbClient(Tables.Day).select('*');
      expect(days).toHaveLength(2);
    });
  });

  describe('DELETE /day/:dayId', () => {
    it('should delete a day successfully', async () => {
      const user = userFactory.build();
      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });
      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);

      const day = dayFactory.build({ trainingPlanId: trainingPlan.id });
      await testDbClient(Tables.Day).insert(day);

      const response = await fetch(`${url}/day/${day.id}`, {
        method: 'DELETE',
        headers: {
          ...getAuthorizationHeader(user.id!),
        },
      });

      expect(response.status).toBe(HttpStatus.OK);
      const days = await testDbClient(Tables.Day).where({ id: day.id }).first();
      expect(days.deletedAt).not.toBeNull();
    });
  });
});
