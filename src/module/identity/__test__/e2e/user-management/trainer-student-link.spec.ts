import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'bun:test';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { UserType } from '@src/module/identity/core/enum/user-type.enum';
import { userFactory } from '@src/module/identity/__test__/factory/user.factory';
import { IdentityModule } from '@src/module/identity/identity.module';
import { Tables } from '@testInfra/enum/table.enum';
import { testDbClient } from '@testInfra/knex.database';
import { createNestApp } from '@testInfra/test-e2e.setup';
import { sign } from 'jsonwebtoken';

describe('Identity - Trainer Student Link - (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;
  let url: string;
  let configuration: { [key: string]: string | number | undefined };

  beforeAll(async () => {
    const setup = await createNestApp([IdentityModule]);
    app = setup.app;
    module = setup.module;
    configuration = setup.configuration;
    await app.listen(0);
    url = await app.getUrl();
  });

  beforeEach(async () => {
    await testDbClient(Tables.TrainerStudentRelationship).del();
    await testDbClient(Tables.WeightLog).del();
    await testDbClient(Tables.UserPrivacySettings).del();
    await testDbClient(Tables.User).del();
  });

  afterAll(async () => {
    if (module) {
      await testDbClient(Tables.TrainerStudentRelationship).del();
      await testDbClient(Tables.WeightLog).del();
      await testDbClient(Tables.UserPrivacySettings).del();
      await testDbClient(Tables.User).del();
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

  describe('Invite Code Management', () => {
    it('should allow PERSONAL_TRAINER to update their invite code', async () => {
      const trainer = userFactory.build({ type: UserType.personalTrainer });
      await testDbClient(Tables.User).insert(trainer);

      const inviteCode = 'COACH-XPTO';
      const response = await fetch(`${url}/identity/user/profile/trainer-code`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(trainer.id!, UserType.personalTrainer),
        },
        body: JSON.stringify({ inviteCode }),
      });

      expect(response.status).toBe(HttpStatus.OK);

      const [updatedTrainer] = await testDbClient(Tables.User)
        .select('trainerInviteCode')
        .where({ id: trainer.id });
      expect(updatedTrainer.trainerInviteCode).toBe(inviteCode);
    });

    it('should prevent CLIENT from having an invite code', async () => {
      const client = userFactory.build({ type: UserType.client });
      await testDbClient(Tables.User).insert(client);

      const response = await fetch(`${url}/identity/user/profile/trainer-code`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(client.id!, UserType.client),
        },
        body: JSON.stringify({ inviteCode: 'IMPOSTOR' }),
      });

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('Linking Relationship', () => {
    it('should allow a student to link to a trainer via invite code', async () => {
      const trainer = userFactory.build({ 
        type: UserType.personalTrainer,
        trainerInviteCode: 'LINK-ME'
      });
      const student = userFactory.build({ type: UserType.client });
      
      await testDbClient(Tables.User).insert([trainer, student]);

      const response = await fetch(`${url}/identity/user/profile/link-trainer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(student.id!, UserType.client),
        },
        body: JSON.stringify({ inviteCode: 'LINK-ME' }),
      });

      expect(response.status).toBe(HttpStatus.OK);

      const [relationship] = await testDbClient(Tables.TrainerStudentRelationship)
        .select('*')
        .where({ studentId: student.id });
      
      expect(relationship.trainerId).toBe(trainer.id);
    });
  });

  describe('Metrics Dashboard Access', () => {
    it('should allow linked trainer to see student weight history', async () => {
      const trainer = userFactory.build({ type: UserType.personalTrainer });
      const student = userFactory.build({ type: UserType.client });
      await testDbClient(Tables.User).insert([trainer, student]);
      
      await testDbClient(Tables.TrainerStudentRelationship).insert({
        trainerId: trainer.id,
        studentId: student.id,
      });

      const weightLog = {
        id: crypto.randomUUID(),
        userId: student.id,
        weight: 80,
        measuredAt: new Date(),
      };
      await testDbClient(Tables.WeightLog).insert(weightLog);

      const response = await fetch(`${url}/identity/user/trainer/students/${student.id}/metrics/weight`, {
        headers: getAuthorizationHeader(trainer.id!, UserType.personalTrainer),
      });

      expect(response.status).toBe(HttpStatus.OK);
      const body = await response.json();
      expect(body.items).toHaveLength(1);
      expect(Number(body.items[0].weight)).toBe(80);
    });

    it('should respect student privacy settings regarding past data', async () => {
      const trainer = userFactory.build({ type: UserType.personalTrainer });
      const student = userFactory.build({ type: UserType.client });
      await testDbClient(Tables.User).insert([trainer, student]);
      
      const linkedAt = new Date();
      await testDbClient(Tables.TrainerStudentRelationship).insert({
        trainerId: trainer.id,
        studentId: student.id,
        linkedAt,
      });

      await testDbClient(Tables.UserPrivacySettings).insert({
        id: crypto.randomUUID(),
        userId: student.id,
        sharePastDataWithTrainer: false,
      });

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const today = new Date();

      await testDbClient(Tables.WeightLog).insert([
        { id: crypto.randomUUID(), userId: student.id, weight: 90, measuredAt: yesterday },
        { id: crypto.randomUUID(), userId: student.id, weight: 85, measuredAt: today },
      ]);

      const response = await fetch(`${url}/identity/user/trainer/students/${student.id}/metrics/weight`, {
        headers: getAuthorizationHeader(trainer.id!, UserType.personalTrainer),
      });

      const body = await response.json();
      expect(body.items).toHaveLength(1);
      expect(Number(body.items[0].weight)).toBe(85);
    });

    it('should show all history if student enables sharePastDataWithTrainer', async () => {
      const trainer = userFactory.build({ type: UserType.personalTrainer });
      const student = userFactory.build({ type: UserType.client });
      await testDbClient(Tables.User).insert([trainer, student]);
      
      await testDbClient(Tables.TrainerStudentRelationship).insert({
        trainerId: trainer.id,
        studentId: student.id,
        linkedAt: new Date(),
      });

      await testDbClient(Tables.UserPrivacySettings).insert({
        id: crypto.randomUUID(),
        userId: student.id,
        sharePastDataWithTrainer: true,
      });

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      await testDbClient(Tables.WeightLog).insert({ 
        id: crypto.randomUUID(), 
        userId: student.id, 
        weight: 90, 
        measuredAt: yesterday 
      });

      const response = await fetch(`${url}/identity/user/trainer/students/${student.id}/metrics/weight`, {
        headers: getAuthorizationHeader(trainer.id!, UserType.personalTrainer),
      });

      const body = await response.json();
      expect(body.items).toHaveLength(1);
    });
  });
});
