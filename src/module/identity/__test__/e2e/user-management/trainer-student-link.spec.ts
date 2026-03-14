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
    await testDbClient(Tables.User).del();
  });

  afterAll(async () => {
    if (module) {
      await testDbClient(Tables.TrainerStudentRelationship).del();
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

    it('should return 404 when invite code is invalid', async () => {
      const student = userFactory.build({ type: UserType.client });
      await testDbClient(Tables.User).insert(student);

      const response = await fetch(`${url}/identity/user/profile/link-trainer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(student.id!, UserType.client),
        },
        body: JSON.stringify({ inviteCode: 'NON-EXISTENT' }),
      });

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('Relationship Discovery', () => {
    it('should allow trainer to list their students', async () => {
      const trainer = userFactory.build({ type: UserType.personalTrainer });
      const student1 = userFactory.build({ type: UserType.client });
      const student2 = userFactory.build({ type: UserType.client });
      
      await testDbClient(Tables.User).insert([trainer, student1, student2]);
      
      await testDbClient(Tables.TrainerStudentRelationship).insert([
        { trainerId: trainer.id, studentId: student1.id },
        { trainerId: trainer.id, studentId: student2.id },
      ]);

      const response = await fetch(`${url}/identity/user/profile/students`, {
        headers: getAuthorizationHeader(trainer.id!, UserType.personalTrainer),
      });

      expect(response.status).toBe(HttpStatus.OK);
      const body = await response.json();
      expect(body).toHaveLength(2);
      expect(body.some((s: any) => s.id === student1.id)).toBe(true);
    });
  });

  describe('Unlinking', () => {
    it('should allow a student to unlink from their trainer', async () => {
      const trainer = userFactory.build({ type: UserType.personalTrainer });
      const student = userFactory.build({ type: UserType.client });
      
      await testDbClient(Tables.User).insert([trainer, student]);
      await testDbClient(Tables.TrainerStudentRelationship).insert({ 
        trainerId: trainer.id, 
        studentId: student.id 
      });

      const response = await fetch(`${url}/identity/user/profile/unlink-trainer`, {
        method: 'DELETE',
        headers: getAuthorizationHeader(student.id!, UserType.client),
      });

      expect(response.status).toBe(HttpStatus.OK);

      const relationships = await testDbClient(Tables.TrainerStudentRelationship)
        .select('*')
        .where({ studentId: student.id });
      expect(relationships).toHaveLength(0);
    });
  });
});
