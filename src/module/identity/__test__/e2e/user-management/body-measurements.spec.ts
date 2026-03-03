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
import { MeasurementType } from '@src/module/identity/core/enum/measurement-type.enum';
import { WeightUnit } from '@src/module/identity/core/enum/weight-unit.enum';

describe('Identity - Body Measurements Controller - (e2e)', () => {
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
    await testDbClient(Tables.BodyMeasurement).del();
    await testDbClient(Tables.User).del();
  });

  afterEach(async () => {
    await testDbClient(Tables.BodyMeasurement).del();
    await testDbClient(Tables.User).del();
    server.resetHandlers();
  });

  afterAll(async () => {
    if (module) {
      await testDbClient(Tables.BodyMeasurement).del();
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

  describe('POST /identity/user/profile/measurements', () => {
    it('should add multiple body measurements in bulk', async () => {
      const user = userFactory.build();
      await testDbClient(Tables.User).insert(user);

      const response = await fetch(`${url}/identity/user/profile/measurements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(user.id!),
        },
        body: JSON.stringify({
          measurements: [
            { type: MeasurementType.WAIST, value: 85 },
            { type: MeasurementType.BODY_FAT, value: 15.5 },
          ],
          measuredAt: new Date().toISOString(),
        }),
      });

      expect(response.status).toBe(HttpStatus.CREATED);
      const data = await response.json() as { type: MeasurementType, value: number }[];
      expect(data.length).toBe(2);

      const savedMeasurements = await testDbClient(Tables.BodyMeasurement).where({ userId: user.id });
      expect(savedMeasurements.length).toBe(2);
    });

    it('should convert units for mass and length measurements', async () => {
      // User with Imperial preferences
      const user = userFactory.build({ weightUnit: WeightUnit.lb });
      await testDbClient(Tables.User).insert(user);

      const response = await fetch(`${url}/identity/user/profile/measurements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(user.id!),
        },
        body: JSON.stringify({
          measurements: [
            { type: MeasurementType.MUSCLE_MASS, value: 154.32 }, // ~70 kg
            { type: MeasurementType.WAIST, value: 31.5 }, // ~80 cm (if user heightUnit is cm)
          ],
        }),
      });

      expect(response.status).toBe(HttpStatus.CREATED);
      
      const savedMuscle = await testDbClient(Tables.BodyMeasurement)
        .where({ userId: user.id, type: MeasurementType.MUSCLE_MASS })
        .first();
      expect(Math.abs(Number(savedMuscle.value) - 70)).toBeLessThan(0.1);
    });
  });

  describe('GET /identity/user/profile/measurements/latest', () => {
    it('should retrieve only the latest measurement for each type', async () => {
      const user = userFactory.build();
      await testDbClient(Tables.User).insert(user);

      await testDbClient(Tables.BodyMeasurement).insert([
        { id: crypto.randomUUID(), userId: user.id, type: MeasurementType.WAIST, value: 90, measuredAt: new Date('2026-01-01') },
        { id: crypto.randomUUID(), userId: user.id, type: MeasurementType.WAIST, value: 85, measuredAt: new Date('2026-01-02') },
        { id: crypto.randomUUID(), userId: user.id, type: MeasurementType.BODY_FAT, value: 18, measuredAt: new Date('2026-01-01') },
      ]);

      const response = await fetch(`${url}/identity/user/profile/measurements/latest`, {
        headers: getAuthorizationHeader(user.id!),
      });

      expect(response.status).toBe(HttpStatus.OK);
      const data = await response.json() as { type: MeasurementType, value: number }[];
      expect(data.length).toBe(2);
      
      const waist = data.find((m: any) => m.type === MeasurementType.WAIST);
      expect(Number(waist?.value)).toBe(85);
    });
  });
});
