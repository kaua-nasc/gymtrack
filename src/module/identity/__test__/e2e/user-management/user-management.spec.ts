import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { IdentityModule } from '@src/module/identity/identity.module';
import { TrainingPlanHttpClient } from '@src/module/shared/module/integration/client/training-plan-http.client';
import { Tables } from '@testInfra/enum/table.enum';
import { testDbClient } from '@testInfra/knex.database';
import { createNestApp } from '@testInfra/test-e2e.setup';
import nock from 'nock';
import request from 'supertest';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;

  beforeAll(async () => {
    const nestTestSetup = await createNestApp(
      [IdentityModule],
      [
        {
          provide: TrainingPlanHttpClient,
          useValue: {
            traningPlanExists: async () => true,
          },
        },
      ]
    );
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

  describe('Identity - createUser', () => {
    it('should creates a new user', async () => {
      const createUserInput = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        password: 'password123',
      };

      nock('http://localhost:3000', {
        encodedQueryParams: true,
      })
        .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
        .get(`/training-plan/exists/22222222-2222-2222-2222-222222222222`)
        .reply(200, {
          exists: true,
        });

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

      nock('http://localhost:3000', {
        encodedQueryParams: true,
      })
        .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
        .get(`/training-plan/exists/22222222-2222-2222-2222-222222222222`)
        .reply(200, {
          exists: true,
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

  describe('Identity - getUserById', () => {
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
