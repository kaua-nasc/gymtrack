import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { UserModel } from '@src/module/identity/core/model/user.model';
import { UserManagementService } from '@src/module/identity/core/service/user-management.service';
import { IdentityModule } from '@src/module/identity/identity.module';
import { UserRepository } from '@src/module/identity/persistence/repository/user.repository';
import { Tables } from '@testInfra/enum/table.enum';
import { testDbClient } from '@testInfra/knex.database';
import { createNestApp } from '@testInfra/test-e2e.setup';
import nock from 'nock';
import request from 'supertest';

describe('AuthResolver (e2e)', () => {
  let app: INestApplication;
  let userManagementService: UserManagementService;
  let userRepository: UserRepository;
  let module: TestingModule;

  beforeAll(async () => {
    const nestTestSetup = await createNestApp([IdentityModule]);
    app = nestTestSetup.app;
    module = nestTestSetup.module;

    userManagementService = module.get<UserManagementService>(UserManagementService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  beforeEach(async () => {
    await userRepository.clear();
    await testDbClient(Tables.TrainingPlan).del();
  });
  afterAll(async () => {
    await userRepository.clear();
    await testDbClient(Tables.TrainingPlan).del();
    await module.close();
  });

  describe('signIn mutation', () => {
    //this is an example of HTTP call between modules
    it.skip('returns the authenticated user - USING HTTP for module to module calls', async () => {
      const signInInput = {
        email: 'johndoe@example.com',
        password: 'password123',
      };
      const createdUser = await userManagementService.create(
        UserModel.create({
          firstName: 'John',
          lastName: 'Doe',
          email: signInInput.email,
          password: signInInput.password,
        })
      );

      const acessTokenResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              signIn(SignInInput: {
                email: "${signInInput.email}",
                password: "${signInInput.password}"
              }) {
                accessToken
              }
            }
          `,
        })
        .expect(200);
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${acessTokenResponse.body.data.signIn.accessToken}`)
        .send({
          query: `
            query {
              getProfile {
                email
              }
            }
          `,
        });

      const { email } = response.body.data.getProfile;

      expect(email).toEqual(signInInput.email);
    });
    it.skip('returns accessToken for valid credentials', async () => {
      const signInInput = {
        email: 'johndoe@example.com',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              signIn(SignInInput: {
                email: "${signInInput.email}",
                password: "${signInInput.password}"
              }) {
                accessToken
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.data.signIn.accessToken).toBeDefined();
    });
    it('returns unauthorized if the user does not exist', async () => {
      const signInInput = {
        email: 'johndoe@example.com',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              signIn(SignInInput: {
                email: "${signInInput.email}",
                password: "${signInInput.password}"
              }) {
                accessToken
              }
            }
          `,
        })
        .expect(200);
      expect(response.body.errors[0].message).toEqual('Cannot authorize user');
    });
  });
  describe('getProfile query', () => {
    //use local module call instead of HTTP
    it.skip('returns the authenticated user', async () => {
      const signInInput = {
        email: 'johndoe@example.com',
        password: 'password123',
      };

      const acessTokenResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              signIn(SignInInput: {
                email: "${signInInput.email}",
                password: "${signInInput.password}"
              }) {
                accessToken
              }
            }
          `,
        });
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${acessTokenResponse.body.data.signIn.accessToken}`)
        .send({
          query: `
            query {
              getProfile {
                email
              }
            }
          `,
        });

      const { email } = response.body.data.getProfile;

      expect(email).toEqual(signInInput.email);
    });
    it('returns unauthorized for invalid tokens', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer fake-token`)
        .send({
          query: `
            query {
              getProfile {
                email
              }
            }
          `,
        });

      expect(response.body.errors[0].message).toEqual('Unauthorized');
    });
  });
});
