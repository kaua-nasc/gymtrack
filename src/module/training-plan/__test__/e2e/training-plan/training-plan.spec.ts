import { faker } from '@faker-js/faker';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TrainingPlanLevel } from '@src/module/training-plan/core/enum/training-plan-level.enum';
import { TrainingPlanProgressStatus } from '@src/module/training-plan/core/enum/training-plan-progress-status.enum';
import { TrainingPlanType } from '@src/module/training-plan/core/enum/training-plan-type.enum';
import { TrainingPlanVisibility } from '@src/module/training-plan/core/enum/training-plan-visibility.enum';
import { TrainingPlanProgressRepository } from '@src/module/training-plan/persistence/repository/training-plan-progress.repository';
import { TrainingPlanRepository } from '@src/module/training-plan/persistence/repository/training-plan.repository';
import { TrainingPlanModule } from '@src/module/training-plan/training-plan.module';
import { ConfigModule } from '@src/shared/module/config/config.module';
import { TypeOrmPersistenceModule } from '@src/shared/module/persistence/typeorm/typeorm-persistence.module';
import request from 'supertest';

describe('Training Plan - Test (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;
  let trainingPlanProgressRepository: TrainingPlanProgressRepository;
  let trainingPlanRepository: TrainingPlanRepository;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        TypeOrmPersistenceModule.forRoot({}),
        TrainingPlanModule,
      ],
    }).compile();

    app = module.createNestApplication();
    trainingPlanProgressRepository = module.get<TrainingPlanProgressRepository>(
      TrainingPlanProgressRepository
    );
    trainingPlanRepository = module.get<TrainingPlanRepository>(TrainingPlanRepository);

    await app.init();
  });

  beforeAll(async () => {
    await trainingPlanProgressRepository.deleteAll();
    await trainingPlanRepository.deleteAll();
  });

  afterAll(async () => await module.close());

  describe('/training-plan', () => {
    it('create a training plan with success', async () => {
      const trainingPlan = {
        name: 'Exemplo 1',
        authorId: faker.string.uuid(),
        timeInDays: 5,
        type: TrainingPlanType.hypertrophy,
        level: TrainingPlanLevel.beginner,
        visibility: TrainingPlanVisibility.public,
      };

      await request(app.getHttpServer())
        .post(`/training-plan`)
        .send(trainingPlan)
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          console.log(res.body);
          expect(res.body).toMatchObject({
            authorId: trainingPlan.authorId,
            name: trainingPlan.name,
          });
          expect(res.body.status).toEqual(TrainingPlanProgressStatus.notStarted);
        });
    });
  });

  describe('/training-plan/:trainingPlanId', () => {
    it('get a training plan by your id', async () => {
      const trainingPlan = {
        name: 'Exemplo 2',
        authorId: faker.string.uuid(),
        timeInDays: 5,
        type: TrainingPlanType.hypertrophy,
        level: TrainingPlanLevel.beginner,
        visibility: TrainingPlanVisibility.public,
      };

      const res = await request(app.getHttpServer())
        .post(`/training-plan`)
        .send(trainingPlan)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .get(`/training-plan/${res.body.id}`)
        .expect((res) => expect(res.body.id).toEqual(res.body.id));
    });
  });

  describe('/training-plan/list/:authorId', () => {
    it('get training plans by your author id', async () => {
      const authorId = faker.string.uuid();

      const trainingPlan = {
        name: 'Exemplo 3',
        authorId: authorId,
        timeInDays: 5,
        type: TrainingPlanType.hypertrophy,
        level: TrainingPlanLevel.beginner,
        visibility: TrainingPlanVisibility.public,
      };
      const trainingPlan2 = {
        name: 'Exemplo 4',
        authorId: authorId,
        timeInDays: 2,
        type: TrainingPlanType.strength,
        level: TrainingPlanLevel.intermediary,
        visibility: TrainingPlanVisibility.protected,
      };

      await request(app.getHttpServer())
        .post(`/training-plan`)
        .send(trainingPlan)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .post(`/training-plan`)
        .send(trainingPlan2)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .get(`/training-plan/list/${authorId}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body[0]).toMatchObject(trainingPlan);
          expect(res.body[1]).toMatchObject(trainingPlan2);
          expect(res.body[0].authorId).toEqual(authorId);
          expect(res.body[1].authorId).toEqual(authorId);
        });
    });
  });

  describe('/training-plan/exists/:trainingPlanId', () => {
    it('return true when exists', async () => {
      const trainingPlan = {
        name: 'Exemplo 5',
        authorId: faker.string.uuid(),
        timeInDays: 5,
        type: TrainingPlanType.hypertrophy,
        level: TrainingPlanLevel.beginner,
        visibility: TrainingPlanVisibility.public,
      };

      const res = await request(app.getHttpServer())
        .post(`/training-plan`)
        .send(trainingPlan)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .get(`/training-plan/exists/${res.body.id}`)
        .expect(HttpStatus.OK)
        .expect((res) => expect(res.body.exists).toEqual(true));
    });

    it('return true when exists', async () => {
      await request(app.getHttpServer())
        .get(`/training-plan/exists/${faker.string.uuid()}`)
        .expect(HttpStatus.NOT_FOUND)
        .expect((res) => expect(res.body.exists).toEqual(undefined));
    });
  });
});
