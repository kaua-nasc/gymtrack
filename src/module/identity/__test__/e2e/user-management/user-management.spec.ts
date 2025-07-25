import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { IdentityModule } from '@src/module/identity/identity.module';
import { Tables } from '@testInfra/enum/table.enum';
import { testDbClient } from '@testInfra/knex.database';
import { createNestApp } from '@testInfra/test-e2e.setup';
import request from 'supertest';

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
      const createUserInput = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/identity/user')
        .send(createUserInput);

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body.email).toBe(createUserInput.email);
    });
    it('should throws error by already used email', async () => {
      const createUserInput = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        password: 'password123',
      };

      await testDbClient(Tables.User).insert({
        ...createUserInput,
        id: '5e2a62de-6ead-4678-a12f-8c17e91513a3',
      });

      const res = await request(app.getHttpServer())
        .post('/identity/user')
        .send({
          ...createUserInput,
          firstName: 'Joao',
        });

      expect(res.status).toBe(HttpStatus.CONFLICT);
    });
  });

  describe('Get User by Id', () => {
    it('should gets an user', async () => {
      const createUserInput = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        password: 'password123',
        id: '5e2a62de-6ead-4678-a12f-8c17e91513a3',
      };

      await request(app.getHttpServer()).post('/identity/user').send(createUserInput);

      const res = await request(app.getHttpServer()).get(
        '/identity/user/' + createUserInput.id
      );

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.id).toBe(createUserInput.id);
      expect(res.body.email).toBe(createUserInput.email);
    });

    it('should return not found', async () => {
      const res = await request(app.getHttpServer()).get(
        '/identity/user/5e2a62de-6ead-4678-a12f-8c17e91513a3'
      );

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
