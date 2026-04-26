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
import { MeasurementType } from '@src/module/identity/core/enum/measurement-type.enum';
import { MetricGoalStatus } from '@src/module/identity/core/enum/metric-goal-status.enum';
import { IdentityModule } from '@src/module/identity/identity.module';
import { Tables } from '@testInfra/enum/table.enum';
import { testDbClient } from '@testInfra/knex.database';
import { createNestApp } from '@testInfra/test-e2e.setup';
import { SetupServer } from 'msw/node';
import { userFactory } from '../../factory/user.factory';

describe('Identity - User Goals Controller - (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;
  let url: string;
  let server: SetupServer;
  let configuration: { [key: string]: string | number | undefined };

  beforeAll(async () => {
    const setup = await createNestApp([IdentityModule]);
    app = setup.app;
    module = setup.module;
    configuration = setup.configuration;
    server = setup.server;
    await app.listen(0);

    url = await app.getUrl();
  });

  beforeEach(async () => {
    await testDbClient(Tables.User).del();
  });

  afterEach(async () => {
    await testDbClient(Tables.User).del();
    server.resetHandlers();
  });

  afterAll(async () => {
    if (module) {
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

  describe('POST /identity/user/profile/goals', () => {
    it('should create a new weight goal', async () => {
      const user = userFactory.build({ currentWeight: 80 });
      await testDbClient(Tables.User).insert(user);

      const response = await fetch(`${url}/identity/user/profile/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(user.id!),
        },
        body: JSON.stringify({
          type: 'WEIGHT',
          targetValue: 75,
          deadline: new Date('2026-12-31').toISOString(),
        }),
      });

      expect(response.status).toBe(HttpStatus.CREATED);
      const data = (await response.json()) as {
        type: string;
        startingValue: number;
        targetValue: number;
        status: MetricGoalStatus;
      };
      expect(data.type).toBe('WEIGHT');
      expect(data.startingValue).toBe(80);
      expect(data.targetValue).toBe(75);
      expect(data.status).toBe(MetricGoalStatus.ACTIVE);
    });
  });

  describe('Auto-Achievement Logic', () => {
    it('should achieve weight loss goal when logging lower weight', async () => {
      const user = userFactory.build({ currentWeight: 85 });
      await testDbClient(Tables.User).insert(user);

      // Create goal
      await testDbClient(Tables.MetricGoal).insert({
        id: crypto.randomUUID(),
        userId: user.id,
        type: 'WEIGHT',
        startingValue: 85,
        targetValue: 80,
        status: MetricGoalStatus.ACTIVE,
      });

      // Log weight that achieves goal
      await fetch(`${url}/identity/user/profile/weight`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(user.id!),
        },
        body: JSON.stringify({
          weight: 79.5,
        }),
      });

      const goal = await testDbClient(Tables.MetricGoal)
        .where({ userId: user.id })
        .first();
      expect(goal.status).toBe(MetricGoalStatus.ACHIEVED);
      expect(goal.achievedAt).not.toBeNull();
    });

    it('should achieve muscle gain goal when logging higher muscle mass', async () => {
      const user = userFactory.build();
      await testDbClient(Tables.User).insert(user);

      // Create goal
      await testDbClient(Tables.MetricGoal).insert({
        id: crypto.randomUUID(),
        userId: user.id,
        type: MeasurementType.MUSCLE_MASS,
        startingValue: 30,
        targetValue: 35,
        status: MetricGoalStatus.ACTIVE,
      });

      // Log measurement that achieves goal
      await fetch(`${url}/identity/user/profile/measurements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(user.id!),
        },
        body: JSON.stringify({
          measurements: [{ type: MeasurementType.MUSCLE_MASS, value: 36 }],
        }),
      });

      const goal = await testDbClient(Tables.MetricGoal)
        .where({ userId: user.id })
        .first();
      expect(goal.status).toBe(MetricGoalStatus.ACHIEVED);
    });
  });

  describe('GET /identity/user/profile/goals', () => {
    it('should calculate progress percentage for active goal', async () => {
      const user = userFactory.build({ currentWeight: 80 });
      await testDbClient(Tables.User).insert(user);

      // Create goal: 80kg -> 70kg (Total distance 10kg)
      await testDbClient(Tables.MetricGoal).insert({
        id: crypto.randomUUID(),
        userId: user.id,
        type: 'WEIGHT',
        startingValue: 80,
        targetValue: 70,
        status: MetricGoalStatus.ACTIVE,
      });

      // Log progress: 75kg (Current distance 5kg = 50% progress)
      await fetch(`${url}/identity/user/profile/weight`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(user.id!),
        },
        body: JSON.stringify({ weight: 75 }),
      });

      const response = await fetch(`${url}/identity/user/profile/goals`, {
        headers: getAuthorizationHeader(user.id!),
      });

      expect(response.status).toBe(HttpStatus.OK);
      const data = (await response.json()) as { type: string; progress: number }[];
      expect(data[0].progress).toBe(0.5);
    });
  });
});
