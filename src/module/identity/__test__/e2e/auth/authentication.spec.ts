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
import { testCacheClient } from '@testInfra/test-cache.setup';
import { createNestApp } from '@testInfra/test-e2e.setup';
import { SetupServerApi } from 'msw/node';
import request from 'supertest';
import { userFactory } from '../../factory/user.factory';

describe('Auth Controller (e2e)', () => {
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
    await testCacheClient.clean();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(async () => {
    if (module) {
      await testDbClient(Tables.User).del();
      await testCacheClient.clean();
      await module.close();
    }
    if (app) {
      await app.close();
    }
  });

  describe('Authentication - signIn', () => {
    it('should do login and return token', async () => {
      const user = userFactory.build();

      await fetch(`${url}/identity/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });

      const res = await fetch(`${url}/identity/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          password: user.password,
        }),
      });

      expect(res.status).toBe(HttpStatus.OK);
    });

    it('should throws an exception and return status code unauthorized', async () => {
      const user = userFactory.build();

      await request(app.getHttpServer()).post('/identity/user').send(user);

      const res = await fetch(`${url}/identity/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          password: '12345678',
        }),
      });

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('Authentication - Request Reset Password', () => {
    it.skip('should return ok when request an reset password with valid email', async () => {
      const user = userFactory.build();
      await testDbClient(Tables.User).insert(user);

      const res = await fetch(`${url}/identity/auth/reset-password/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
        }),
      });

      expect(res.status).toBe(HttpStatus.OK);
    });

    it('should return not found status code when request reset password with any user with email', async () => {
      const user = userFactory.build();
      await testDbClient(Tables.User).insert(user);

      const res = await fetch(`${url}/identity/auth/reset-password/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'johndao@example.com',
        }),
      });

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return bad request status code when request reset password without any user email', async () => {
      const res = await fetch(`${url}/identity/auth/reset-password/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return bad request status code when request reset password without any user email', async () => {
      const res = await fetch(`${url}/identity/auth/reset-password/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'johndao@',
        }),
      });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });
  describe('Authentication - Verify Reset Password', () => {
    it('should return ok when user exists and is valid', async () => {
      const user = userFactory.build();
      const token = '1234';

      await testDbClient(Tables.User).insert(user);
      await testCacheClient.set(user.email!, token);

      const res = await fetch(`${url}/identity/auth/reset-password/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          token: token,
        }),
      });

      expect(res.status).toBe(HttpStatus.OK);
    });
    it('should return not found when user not exists ', async () => {
      const res = await fetch(`${url}/identity/auth/reset-password/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'johndoe@example.com',
          token: '1234',
        }),
      });
      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });
    it('should return bad request when token doest match', async () => {
      const user = userFactory.build();
      const token = '1111';

      await testDbClient(Tables.User).insert(user);
      await testCacheClient.set(user.email!, token);

      const res = await fetch(`${url}/identity/auth/reset-password/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          token: '1234',
        }),
      });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });
  describe('Authentication - Reset Password Insert New Password', () => {
    it('should update password when user exists and new password is valid', async () => {
      const user = userFactory.build();

      await testDbClient(Tables.User).insert(user);

      const res = await fetch(`${url}/identity/auth/reset-password/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          newPassword: 'password12345',
        }),
      });

      expect(res.status).toBe(HttpStatus.CREATED);
    });

    it('should return unauthorized when new password is equals to last password', async () => {
      const plainPassword = 'password123';
      const user = userFactory.build();

      await testDbClient(Tables.User).insert(user);

      const res = await fetch(`${url}/identity/auth/reset-password/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          newPassword: plainPassword,
        }),
      });

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should return unauthorized when user not exists', async () => {
      const res = await fetch(`${url}/identity/auth/reset-password/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: '5e2a62de-6ead-4678-a12f-8c17e91513a3',
          newPassword: 'password12345',
        }),
      });

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });
});
