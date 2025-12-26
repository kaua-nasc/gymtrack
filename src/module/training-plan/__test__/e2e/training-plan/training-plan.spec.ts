import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'bun:test';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { userFactory } from '@src/module/identity/__test__/factory/user.factory';
import { TrainingPlanVisibility } from '@src/module/training-plan/core/enum/training-plan-visibility.enum';
import { TrainingPlanModule } from '@src/module/training-plan/training-plan.module';
import { Tables } from '@testInfra/enum/table.enum';
import { testDbClient } from '@testInfra/knex.database';
import { createNestApp } from '@testInfra/test-e2e.setup';
import { HttpResponse, http } from 'msw';
import { SetupServerApi } from 'msw/node';
import {
  planParticipantFactory,
  trainingPlanFactory,
  trainingPlanLikeFactory,
} from '../../factory/training-plan.factory';

describe('Training Plan - Training Plan Controller - (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;
  let url: string;
  let server: SetupServerApi;
  let configuration: { [key: string]: string | number | undefined };

  beforeAll(async () => {
    const setup = await createNestApp([TrainingPlanModule]);
    app = setup.app;
    module = setup.module;
    configuration = setup.configuration;
    server = setup.server;
    await app.listen(0);

    url = await app.getUrl();
  });

  beforeEach(async () => {
    await testDbClient(Tables.User).del();
    await testDbClient(Tables.TrainingPlan).del();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(async () => {
    server.close();
    if (module) {
      await testDbClient(Tables.User).del();
      await testDbClient(Tables.TrainingPlan).del();
      await module.close();
    }

    if (app) {
      await app.close();
    }
  });

  describe('Create Training Plan', () => {
    it('should create an training plan when has valid data and user exists', async () => {
      const user = userFactory.build();

      const trainingPlan = trainingPlanFactory.build({ authorId: user.id });

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const response = await fetch(`${url}/training-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trainingPlan),
      });

      const plans = await testDbClient(Tables.TrainingPlan).select('*');
      expect(plans).toHaveLength(1);
      expect(response.status).toBe(HttpStatus.CREATED);
    });

    it('should return a not found response when not have user', async () => {
      const trainingPlan = trainingPlanFactory.build();

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${trainingPlan.authorId}`,
          () => HttpResponse.json({ exists: false })
        )
      );

      const response = await fetch(`${url}/training-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trainingPlan),
      });

      const body = (await response.json()) as Record<
        string,
        string | number | Record<string, unknown>
      >;
      const plans = await testDbClient(Tables.TrainingPlan).select('*');

      expect(plans).toHaveLength(0);
      expect(body.message).toBe('user not found');
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return a bad request response when has invalid name', async () => {
      const trainingPlan = trainingPlanFactory.build({
        name: '',
      });

      const response = await fetch(`${url}/training-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trainingPlan),
      });

      const plans = await testDbClient(Tables.TrainingPlan).select('*');

      expect(plans).toHaveLength(0);
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return a bad request response when has invalid authorId', async () => {
      const trainingPlan = trainingPlanFactory.build({
        authorId: '12345',
      });

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${trainingPlan.authorId}`,
          () => HttpResponse.json({ exists: false })
        )
      );

      const response = await fetch(`${url}/training-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trainingPlan),
      });

      const plans = await testDbClient(Tables.TrainingPlan).select('*');

      expect(plans).toHaveLength(0);
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('List Training Plan', () => {
    it('should list training plans by author id when exists training plan', async () => {
      const firstTrainingPlan = trainingPlanFactory.build();

      await testDbClient(Tables.TrainingPlan).insert(firstTrainingPlan);

      const response = await fetch(
        `${url}/training-plan/list/${firstTrainingPlan.authorId}`
      );

      const body = await response.json();

      const plans = await testDbClient(Tables.TrainingPlan).select('*').where({
        authorId: firstTrainingPlan.authorId,
      });

      expect(plans).toHaveLength(1);
      expect(body).toBeInstanceOf(Array);
    });

    it('should return empty list when have not training plan with training plan id', async () => {
      const firstTrainingPlan = trainingPlanFactory.build();

      const response = await fetch(
        `${url}/training-plan/list/${firstTrainingPlan.authorId}`
      );

      const body = await response.json();

      expect(body).toBeInstanceOf(Array);
    });
  });

  describe('Delete Training Plan', () => {
    it('should delete an training plan when has a training plan', async () => {
      const firstTrainingPlan = trainingPlanFactory.build();

      await testDbClient(Tables.TrainingPlan).insert(firstTrainingPlan);

      const response = await fetch(`${url}/training-plan/${firstTrainingPlan.id}`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(HttpStatus.OK);
    });

    it('should delete an training plan when has a training plan', async () => {
      const firstTrainingPlan = trainingPlanFactory.build();

      const response = await fetch(`${url}/training-plan/${firstTrainingPlan.id}`, {
        method: 'DELETE',
      });

      const plans = await testDbClient(Tables.TrainingPlan).select('*');

      expect(plans).toHaveLength(0);
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
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

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${userId}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const response = await fetch(`${url}/training-plan/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback),
      });

      const feedbacks = await testDbClient(Tables.TrainingPlanFeedback).select('*');

      expect(feedbacks).toHaveLength(1);
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

      const response = await fetch(`${url}/training-plan/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback),
      });

      const feedbacks = await testDbClient(Tables.TrainingPlanFeedback).select('*');

      expect(feedbacks).toHaveLength(0);
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

      const response = await fetch(`${url}/training-plan/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback),
      });

      const feedbacks = await testDbClient(Tables.TrainingPlanFeedback).select('*');

      expect(feedbacks).toHaveLength(0);
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

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${userId}`,
          () => HttpResponse.json({ exists: false })
        )
      );

      const response = await fetch(`${url}/training-plan/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback),
      });

      const feedbacks = await testDbClient(Tables.TrainingPlanFeedback).select('*');

      expect(feedbacks).toHaveLength(0);
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('Like Training Plan', () => {
    it('should like successfully when send valid data', async () => {
      const trainingPlan = trainingPlanFactory
        .extend({ visibility: TrainingPlanVisibility.public })
        .build();
      const userId = '5e2a62de-6ead-4678-a12f-8c17e91513a3';

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${userId}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const response = await fetch(
        `${url}/training-plan/like/${trainingPlan.id}/${userId}`,
        {
          method: 'POST',
        }
      );

      const likes = await testDbClient(Tables.TrainingPlanLikes).select('*');

      expect(likes).toHaveLength(1);
      expect(response.status).toBe(HttpStatus.OK);
    });

    it('should return not found when user not exists', async () => {
      const trainingPlan = trainingPlanFactory.build();
      const userId = '5e2a62de-6ead-4678-a12f-8c17e91513a3';

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${userId}`,
          () => HttpResponse.json({ exists: false })
        )
      );

      const response = await fetch(
        `${url}/training-plan/like/${trainingPlan.id}/${userId}`,
        {
          method: 'POST',
        }
      );

      const likes = await testDbClient(Tables.TrainingPlanLikes).select('*');

      expect(likes).toHaveLength(0);
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return not found when training plan not exists', async () => {
      const trainingPlan = trainingPlanFactory.build();
      const userId = '5e2a62de-6ead-4678-a12f-8c17e91513a3';

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${userId}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const response = await fetch(
        `${url}/training-plan/like/${trainingPlan.id}/${userId}`,
        {
          method: 'POST',
        }
      );

      const likes = await testDbClient(Tables.TrainingPlanLikes).select('*');

      expect(likes).toHaveLength(0);
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return not found when training plan visibility is private', async () => {
      const trainingPlan = trainingPlanFactory
        .extend({ visibility: TrainingPlanVisibility.private })
        .build();
      const userId = '5e2a62de-6ead-4678-a12f-8c17e91513a3';

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${userId}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const response = await fetch(
        `${url}/training-plan/like/${trainingPlan.id}/${userId}`,
        {
          method: 'POST',
        }
      );

      const likes = await testDbClient(Tables.TrainingPlanLikes).select('*');

      expect(likes).toHaveLength(0);
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return not found when training plan visibility is protected and user is not in list', async () => {
      const trainingPlan = trainingPlanFactory
        .extend({ visibility: TrainingPlanVisibility.protected })
        .build();
      const userId = '5e2a62de-6ead-4678-a12f-8c17e91513a3';
      const planParticipant = planParticipantFactory
        .extend({
          trainingPlanId: trainingPlan.id,
        })
        .build();

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.TrainingPlanParticipants).insert(planParticipant);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${userId}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const response = await fetch(
        `${url}/training-plan/like/${trainingPlan.id}/${userId}`,
        {
          method: 'POST',
        }
      );

      const likes = await testDbClient(Tables.TrainingPlanLikes).select('*');

      expect(likes).toHaveLength(0);
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should like successfully when training plan visibility is protected and user is in private list', async () => {
      const trainingPlan = trainingPlanFactory
        .extend({ visibility: TrainingPlanVisibility.protected })
        .build();
      const userId = '5e2a62de-6ead-4678-a12f-8c17e91513a3';
      const planParticipant = planParticipantFactory
        .extend({
          userId,
          trainingPlanId: trainingPlan.id,
        })
        .build();

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.TrainingPlanParticipants).insert(planParticipant);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${userId}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const response = await fetch(
        `${url}/training-plan/like/${trainingPlan.id}/${userId}`,
        {
          method: 'POST',
        }
      );

      const likes = await testDbClient(Tables.TrainingPlanLikes).select('*');

      expect(likes).toHaveLength(1);
      expect(response.status).toBe(HttpStatus.OK);
    });

    it('should like successfully when send duplicated valid data', async () => {
      const trainingPlan = trainingPlanFactory
        .extend({ visibility: TrainingPlanVisibility.public })
        .build();
      const userId = '5e2a62de-6ead-4678-a12f-8c17e91513a3';
      const planParticipant = planParticipantFactory
        .extend({
          userId,
          trainingPlanId: trainingPlan.id,
        })
        .build();
      const like = trainingPlanLikeFactory
        .extend({ likedBy: userId, trainingPlanId: trainingPlan.id })
        .build();

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.TrainingPlanParticipants).insert(planParticipant);
      await testDbClient(Tables.TrainingPlanLikes).insert(like);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${userId}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const response = await fetch(
        `${url}/training-plan/like/${trainingPlan.id}/${userId}`,
        {
          method: 'POST',
        }
      );

      const likes = await testDbClient(Tables.TrainingPlanLikes).select('*');

      expect(likes).toHaveLength(1);
      expect(response.status).toBe(HttpStatus.OK);
    });

    it('should remove like successfully when send valid data', async () => {
      const trainingPlan = trainingPlanFactory.build();
      const userId = '5e2a62de-6ead-4678-a12f-8c17e91513a3';
      const planParticipant = planParticipantFactory
        .extend({
          userId,
          trainingPlanId: trainingPlan.id,
        })
        .build();
      const like = trainingPlanLikeFactory
        .extend({ likedBy: userId, trainingPlanId: trainingPlan.id })
        .build();

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.TrainingPlanParticipants).insert(planParticipant);
      await testDbClient(Tables.TrainingPlanLikes).insert(like);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${userId}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const response = await fetch(
        `${url}/training-plan/like/${trainingPlan.id}/${userId}`,
        {
          method: 'DELETE',
        }
      );

      const likes = await testDbClient(Tables.TrainingPlanLikes).select('*');

      expect(likes).toHaveLength(0);
      expect(response.status).toBe(HttpStatus.OK);
    });

    it('should return not found when like not exists', async () => {
      const trainingPlan = trainingPlanFactory.build();
      const userId = '5e2a62de-6ead-4678-a12f-8c17e91513a3';

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${userId}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const response = await fetch(
        `${url}/training-plan/like/${trainingPlan.id}/${userId}`,
        {
          method: 'DELETE',
        }
      );

      const likes = await testDbClient(Tables.TrainingPlanLikes).select('*');

      expect(likes).toHaveLength(0);
      expect(response.status).toBe(HttpStatus.OK);
    });
  });

  describe('Clone Training Plan', () => {
    it('should clone a training plan successfully when send valid data', async () => {
      const trainingPlan = trainingPlanFactory
        .extend({ visibility: TrainingPlanVisibility.public })
        .build();
      const userId = '5e2a62de-6ead-4678-a12f-8c17e91513a3';

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${userId}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const response = await fetch(
        `${url}/training-plan/clone/${userId}/${trainingPlan.id}`,
        {
          method: 'POST',
        }
      );

      const plans = await testDbClient(Tables.TrainingPlan).select('*');

      expect(plans).toHaveLength(2);
      expect(response.status).toBe(HttpStatus.CREATED);
    });

    it('should return not found when user not exists', async () => {
      const trainingPlan = trainingPlanFactory.build();
      const userId = '5e2a62de-6ead-4678-a12f-8c17e91513a3';

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${userId}`,
          () => HttpResponse.json({ exists: false })
        )
      );

      const response = await fetch(
        `${url}/training-plan/clone/${userId}/${trainingPlan.id}`,
        {
          method: 'POST',
        }
      );
      const plans = await testDbClient(Tables.TrainingPlan).select('*');

      expect(plans).toHaveLength(1);
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return not found when training plan not exists', async () => {
      const trainingPlan = trainingPlanFactory.build();
      const userId = '5e2a62de-6ead-4678-a12f-8c17e91513a3';

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${userId}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const response = await fetch(
        `${url}/training-plan/clone/${userId}/${trainingPlan.id}`,
        {
          method: 'POST',
        }
      );

      const plans = await testDbClient(Tables.TrainingPlan).select('*');

      expect(plans).toHaveLength(0);
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should clone a training plan privately successfully when send valid data', async () => {
      const userId = '5e2a62de-6ead-4678-a12f-8c17e91513a3';

      const trainingPlan = trainingPlanFactory
        .extend({ visibility: TrainingPlanVisibility.public, authorId: userId })
        .build();

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${userId}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const response = await fetch(
        `${url}/training-plan/clone/${userId}/${trainingPlan.id}`,
        {
          method: 'POST',
        }
      );

      const plans = await testDbClient(Tables.TrainingPlan).select('*');

      expect(plans).toHaveLength(2);
      expect(response.status).toBe(HttpStatus.CREATED);
    });

    it('should return not found with training plan privately when is not author', async () => {
      const userId = '5e2a62de-6ead-4678-a12f-8c17e91513a3';

      const trainingPlan = trainingPlanFactory
        .extend({ visibility: TrainingPlanVisibility.private })
        .build();

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${userId}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const response = await fetch(
        `${url}/training-plan/clone/${userId}/${trainingPlan.id}`,
        {
          method: 'POST',
        }
      );

      const plans = await testDbClient(Tables.TrainingPlan).select('*');

      expect(plans).toHaveLength(1);
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should clone a training plan privately successfully when send valid data and user is author', async () => {
      const userId = '5e2a62de-6ead-4678-a12f-8c17e91513a3';

      const trainingPlan = trainingPlanFactory
        .extend({ visibility: TrainingPlanVisibility.protected, authorId: userId })
        .build();

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${userId}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const response = await fetch(
        `${url}/training-plan/clone/${userId}/${trainingPlan.id}`,
        {
          method: 'POST',
        }
      );

      const plans = await testDbClient(Tables.TrainingPlan).select('*');

      expect(plans).toHaveLength(2);
      expect(response.status).toBe(HttpStatus.CREATED);
    });

    it('should clone a training plan privately successfully when send valid data and user is in private participants', async () => {
      const userId = '5e2a62de-6ead-4678-a12f-8c17e91513a3';

      const trainingPlan = trainingPlanFactory
        .extend({ visibility: TrainingPlanVisibility.protected })
        .build();

      const planParticipant = planParticipantFactory
        .extend({
          trainingPlanId: trainingPlan.id,
          userId,
        })
        .build();

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.TrainingPlanParticipants).insert(planParticipant);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${userId}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const response = await fetch(
        `${url}/training-plan/clone/${userId}/${trainingPlan.id}`,
        {
          method: 'POST',
        }
      );

      const plans = await testDbClient(Tables.TrainingPlan).select('*');

      expect(plans).toHaveLength(2);
      expect(response.status).toBe(HttpStatus.CREATED);
    });

    it('should return not found with training plan protected when is not author', async () => {
      const userId = '5e2a62de-6ead-4678-a12f-8c17e91513a3';

      const trainingPlan = trainingPlanFactory
        .extend({ visibility: TrainingPlanVisibility.protected })
        .build();

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${userId}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const response = await fetch(
        `${url}/training-plan/clone/${userId}/${trainingPlan.id}`,
        {
          method: 'POST',
        }
      );

      const plans = await testDbClient(Tables.TrainingPlan).select('*');

      expect(plans).toHaveLength(1);
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return not found with training plan protected when user is not in private participants', async () => {
      const userId = '5e2a62de-6ead-4678-a12f-8c17e91513a3';

      const trainingPlan = trainingPlanFactory
        .extend({ visibility: TrainingPlanVisibility.protected })
        .build();
      const planParticipant = planParticipantFactory
        .extend({
          trainingPlanId: trainingPlan.id,
        })
        .build();

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.TrainingPlanParticipants).insert(planParticipant);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${userId}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const response = await fetch(
        `${url}/training-plan/clone/${userId}/${trainingPlan.id}`,
        {
          method: 'POST',
        }
      );

      const plans = await testDbClient(Tables.TrainingPlan).select('*');

      expect(plans).toHaveLength(1);
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
