import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { IdentityModule } from '@src/module/identity/identity.module';
import { Tables } from '@testInfra/enum/table.enum';
import { testDbClient } from '@testInfra/knex.database';
import { createNestApp } from '@testInfra/test-e2e.setup';
import request from 'supertest';
import { createUserFactory, userFactory } from '../../factory/user.factory';
import { userFollowsFactory } from '../../factory/user-follows.factory';

describe('Identity - User Management Controller - (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;

  beforeAll(async () => {
    const nestTestSetup = await createNestApp([IdentityModule]);
    app = nestTestSetup.app;
    module = nestTestSetup.module;
  });

  beforeEach(async () => {
    await testDbClient(Tables.User).del();
  });

  afterAll(async () => {
    await testDbClient(Tables.User).del();
    await module.close();
    await app.close();
    await testDbClient.destroy();
  });

  describe('Create User', () => {
    it('should creates a new user', async () => {
      const user = createUserFactory.build();

      const response = await request(app.getHttpServer())
        .post('/identity/user')
        .send(user);

      expect(response.status).toBe(HttpStatus.CREATED);
    });
    it('should throws error by already used email', async () => {
      const user = createUserFactory.build();

      await testDbClient(Tables.User).insert({
        ...user,
        id: '5e2a62de-6ead-4678-a12f-8c17e91513a3',
      });

      const res = await request(app.getHttpServer())
        .post('/identity/user')
        .send({
          ...user,
        });

      expect(res.status).toBe(HttpStatus.CONFLICT);
    });
  });

  describe('Get User by Id', () => {
    it('should gets an user', async () => {
      const user = userFactory.build();

      await request(app.getHttpServer()).post('/identity/user').send(user);

      const res = await request(app.getHttpServer()).get('/identity/user/' + user.id);

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.id).toBe(user.id);
      expect(res.body.email).toBe(user.email);
    });

    it('should return not found', async () => {
      const res = await request(app.getHttpServer()).get(
        '/identity/user/5e2a62de-6ead-4678-a12f-8c17e91513a3'
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

      const res = await request(app.getHttpServer()).post(
        `/identity/user/follow/${user.id}/${anotherUser.id}`
      );

      expect(res.status).toBe(HttpStatus.CREATED);
    });

    it('should return not found when user not exists', async () => {
      const userId = '5e2a62de-6ead-4678-a12f-8c17e91513a3';
      const anotherUser = userFactory.build({ email: 'another@example.com' });

      await testDbClient(Tables.User).insert(anotherUser);

      const res = await request(app.getHttpServer()).post(
        `/identity/user/follow/${userId}/${anotherUser.id}`
      );

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return not found when followed user not exists', async () => {
      const userId = '5e2a62de-6ead-4678-a12f-8c17e91513a3';
      const user = userFactory.build();

      await testDbClient(Tables.User).insert(user);

      const res = await request(app.getHttpServer()).post(
        `/identity/user/follow/${user.id}/${userId}`
      );

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

      const res = await request(app.getHttpServer()).post(
        `/identity/user/follow/${user.id}/${anotherUser.id}`
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

      const res = await request(app.getHttpServer()).post(
        `/identity/user/unfollow/${user.id}/${anotherUser.id}`
      );

      expect(res.status).toBe(HttpStatus.OK);
    });

    it('should return bad request when paramether ids are equals', async () => {
      const user = userFactory.build();

      const res = await request(app.getHttpServer()).post(
        `/identity/user/unfollow/${user.id}/${user.id}`
      );

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return not found when user not found', async () => {
      const user = userFactory.build();
      const anotherUser = userFactory.build({
        id: '5e2a62de-6ead-4678-a12f-8c17e91513a3',
        email: 'another@example.com',
      });

      await testDbClient(Tables.User).insert(user);

      const res = await request(app.getHttpServer()).post(
        `/identity/user/unfollow/${user.id}/${anotherUser.id}`
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

      const res = await request(app.getHttpServer()).post(
        `/identity/user/unfollow/${user.id}/${anotherUser.id}`
      );

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });
});
