import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { IdentityModule } from '@src/module/identity/identity.module';
import { Tables } from '@testInfra/enum/table.enum';
import { testDbClient } from '@testInfra/knex.database';
import { createNestApp } from '@testInfra/test-e2e.setup';
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
  });

  afterAll(async () => {
    await testDbClient(Tables.User).del();
    await module.close();
    await app.close();
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
});
