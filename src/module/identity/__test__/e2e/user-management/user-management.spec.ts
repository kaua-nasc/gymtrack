import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { createNestApp } from '@testInfra/test-e2e.setup';
import { UserRepository } from '@src/module/identity/persistence/repository/user.repository';
import { IdentityModule } from '@src/module/identity/identity.module';

describe('UserResolver (e2e)', () => {
  let app: INestApplication;
  let userRepository: UserRepository;
  let module: TestingModule;

  beforeAll(async () => {
    const nestTestSetup = await createNestApp([IdentityModule]);
    app = nestTestSetup.app;
    module = nestTestSetup.module;

    userRepository = module.get<UserRepository>(UserRepository);
  });

  beforeEach(async () => {
    await userRepository.clear();
  });

  afterAll(async () => {
    await userRepository.clear();
    await module.close();
  });

  describe('Identity - createUser mutation', () => {
    it('creates a new user', async () => {
      const createUserInput = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              createUser(CreateUserInput: {
                firstName: "${createUserInput.firstName}",
                lastName: "${createUserInput.lastName}",
                email: "${createUserInput.email}",
                password: "${createUserInput.password}"
              }) {
                id
                firstName
                lastName
                email
              }
            }
          `,
        });
      const { id, firstName, lastName, email } = response.body.data.createUser;

      expect(id).toBeDefined();
      expect(firstName).toBe(createUserInput.firstName);
      expect(lastName).toBe(createUserInput.lastName);
      expect(email).toBe(createUserInput.email);
    });
  });
});
