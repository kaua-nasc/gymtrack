import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { IdentityModule } from '@src/module/identity/identity.module';
import { Tables } from '@testInfra/enum/table.enum';
import { testDbClient } from '@testInfra/knex.database';
import { testCacheClient } from '@testInfra/test-cache.setup';
import { createNestApp } from '@testInfra/test-e2e.setup';
import { hash } from 'bcrypt';
import request from 'supertest';

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
      const createUserInput = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        password: 'password123',
        id: '29b8c580-3224-4094-b8d5-267b5bf15eab',
      };

      await request(app.getHttpServer()).post('/identity/user').send(createUserInput);

      const res = await request(app.getHttpServer()).post('/identity/auth').send({
        email: createUserInput.email,
        password: createUserInput.password,
      });

      expect(res.status).toBe(HttpStatus.OK);
    });

    it('should throws an exception and return status code unauthorized', async () => {
      const createUserInput = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        password: 'password123',
        id: '29b8c580-3224-4094-b8d5-267b5bf15eab',
      };

      await request(app.getHttpServer()).post('/identity/user').send(createUserInput);

      const res = await request(app.getHttpServer()).post('/identity/auth').send({
        email: createUserInput.email,
        password: '12345678',
      });

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe.skip('Authentication - Request Reset Password', () => {
    it('should return ok when request an reset password with valid email', async () => {
      const createUserInput = {
        id: '5e2a62de-6ead-4678-a12f-8c17e91513a3',
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        password: 'password123',
      };
      await testDbClient(Tables.User).insert(createUserInput);

      const res = await request(app.getHttpServer())
        .post('/identity/auth/reset-password/request')
        .send({ email: createUserInput.email });

      expect(res.status).toBe(HttpStatus.OK);
    });

    it('should return not found status code when request reset password with any user with email', async () => {
      const createUserInput = {
        id: '5e2a62de-6ead-4678-a12f-8c17e91513a3',
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        password: 'password123',
      };
      await testDbClient(Tables.User).insert(createUserInput);

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
      const createUserInput = {
        id: '5e2a62de-6ead-4678-a12f-8c17e91513a3',
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        password: 'password123',
      };
      const token = '1234';

      await testDbClient(Tables.User).insert(createUserInput);
      await testCacheClient.set(createUserInput.email, token);

      const res = await request(app.getHttpServer())
        .post('/identity/auth/reset-password/verify')
        .send({ email: createUserInput.email, token: token });

      expect(res.status).toBe(HttpStatus.OK);
    });
    it('should return not found when user not exists ', async () => {
      const res = await request(app.getHttpServer())
        .post('/identity/auth/reset-password/verify')
        .send({ email: 'johndoe@example.com', token: '1234' });

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });
    it('should return bad request when token doest match', async () => {
      const createUserInput = {
        id: '5e2a62de-6ead-4678-a12f-8c17e91513a3',
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        password: '4ac66c29218da4f4a0aa4f4a43037c48936df7c9bedcae1af6ac67d8768f3c37',
      };
      const token = '1111';

      await testDbClient(Tables.User).insert(createUserInput);
      await testCacheClient.set(createUserInput.email, token);

      const res = await request(app.getHttpServer())
        .post('/identity/auth/reset-password/verify')
        .send({ userId: createUserInput.id, token: '1234' });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });
  describe('Authentication - Reset Password Insert New Password', () => {
    it('should update password when user exists and new password is valid', async () => {
      const createUserInput = {
        id: '5e2a62de-6ead-4678-a12f-8c17e91513a3',
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        password: '4ac66c29218da4f4a0aa4f4a43037c48936df7c9bedcae1af6ac67d8768f3c37',
      };

      await testDbClient(Tables.User).insert(createUserInput);

      const res = await request(app.getHttpServer())
        .post('/identity/auth/reset-password/create')
        .send({ userId: createUserInput.id, newPassword: 'password12345' });

      expect(res.status).toBe(HttpStatus.CREATED);
    });

    it('should return unauthorized when new password is equals to last password', async () => {
      const plainPassword = 'password123';
      const hashedPassword = await hash(plainPassword, 10);

      const createUserInput = {
        id: '5e2a62de-6ead-4678-a12f-8c17e91513a3',
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        password: hashedPassword,
      };

      await testDbClient(Tables.User).insert(createUserInput);

      const res = await request(app.getHttpServer())
        .post('/identity/auth/reset-password/create')
        .send({ userId: createUserInput.id, newPassword: plainPassword });

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
