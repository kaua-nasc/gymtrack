import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { TrainingPlanModule } from '@src/module/training-plan/training-plan.module';
import { Tables } from '@testInfra/enum/table.enum';
import { testDbClient } from '@testInfra/knex.database';
import { createNestApp } from '@testInfra/test-e2e.setup';
import request from 'supertest';
import { trainingPlanFactory } from '../../factory/training-plan.factory';
import nock from 'nock';

describe('Training Plan - Training Plan Controller - (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;

  beforeAll(async () => {
    const nestTestSetup = await createNestApp([TrainingPlanModule]);
    app = nestTestSetup.app;
    module = nestTestSetup.module;
  });

  beforeEach(async () => {
    await testDbClient(Tables.User).del();
    await testDbClient(Tables.TrainingPlan).del();
  });

  afterAll(async () => {
    await testDbClient(Tables.User).del();
    await testDbClient(Tables.TrainingPlan).del();
    await module.close();
    await app.close();
    await testDbClient.destroy();
  });

  describe('Create Training Plan', () => {
    it('should create an training plan when has valid data and user exists', async () => {
      const trainingPlan = trainingPlanFactory.build();

      nock('http://localhost:3000', {
        encodedQueryParams: true,
      })
        .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
        .get(`/identity/user/exists/${trainingPlan.authorId}`)
        .reply(200, {
          exists: true,
        });

      const response = await request(app.getHttpServer())
        .post('/training-plan')
        .send(trainingPlan);

      expect(response.status).toBe(HttpStatus.CREATED);
    });

    it('should return a not found response when not have user', async () => {
      const trainingPlan = trainingPlanFactory.build();

      nock('http://localhost:3000', {
        encodedQueryParams: true,
      })
        .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
        .get(`/identity/user/exists/${trainingPlan.authorId}`)
        .reply(200, {
          exists: false,
        });

      const response = await request(app.getHttpServer())
        .post('/training-plan')
        .send(trainingPlan);

      expect(response.body.message).toBe('user not found');
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return a bad request response when has invalid name', async () => {
      const trainingPlan = trainingPlanFactory.build({
        name: '',
      });

      nock('http://localhost:3000', {
        encodedQueryParams: true,
      })
        .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
        .get(`/identity/user/exists/${trainingPlan.authorId}`)
        .reply(200, {
          exists: true,
        });

      const response = await request(app.getHttpServer())
        .post('/training-plan')
        .send(trainingPlan);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return a bad request response when has invalid authorId', async () => {
      const trainingPlan = trainingPlanFactory.build({
        authorId: '12345',
      });

      nock('http://localhost:3000', {
        encodedQueryParams: true,
      })
        .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
        .get(`/identity/user/exists/${trainingPlan.authorId}`)
        .reply(200, {
          exists: true,
        });

      const response = await request(app.getHttpServer())
        .post('/training-plan')
        .send(trainingPlan);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('List Training Plan', () => {
    it('should list training plans by author id when exists training plan', async () => {
      const firstTrainingPlan = trainingPlanFactory.build();

      await testDbClient(Tables.TrainingPlan).insert(firstTrainingPlan);

      const res = await request(app.getHttpServer()).get(
        `/training-plan/list/${firstTrainingPlan.authorId}`
      );

      expect(res.body.length).toBe(1);
      expect(res.body[0].authorId).toBe(firstTrainingPlan.authorId);
    });

    it('should return empty list when have not training plan with training plan id', async () => {
      const firstTrainingPlan = trainingPlanFactory.build();

      const res = await request(app.getHttpServer()).get(
        `/training-plan/list/${firstTrainingPlan.authorId}`
      );

      expect(res.body.length).toBe(0);
    });
  });

  describe('Delete Training Plan', () => {
    it('should delete an training plan when has a training plan', async () => {
      const firstTrainingPlan = trainingPlanFactory.build();

      await testDbClient(Tables.TrainingPlan).insert(firstTrainingPlan);

      const res = await request(app.getHttpServer()).delete(
        `/training-plan/${firstTrainingPlan.id}`
      );

      expect(res.status).toBe(200);
    });
    it('should delete an training plan when has a training plan', async () => {
      const firstTrainingPlan = trainingPlanFactory.build();

      const res = await request(app.getHttpServer()).delete(
        `/training-plan/${firstTrainingPlan.id}`
      );

      expect(res.status).toBe(404);
    });
  });

  describe('Create Feedback to Training Plan', () => {
    it('should add a feedback successfully when send valid data', async () => {
      const trainingPlan = trainingPlanFactory.build();
      const userId = '5e2a62de-6ead-4678-a12f-8c17e91513a3';
      const feedback = {
        trainingPlanId: trainingPlan.id,
        userId: userId,
        rating: 5,
      };

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);

      nock('http://localhost:3000', {
        encodedQueryParams: true,
      })
        .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
        .get(`/identity/user/exists/${userId}`)
        .reply(200, {
          exists: true,
        });

      const response = await request(app.getHttpServer())
        .post('/training-plan/feedback')
        .send(feedback);

      expect(response.status).toBe(HttpStatus.CREATED);
    });

    it('should return not found exception when training plan not exists', async () => {
      const trainingPlan = trainingPlanFactory.build();
      const userId = '5e2a62de-6ead-4678-a12f-8c17e91513a3';
      const feedback = {
        trainingPlanId: trainingPlan.id,
        userId: userId,
        rating: 5,
      };

      const response = await request(app.getHttpServer())
        .post('/training-plan/feedback')
        .send(feedback);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return bad request when training plan author and feedback author are equals', async () => {
      const trainingPlan = trainingPlanFactory.build();
      const feedback = {
        trainingPlanId: trainingPlan.id,
        userId: trainingPlan.authorId,
        rating: 5,
      };

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);

      const response = await request(app.getHttpServer())
        .post('/training-plan/feedback')
        .send(feedback);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return not found when author of feedback not exists', async () => {
      const trainingPlan = trainingPlanFactory.build();
      const userId = '5e2a62de-6ead-4678-a12f-8c17e91513a3';
      const feedback = {
        trainingPlanId: trainingPlan.id,
        userId: userId,
        rating: 5,
      };

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);

      nock('http://localhost:3000', {
        encodedQueryParams: true,
      })
        .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
        .get(`/identity/user/exists/${userId}`)
        .reply(200, {
          exists: false,
        });

      const response = await request(app.getHttpServer())
        .post('/training-plan/feedback')
        .send(feedback);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
