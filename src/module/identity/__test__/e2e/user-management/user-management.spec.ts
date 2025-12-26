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
import { SetupServerApi } from 'msw/node';
import { createUserFactory, userFactory } from '../../factory/user.factory';
import { userFollowsFactory } from '../../factory/user-follows.factory';
import { userPrivacySettingsFactory } from '../../factory/user-privacy-settings.factory';

describe('Identity - User Management Controller - (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;
  let url: string;
  let server: SetupServerApi;

  beforeAll(async () => {
    const setup = await createNestApp([IdentityModule]);
    app = setup.app;
    module = setup.module;
    server = setup.server;
    await app.listen(0);

    url = await app.getUrl();
  });

  beforeEach(async () => {
    await testDbClient(Tables.User).del();
  });

  afterEach(() => {
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

  describe('Create User', () => {
    it('should creates a new user', async () => {
      const user = createUserFactory.build();

      const response = await fetch(`${url}/identity/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });

      expect(response.status).toBe(HttpStatus.CREATED);
    });
    it('should throws error by already used email', async () => {
      const user = createUserFactory.build();

      await testDbClient(Tables.User).insert({
        ...user,
        id: '5e2a62de-6ead-4678-a12f-8c17e91513a3',
      });

      const res = await fetch(`${url}/identity/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });

      expect(res.status).toBe(HttpStatus.CONFLICT);
    });
  });

  describe('Get User by Id', () => {
    it('should gets an user', async () => {
      const user = userFactory.build();

      await fetch(`${url}/identity/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });

      const res = await fetch(`${url}/identity/user/${user.id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const body = (await res.json()) as { id: string; email: string };

      expect(res.status).toBe(HttpStatus.OK);
      expect(body.id).toBe(user.id!);
      expect(body.email).toBe(user.email!);
    });

    it('should return not found', async () => {
      const res = await fetch(
        `${url}/identity/user/5e2a62de-6ead-4678-a12f-8c17e91513a3`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('Follow user', () => {
    it('should follow user successfully', async () => {
      const user = userFactory.build();
      const anotherUser = userFactory.build({
        id: '5e2a62de-6ead-4678-a12f-8c17e91513a3',
        email: 'another@example.com',
      });

      await testDbClient(Tables.User).insert(user);
      await testDbClient(Tables.User).insert(anotherUser);

      const res = await fetch(
        `${url}/identity/user/follow/${user.id}/${anotherUser.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      expect(res.status).toBe(HttpStatus.CREATED);
    });

    it('should return not found when user not exists', async () => {
      const userId = '5e2a62de-6ead-4678-a12f-8c17e91513a3';
      const anotherUser = userFactory.build({ email: 'another@example.com' });

      await testDbClient(Tables.User).insert(anotherUser);

      const res = await fetch(`${url}/identity/user/follow/${userId}/${anotherUser.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return not found when followed user not exists', async () => {
      const userId = '5e2a62de-6ead-4678-a12f-8c17e91513a3';
      const user = userFactory.build();

      await testDbClient(Tables.User).insert(user);

      const res = await fetch(`${url}/identity/user/follow/${user.id}/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return bad request when user already follow another user', async () => {
      const user = userFactory.build();
      const anotherUser = userFactory.build({
        id: '5e2a62de-6ead-4678-a12f-8c17e91513a3',
        email: 'another@email.com',
      });
      const userFollows = userFollowsFactory.build({
        followerId: user.id,
        followingId: anotherUser.id,
      });

      await testDbClient(Tables.User).insert(user);
      await testDbClient(Tables.User).insert(anotherUser);

      await testDbClient(Tables.UserFollows).insert(userFollows);

      const res = await fetch(
        `${url}/identity/user/follow/${user.id}/${anotherUser.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });
  describe('Unfollow user', () => {
    it('should unfollow user successfully', async () => {
      const user = userFactory.build();
      const anotherUser = userFactory.build({
        id: '5e2a62de-6ead-4678-a12f-8c17e91513a3',
        email: 'another@example.com',
      });
      const userFollows = userFollowsFactory.build({
        followerId: user.id,
        followingId: anotherUser.id,
      });

      await testDbClient(Tables.User).insert(user);
      await testDbClient(Tables.User).insert(anotherUser);

      await testDbClient(Tables.UserFollows).insert(userFollows);

      const res = await fetch(
        `${url}/identity/user/unfollow/${user.id}/${anotherUser.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      expect(res.status).toBe(HttpStatus.OK);
    });

    it('should return bad request when paramether ids are equals', async () => {
      const user = userFactory.build();

      const res = await fetch(`${url}/identity/user/unfollow/${user.id}/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return not found when user not found', async () => {
      const user = userFactory.build();
      const anotherUser = userFactory.build({
        id: '5e2a62de-6ead-4678-a12f-8c17e91513a3',
        email: 'another@example.com',
      });

      await testDbClient(Tables.User).insert(user);

      const res = await fetch(
        `${url}/identity/user/unfollow/${user.id}/${anotherUser.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });
    it('should return bad request when user not follow another user', async () => {
      const user = userFactory.build();
      const anotherUser = userFactory.build({
        id: '5e2a62de-6ead-4678-a12f-8c17e91513a3',
        email: 'another@example.com',
      });

      await testDbClient(Tables.User).insert(user);
      await testDbClient(Tables.User).insert(anotherUser);

      const res = await fetch(
        `${url}/identity/user/unfollow/${user.id}/${anotherUser.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('Alter user privacy settings', () => {
    it('should alter user privacy settings successfully', async () => {
      const user = userFactory.build();
      const privacySettings = userPrivacySettingsFactory.build();

      await testDbClient(Tables.User).insert(user);
      await testDbClient(Tables.UserPrivacySettings).insert({
        id: privacySettings.id,
        createdAt: privacySettings.createdAt,
        updatedAt: privacySettings.updatedAt,
        deletedAt: privacySettings.deletedAt,
        shareName: true,
        shareEmail: true,
        shareTrainingProgress: true,
        userId: user.id,
      });

      const res = await fetch(`${url}/identity/user/privacy/settings/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shareName: true,
          shareEmail: true,
          shareTrainingProgress: true,
        }),
      });

      expect(res.status).toBe(200);
    });
    it('should alter user privacy settings successfully when send partial data', async () => {
      const user = userFactory.build();
      const privacySettings = userPrivacySettingsFactory.build();

      await testDbClient(Tables.User).insert(user);
      await testDbClient(Tables.UserPrivacySettings).insert({
        id: privacySettings.id,
        createdAt: privacySettings.createdAt,
        updatedAt: privacySettings.updatedAt,
        deletedAt: privacySettings.deletedAt,
        shareName: true,
        shareEmail: true,
        shareTrainingProgress: true,
        userId: user.id,
      });

      const res = await fetch(`${url}/identity/user/privacy/settings/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shareEmail: true,
          shareTrainingProgress: true,
        }),
      });

      expect(res.status).toBe(200);
    });
    it('should alter user privacy settigns successfully when data is empty', async () => {
      const user = userFactory.build();
      const privacySettings = userPrivacySettingsFactory.build();

      await testDbClient(Tables.User).insert(user);
      await testDbClient(Tables.UserPrivacySettings).insert({
        id: privacySettings.id,
        createdAt: privacySettings.createdAt,
        updatedAt: privacySettings.updatedAt,
        deletedAt: privacySettings.deletedAt,
        shareName: true,
        shareEmail: true,
        shareTrainingProgress: true,
        userId: user.id,
      });

      const res = await fetch(`${url}/identity/user/privacy/settings/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(200);
    });
  });
});
