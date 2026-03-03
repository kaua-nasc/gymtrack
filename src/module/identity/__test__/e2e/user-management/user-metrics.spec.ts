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
import { IdentityModule } from '@src/module/identity/identity.module';
import { Tables } from '@testInfra/enum/table.enum';
import { testDbClient } from '@testInfra/knex.database';
import { createNestApp } from '@testInfra/test-e2e.setup';
import { sign } from 'jsonwebtoken';
import { SetupServerApi } from 'msw/node';
import { userFactory } from '../../factory/user.factory';
import { WeightUnit } from '@src/module/identity/core/enum/weight-unit.enum';
import { HeightUnit } from '@src/module/identity/core/enum/height-unit.enum';

describe('Identity - User Metrics Controller - (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;
  let url: string;
  let server: SetupServerApi;
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
    await testDbClient(Tables.WeightLog).del();
    await testDbClient(Tables.User).del();
  });

  afterEach(async () => {
    await testDbClient(Tables.WeightLog).del();
    await testDbClient(Tables.User).del();
    server.resetHandlers();
  });

  afterAll(async () => {
    if (module) {
      await testDbClient(Tables.WeightLog).del();
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

  describe('PATCH /identity/user/profile/metrics', () => {
    it('should update user metrics in metric units', async () => {
      const user = userFactory.build();
      await testDbClient(Tables.User).insert(user);

      const response = await fetch(`${url}/identity/user/profile/metrics`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(user.id!),
        },
        body: JSON.stringify({
          height: 180,
          currentWeight: 85,
          weightUnit: WeightUnit.kg,
          heightUnit: HeightUnit.cm,
        }),
      });

      expect(response.status).toBe(HttpStatus.OK);

      const updatedUser = await testDbClient(Tables.User).where({ id: user.id }).first();
      expect(Number(updatedUser.height)).toBe(180);
      expect(Number(updatedUser.currentWeight)).toBe(85);
      expect(updatedUser.weightUnit).toBe(WeightUnit.kg);
      expect(updatedUser.heightUnit).toBe(HeightUnit.cm);
    });

    it('should update user metrics with unit conversion (Imperial to Metric)', async () => {
      const user = userFactory.build({ weightUnit: WeightUnit.lb, heightUnit: HeightUnit['ft-in'] });
      await testDbClient(Tables.User).insert(user);

      const response = await fetch(`${url}/identity/user/profile/metrics`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(user.id!),
        },
        body: JSON.stringify({
          height: 70, // 70 inches
          currentWeight: 176.37, // ~80 kg
        }),
      });

      expect(response.status).toBe(HttpStatus.OK);

      const updatedUser = await testDbClient(Tables.User).where({ id: user.id }).first();
      // 70 inches * 2.54 = 177.8
      expect(Math.abs(Number(updatedUser.height) - 177.8)).toBeLessThan(0.1);
      // 176.37 lbs * 0.453592 = 80.0
      expect(Math.abs(Number(updatedUser.currentWeight) - 80.0)).toBeLessThan(0.1);
    });
  });

  describe('POST /identity/user/profile/weight', () => {
    it('should add a weight log and update current weight', async () => {
      const user = userFactory.build({ weightUnit: WeightUnit.kg });
      await testDbClient(Tables.User).insert(user);

      const response = await fetch(`${url}/identity/user/profile/weight`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(user.id!),
        },
        body: JSON.stringify({
          weight: 90,
          measuredAt: new Date().toISOString(),
        }),
      });

      expect(response.status).toBe(HttpStatus.CREATED);
      const data = await response.json() as { weight: number };
      expect(data.weight).toBe(90);

      const updatedUser = await testDbClient(Tables.User).where({ id: user.id }).first();
      expect(Number(updatedUser.currentWeight)).toBe(90);

      const log = await testDbClient(Tables.WeightLog).where({ userId: user.id }).first();
      expect(Number(log.weight)).toBe(90);
    });
  });

  describe('GET /identity/user/profile/weight-history', () => {
    it('should retrieve weight history paginated', async () => {
      const user = userFactory.build();
      await testDbClient(Tables.User).insert(user);

      await testDbClient(Tables.WeightLog).insert([
        { id: crypto.randomUUID(), userId: user.id, weight: 80, measuredAt: new Date('2026-01-01') },
        { id: crypto.randomUUID(), userId: user.id, weight: 81, measuredAt: new Date('2026-01-02') },
        { id: crypto.randomUUID(), userId: user.id, weight: 82, measuredAt: new Date('2026-01-03') },
      ]);

      const response = await fetch(`${url}/identity/user/profile/weight-history?page=1&limit=2`, {
        headers: getAuthorizationHeader(user.id!),
      });

      expect(response.status).toBe(HttpStatus.OK);
      const data = await response.json() as { items: { weight: number, measuredAt: string }[], total: number };
      expect(data.items.length).toBe(2);
      expect(data.total).toBe(3);
      // Ordered by measuredAt DESC
      expect(Number(data.items[0].weight)).toBe(82);
    });
  });
});
