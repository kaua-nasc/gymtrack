import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IdentityModule } from '@src/module/identity/identity.module';
import { UserRepository } from '@src/module/identity/persistence/repository/user.repository';
import { TrainingPlanRepository } from '@src/module/training-plan/persistence/repository/training-plan.repository';
import { TrainingPlanModule } from '@src/module/training-plan/training-plan.module';
import { ConfigModule } from '@src/shared/module/config/config.module';
import { HttpClientModule } from '@src/shared/module/http-client/http-client.module';
import { TrainingPlanHttpClient } from '@src/shared/module/integration/client/training-plan-http.client';
import { TrainingPlanExistsApi } from '@src/shared/module/integration/interface/training-plan-integration.interface';
import { TypeOrmPersistenceModule } from '@src/shared/module/persistence/typeorm/typeorm-persistence.module';
import request from 'supertest';

describe('User - Test (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;
  let userRepository: UserRepository;
  let trainingPlanRepository: TrainingPlanRepository;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        TypeOrmPersistenceModule.forRoot({}),
        IdentityModule,
        HttpClientModule,
        TrainingPlanModule,
      ],
    }).compile();

    app = module.createNestApplication();
    userRepository = module.get<UserRepository>(UserRepository);
    trainingPlanRepository = module.get<TrainingPlanRepository>(TrainingPlanRepository);
    module.get<TrainingPlanModule>(TrainingPlanModule);
    module.get<TrainingPlanExistsApi>(TrainingPlanHttpClient);

    await app.init();
  });

  beforeAll(async () => {
    await userRepository.deleteAll();
    await trainingPlanRepository.deleteAll();
  });

  afterAll(async () => await module.close());

  describe('user', () => {
    it('create a user with success', async () => {
      const user = {
        email: 'exemplo@email.com',
        password: '8re|p?pY9E3q',
        firstName: 'Fulano',
        lastName: 'de Tal',
      };

      await request(app.getHttpServer())
        .post(`/user`)
        .send(user)
        .expect(HttpStatus.CREATED)
        .expect((res) => expect(res.body.email).toEqual(user.email));
    });
  });

  describe('user/:userId/:trainingPlanId', () => {
    it('', async () => {});
  });

  describe('user//finish-current-training-plan/:userId', () => {
    it('', async () => {});
  });

  describe('user/add-current-training-plan/:userId/:trainingPlanId', () => {
    it.skip('add a current training plan to an user with success', async () => {
      const user = {
        email: 'exemplo2@email.com',
        password: '8re|p?pY9E3q',
        firstName: 'Ciclano adsadadsad',
        lastName: 'de Tal',
      };

      const res = await request(app.getHttpServer())
        .post(`/user`)
        .send(user)
        .expect(HttpStatus.CREATED);

      const trainingPlan = {
        name: 'Exemplo User 13123221312312',
        authorId: res.body.id as string,
        timeInDays: 5,
        type: 1,
        level: 2,
        visibility: 0,
      };

      const res2 = await request(app.getHttpServer())
        .post(`/training-plan`)
        .send(trainingPlan)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .patch(`/user/${res.body.id}/${res2.body.id}`)
        .expect(HttpStatus.OK);
    });
  });
});
