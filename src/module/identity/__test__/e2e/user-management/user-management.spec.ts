import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { IdentityModule } from '@src/module/identity/identity.module';
import { Tables } from '@testInfra/enum/table.enum';
import { testDbClient } from '@testInfra/knex.database';
import { createNestApp } from '@testInfra/test-e2e.setup';
import request from 'supertest';
import { createUserFactory, userFactory } from '../../factory/user.factory';

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
});
