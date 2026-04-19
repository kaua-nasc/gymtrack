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
import { UserType } from '@src/module/identity/core/enum/user-type.enum';
import { MeasurementType } from '@src/module/identity/core/enum/measurement-type.enum';
import { Tables } from '@testInfra/enum/table.enum';
import { testDbClient } from '@testInfra/knex.database';
import { createNestApp } from '@testInfra/test-e2e.setup';
import { sign } from 'jsonwebtoken';
import { SetupServer } from 'msw/node';
import { userFactory } from '../../factory/user.factory';
import { randomUUID } from 'node:crypto';

describe('Identity - Trainer Notes Controller - (e2e)', () => {
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
    await testDbClient(Tables.TrainerStudentRelationship).del();
    await testDbClient(Tables.WeightLog).del();
    await testDbClient(Tables.BodyMeasurement).del();
    await testDbClient(Tables.User).del();
  });

  afterEach(async () => {
    await testDbClient(Tables.TrainerStudentRelationship).del();
    await testDbClient(Tables.WeightLog).del();
    await testDbClient(Tables.BodyMeasurement).del();
    await testDbClient(Tables.User).del();
    server.resetHandlers();
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
    if (app) {
      await app.close();
    }
  });

  const getAuthorizationHeader = (userId: string, type: UserType) => {
    return {
      Authorization: `Bearer ${sign(
        {
          sub: userId,
          type,
        },
        configuration['auth.jwtSecret'] as string
      )}`,
    };
  };

  describe('PATCH /identity/user/trainer/weight-log/:id/note', () => {
    it('should add a note to a student weight log when trainer is linked', async () => {
      // 1. Setup trainer and student
      const trainer = userFactory.build({ type: UserType.personalTrainer });
      const student = userFactory.build({ type: UserType.client });
      await testDbClient(Tables.User).insert([trainer, student]);

      // 2. Link them
      await testDbClient(Tables.TrainerStudentRelationship).insert({
        id: randomUUID(),
        trainerId: trainer.id,
        studentId: student.id,
      });

      // 3. Create a weight log for the student
      const weightLogId = randomUUID();
      await testDbClient(Tables.WeightLog).insert({
        id: weightLogId,
        userId: student.id,
        weight: 80,
        measuredAt: new Date(),
      });

      // 4. Trainer adds a note
      const note = 'Good weight maintenance!';
      const response = await fetch(
        `${url}/identity/user/trainer/weight-log/${weightLogId}/note`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthorizationHeader(trainer.id!, trainer.type!),
          },
          body: JSON.stringify({ note }),
        }
      );

      expect(response.status).toBe(HttpStatus.OK);

      // 5. Verify in DB
      const updatedLog = await testDbClient(Tables.WeightLog)
        .where({ id: weightLogId })
        .first();
      expect(updatedLog.trainerNote).toBe(note);
      expect(updatedLog.trainerNoteAt).not.toBeNull();
    });

    it('should return bad request when trainer is not linked to the student', async () => {
      const trainer = userFactory.build({ type: UserType.personalTrainer });
      const student = userFactory.build({ type: UserType.client });
      await testDbClient(Tables.User).insert([trainer, student]);

      const weightLogId = randomUUID();
      await testDbClient(Tables.WeightLog).insert({
        id: weightLogId,
        userId: student.id,
        weight: 80,
        measuredAt: new Date(),
      });

      const response = await fetch(
        `${url}/identity/user/trainer/weight-log/${weightLogId}/note`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthorizationHeader(trainer.id!, trainer.type!),
          },
          body: JSON.stringify({ note: 'Unauthorized note' }),
        }
      );

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      const data = (await response.json()) as { message: string };
      expect(data.message).toBe('this user is not your student');
    });
  });

  describe('PATCH /identity/user/trainer/body-measurement/:id/note', () => {
    it('should add a note to a student body measurement when trainer is linked', async () => {
      const trainer = userFactory.build({ type: UserType.personalTrainer });
      const student = userFactory.build({ type: UserType.client });
      await testDbClient(Tables.User).insert([trainer, student]);

      await testDbClient(Tables.TrainerStudentRelationship).insert({
        id: randomUUID(),
        trainerId: trainer.id,
        studentId: student.id,
      });

      const measurementId = randomUUID();
      await testDbClient(Tables.BodyMeasurement).insert({
        id: measurementId,
        userId: student.id,
        type: MeasurementType.CHEST,
        value: 100,
        measuredAt: new Date(),
      });

      const note = 'Impressive chest growth!';
      const response = await fetch(
        `${url}/identity/user/trainer/body-measurement/${measurementId}/note`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthorizationHeader(trainer.id!, trainer.type!),
          },
          body: JSON.stringify({ note }),
        }
      );

      expect(response.status).toBe(HttpStatus.OK);

      const updatedMeasurement = await testDbClient(Tables.BodyMeasurement)
        .where({ id: measurementId })
        .first();
      expect(updatedMeasurement.trainerNote).toBe(note);
      expect(updatedMeasurement.trainerNoteAt).not.toBeNull();
    });
  });
});
