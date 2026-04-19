import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { UserType } from '@src/module/identity/core/enum/user-type.enum';
import { userFactory } from '@src/module/identity/__test__/factory/user.factory';
import { IdentityModule } from '@src/module/identity/identity.module';
import { Tables } from '@testInfra/enum/table.enum';
import { testDbClient } from '@testInfra/knex.database';
import { createNestApp } from '@testInfra/test-e2e.setup';
import { sign } from 'jsonwebtoken';
import { WeightLog } from '@src/module/identity/persistence/entity/weight-log.entity';

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

  describe('Professional Verification (CREF)', () => {
    it('should allow upgrade to trainer with CREF and set isVerified to true', async () => {
      const user = userFactory.build({ type: UserType.client });
      await testDbClient(Tables.User).insert(user);

      const cref = '123456-G/SP';
      const response = await fetch(`${url}/identity/user/profile/upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(user.id!, UserType.client),
        },
        body: JSON.stringify({ cref }),
      });

      expect(response.status).toBe(HttpStatus.OK);

      const [updatedUser] = await testDbClient(Tables.User)
        .select('type', 'cref', 'isVerified')
        .where({ id: user.id });

      expect(updatedUser.type).toBe(UserType.personalTrainer);
      expect(updatedUser.cref).toBe(cref);
      expect(updatedUser.isVerified).toBe(true);
    });

    it('should reset isVerified to false when CREF is changed', async () => {
      const trainer = userFactory.build({
        type: UserType.personalTrainer,
        cref: 'OLD-CREF',
        isVerified: true,
      });
      await testDbClient(Tables.User).insert(trainer);

      const newCref = 'NEW-CREF-123';
      const profileUrl = `${url}/identity/user/profile`;
      const response = await fetch(profileUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(trainer.id!, UserType.personalTrainer),
        },
        body: JSON.stringify({
          firstName: 'New',
          lastName: 'Name',
          bio: 'New bio',
          cref: newCref,
        }),
      });

      if (response.status === 404) {
        console.log(`404 at ${profileUrl}`);
      }

      expect(response.status).toBe(HttpStatus.OK);

      const [updatedTrainer] = await testDbClient(Tables.User)
        .select('cref', 'isVerified')
        .where({ id: trainer.id });

      expect(updatedTrainer.cref).toBe(newCref);
      expect(updatedTrainer.isVerified).toBe(false);
    });

    it('should return 409 when attempting to use a CREF already in use', async () => {
      const trainer1 = userFactory.build({
        type: UserType.personalTrainer,
        cref: 'EXISTING-CREF',
      });
      const user2 = userFactory.build({ type: UserType.client });
      await testDbClient(Tables.User).insert([trainer1, user2]);

      const response = await fetch(`${url}/identity/user/profile/upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(user2.id!, UserType.client),
        },
        body: JSON.stringify({ cref: 'EXISTING-CREF' }),
      });

      expect(response.status).toBe(HttpStatus.CONFLICT);
    });
  });

  describe('Linking Relationship', () => {
    it('should allow a student to link to a trainer via invite code', async () => {
      const trainer = userFactory.build({
        type: UserType.personalTrainer,
        trainerInviteCode: 'LINK-ME',
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

      const response = await fetch(
        `${url}/identity/user/trainer/students/${student.id}/metrics/weight`,
        {
          headers: getAuthorizationHeader(trainer.id!, UserType.personalTrainer),
        }
      );

      expect(response.status).toBe(HttpStatus.OK);
      const body = (await response.json()) as { items: WeightLog[] };
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
        {
          id: crypto.randomUUID(),
          userId: student.id,
          weight: 90,
          measuredAt: yesterday,
        },
        { id: crypto.randomUUID(), userId: student.id, weight: 85, measuredAt: today },
      ]);

      const response = await fetch(
        `${url}/identity/user/trainer/students/${student.id}/metrics/weight`,
        {
          headers: getAuthorizationHeader(trainer.id!, UserType.personalTrainer),
        }
      );

      const body = (await response.json()) as { items: WeightLog[] };
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
        measuredAt: yesterday,
      });

      const response = await fetch(
        `${url}/identity/user/trainer/students/${student.id}/metrics/weight`,
        {
          headers: getAuthorizationHeader(trainer.id!, UserType.personalTrainer),
        }
      );

      expect(((await response.json()) as { items: unknown[] }).items).toHaveLength(1);
    });
  });
});
