import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { IdentityModule } from '@src/module/identity/identity.module';
import { Tables } from '@testInfra/enum/table.enum';
import { testDbClient } from '@testInfra/knex.database';
import { testCacheClient } from '@testInfra/test-cache.setup';
import { createNestApp } from '@testInfra/test-e2e.setup';
import request from 'supertest';
import { userFactory } from '../../factory/user.factory';

describe('Auth Controller (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;

  beforeAll(async () => {
    const nestTestSetup = await createNestApp([IdentityModule]);
    app = nestTestSetup.app;
    module = nestTestSetup.module;
  });

  beforeEach(async () => {
    await testDbClient(Tables.User).del();
    await testCacheClient.clean();
  });

  afterAll(async () => {
    await testDbClient(Tables.User).del();
    await module.close();
    await app.close();
    await testCacheClient.disconnect();
    await testDbClient.destroy();
  });

  describe('Authentication - signIn', () => {
    it('should do login and return token', async () => {
      const user = userFactory.build();

      await request(app.getHttpServer()).post('/identity/user').send(user);

      const res = await request(app.getHttpServer()).post('/identity/auth').send({
        email: user.email,
        password: user.password,
      });

      expect(res.status).toBe(HttpStatus.OK);
    });

    it('should throws an exception and return status code unauthorized', async () => {
      const user = userFactory.build();

      await request(app.getHttpServer()).post('/identity/user').send(user);

      const res = await request(app.getHttpServer()).post('/identity/auth').send({
        email: user.email,
        password: '12345678',
      });

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe.skip('Authentication - Request Reset Password', () => {
    it('should return ok when request an reset password with valid email', async () => {
      const user = userFactory.build();
      await testDbClient(Tables.User).insert(user);

      const res = await request(app.getHttpServer())
        .post('/identity/auth/reset-password/request')
        .send({ email: user.email });

      expect(res.status).toBe(HttpStatus.OK);
    });

    it('should return not found status code when request reset password with any user with email', async () => {
      const user = userFactory.build();
      await testDbClient(Tables.User).insert(user);

      const res = await request(app.getHttpServer())
        .post('/identity/auth/reset-password/request')
        .send({ email: 'johndao@example.com' });

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return bad request status code when request reset password without any user email', async () => {
      const res = await request(app.getHttpServer()).post(
        '/identity/auth/reset-password/request'
      );

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return bad request status code when request reset password without any user email', async () => {
      const res = await request(app.getHttpServer())
        .post('/identity/auth/reset-password/request')
        .send({ email: 'johndao@' });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });
  describe('Authentication - Verify Reset Password', () => {
    it('should return ok when user exists and is valid', async () => {
      const user = userFactory.build();
      const token = '1234';

      await testDbClient(Tables.User).insert(user);
      await testCacheClient.set(user.email!, token);

      const res = await request(app.getHttpServer())
        .post('/identity/auth/reset-password/verify')
        .send({ email: user.email, token: token });

      expect(res.status).toBe(HttpStatus.OK);
    });
    it('should return not found when user not exists ', async () => {
      const res = await request(app.getHttpServer())
        .post('/identity/auth/reset-password/verify')
        .send({ email: 'johndoe@example.com', token: '1234' });

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });
    it('should return bad request when token doest match', async () => {
      const user = userFactory.build();
      const token = '1111';

      await testDbClient(Tables.User).insert(user);
      await testCacheClient.set(user.email!, token);

      const res = await request(app.getHttpServer())
        .post('/identity/auth/reset-password/verify')
        .send({ userId: user.id, token: '1234' });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });
  describe('Authentication - Reset Password Insert New Password', () => {
    it('should update password when user exists and new password is valid', async () => {
      const user = userFactory.build();

      await testDbClient(Tables.User).insert(user);

      const res = await request(app.getHttpServer())
        .post('/identity/auth/reset-password/create')
        .send({ userId: user.id, newPassword: 'password12345' });

      expect(res.status).toBe(HttpStatus.CREATED);
    });

    it('should return unauthorized when new password is equals to last password', async () => {
      const plainPassword = 'password123';
      const user = userFactory.build();

      await testDbClient(Tables.User).insert(user);

      const res = await request(app.getHttpServer())
        .post('/identity/auth/reset-password/create')
        .send({ userId: user.id, newPassword: plainPassword });

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should return unauthorized when user not exists', async () => {
      const res = await request(app.getHttpServer())
        .post('/identity/auth/reset-password/create')
        .send({
          userId: '5e2a62de-6ead-4678-a12f-8c17e91513a3',
          newPassword: 'password12345',
        });

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });
});
