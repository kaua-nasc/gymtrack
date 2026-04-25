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
import { UserType } from '@src/module/identity/core/enum/user-type.enum';
import { userFactory } from '@src/module/identity/__test__/factory/user.factory';
import { TrainingPlanVisibility } from '@src/module/training-plan/core/enum/training-plan-visibility.enum';
import { TrainingPlanModule } from '@src/module/training-plan/training-plan.module';
import { Tables } from '@testInfra/enum/table.enum';
import { testDbClient } from '@testInfra/knex.database';
import { createNestApp } from '@testInfra/test-e2e.setup';
import { JwtService } from '@nestjs/jwt';
import { HttpResponse, http } from 'msw';
import { SetupServer } from 'msw/node';
import {
  planParticipantFactory,
  trainingPlanFactory,
  trainingPlanLikeFactory,
} from '../../factory/training-plan.factory';

describe('Training Plan - Training Plan Controller - (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;
  let url: string;
  let server: SetupServer;
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
    if (module) {
      await testDbClient(Tables.User).del();
      await testDbClient(Tables.TrainingPlan).del();
      await module.close();
    }

    if (app) {
      await app.close();
    }
  });

  const getAuthorizationHeader = (userId: string, type: UserType = UserType.client) => {
    return {
      Authorization: `Bearer ${new JwtService().sign(
        {
          sub: userId,
          type,
        },
        { secret: configuration['auth.jwtSecret'] as string }
      )}`,
    };
  };

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
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(user.id!),
        },
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
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(trainingPlan.authorId!),
        },
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
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(trainingPlan.authorId!),
        },
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
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(trainingPlan.authorId!),
        },
        body: JSON.stringify(trainingPlan),
      });

      const plans = await testDbClient(Tables.TrainingPlan).select('*');

      expect(plans).toHaveLength(0);
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should prevent CLIENT from creating more than one training plan', async () => {
      const user = userFactory.build();
      const existingPlan = trainingPlanFactory.build({ authorId: user.id });

      await testDbClient(Tables.TrainingPlan).insert(existingPlan);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const newPlan = trainingPlanFactory.build({ authorId: user.id });

      const response = await fetch(`${url}/training-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(user.id!, UserType.client),
        },
        body: JSON.stringify(newPlan),
      });

      const body = (await response.json()) as { message: string };
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(body.message).toContain('can only have one personal training plan');
    });

    it('should force visibility to PRIVATE when CLIENT creates a training plan', async () => {
      const user = userFactory.build();

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const trainingPlan = trainingPlanFactory.build({
        authorId: user.id,
        visibility: TrainingPlanVisibility.public,
      });

      const response = await fetch(`${url}/training-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(user.id!, UserType.client),
        },
        body: JSON.stringify(trainingPlan),
      });

      expect(response.status).toBe(HttpStatus.CREATED);

      const [savedPlan] = await testDbClient(Tables.TrainingPlan)
        .select('*')
        .where({ authorId: user.id });

      expect(savedPlan.visibility).toBe(TrainingPlanVisibility.private);
    });

    it('should allow PERSONAL_TRAINER to create multiple training plans with any visibility', async () => {
      const user = userFactory.build();

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const plan1 = trainingPlanFactory.build({
        authorId: user.id,
        visibility: TrainingPlanVisibility.public,
      });
      const plan2 = trainingPlanFactory.build({
        authorId: user.id,
        visibility: TrainingPlanVisibility.protected,
      });

      const res1 = await fetch(`${url}/training-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(user.id!, UserType.personalTrainer),
        },
        body: JSON.stringify(plan1),
      });

      const res2 = await fetch(`${url}/training-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(user.id!, UserType.personalTrainer),
        },
        body: JSON.stringify(plan2),
      });

      expect(res1.status).toBe(HttpStatus.CREATED);
      expect(res2.status).toBe(HttpStatus.CREATED);

      const savedPlans = await testDbClient(Tables.TrainingPlan)
        .select('*')
        .where({ authorId: user.id });

      expect(savedPlans).toHaveLength(2);
      expect(savedPlans.some((p) => p.visibility === TrainingPlanVisibility.public)).toBe(
        true
      );
      expect(
        savedPlans.some((p) => p.visibility === TrainingPlanVisibility.protected)
      ).toBe(true);
    });
  });

  describe('List Training Plan', () => {
    it('should list training plans by author id when exists training plan', async () => {
      const firstTrainingPlan = trainingPlanFactory.build();

      await testDbClient(Tables.TrainingPlan).insert(firstTrainingPlan);

      const response = await fetch(
        `${url}/training-plan/list/${firstTrainingPlan.authorId}`,
        {
          headers: {
            ...getAuthorizationHeader(firstTrainingPlan.authorId!),
          },
        }
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
        `${url}/training-plan/list/${firstTrainingPlan.authorId}`,
        {
          headers: {
            ...getAuthorizationHeader(firstTrainingPlan.authorId!),
          },
        }
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
        headers: {
          ...getAuthorizationHeader(firstTrainingPlan.authorId!),
        },
      });

      expect(response.status).toBe(HttpStatus.OK);
    });

    it('should delete an training plan when has a training plan 2', async () => {
      const firstTrainingPlan = trainingPlanFactory.build();

      const response = await fetch(`${url}/training-plan/${firstTrainingPlan.id}`, {
        method: 'DELETE',
        headers: {
          ...getAuthorizationHeader(firstTrainingPlan.authorId!),
        },
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
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(userId),
        },
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
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(trainingPlan.authorId!),
        },
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
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(trainingPlan.authorId!),
        },
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
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(userId),
        },
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

      const response = await fetch(`${url}/training-plan/${trainingPlan.id}/like`, {
        method: 'POST',
        headers: {
          ...getAuthorizationHeader(userId),
        },
      });

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

      const response = await fetch(`${url}/training-plan/${trainingPlan.id}/like`, {
        method: 'POST',
        headers: {
          ...getAuthorizationHeader(userId),
        },
      });

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

      const response = await fetch(`${url}/training-plan/${trainingPlan.id}/like`, {
        method: 'POST',
        headers: {
          ...getAuthorizationHeader(userId),
        },
      });

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

      const response = await fetch(`${url}/training-plan/${trainingPlan.id}/like`, {
        method: 'POST',
        headers: {
          ...getAuthorizationHeader(userId),
        },
      });

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

      const response = await fetch(`${url}/training-plan/${trainingPlan.id}/like`, {
        method: 'POST',
        headers: {
          ...getAuthorizationHeader(userId),
        },
      });

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

      const response = await fetch(`${url}/training-plan/${trainingPlan.id}/like`, {
        method: 'POST',
        headers: {
          ...getAuthorizationHeader(userId),
        },
      });

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

      const response = await fetch(`${url}/training-plan/${trainingPlan.id}/like`, {
        method: 'POST',
        headers: {
          ...getAuthorizationHeader(userId),
        },
      });

      const likes = await testDbClient(Tables.TrainingPlanLikes).select('*');

      expect(likes).toHaveLength(1);
      expect(response.status).toBe(HttpStatus.OK);
    });

    it('should remove like successfully when send valid data', async () => {
      const trainingPlan = trainingPlanFactory.build();
      const user = userFactory.build();
      const planParticipant = planParticipantFactory
        .extend({
          userId: user.id,
          trainingPlanId: trainingPlan.id,
        })
        .build();
      const like = trainingPlanLikeFactory
        .extend({ likedBy: user.id, trainingPlanId: trainingPlan.id })
        .build();

      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);
      await testDbClient(Tables.TrainingPlanParticipants).insert(planParticipant);
      await testDbClient(Tables.TrainingPlanLikes).insert(like);

      server.use(
        http.get(
          `${configuration['identityApi.url']}/identity/user/exists/${user.id}`,
          () => HttpResponse.json({ exists: true })
        )
      );

      const response = await fetch(`${url}/training-plan/${trainingPlan.id}/like`, {
        method: 'DELETE',
        headers: {
          ...getAuthorizationHeader(user.id!),
        },
      });

      const likes = await testDbClient(Tables.TrainingPlanLikes)
        .select('*')
        .where('deletedAt', '<>', null);

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

      const response = await fetch(`${url}/training-plan/${trainingPlan.id}/like`, {
        method: 'DELETE',
        headers: {
          ...getAuthorizationHeader(userId),
        },
      });

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

      const response = await fetch(`${url}/training-plan/${trainingPlan.id}/clone`, {
        method: 'POST',
        headers: {
          ...getAuthorizationHeader(userId),
        },
      });

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

      const response = await fetch(`${url}/training-plan/${trainingPlan.id}/clone`, {
        method: 'POST',
        headers: {
          ...getAuthorizationHeader(userId),
        },
      });
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

      const response = await fetch(`${url}/training-plan/${trainingPlan.id}/clone`, {
        method: 'POST',
        headers: {
          ...getAuthorizationHeader(userId),
        },
      });

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

      const response = await fetch(`${url}/training-plan/${trainingPlan.id}/clone`, {
        method: 'POST',
        headers: {
          ...getAuthorizationHeader(userId),
        },
      });

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

      const response = await fetch(`${url}/training-plan/${trainingPlan.id}/clone`, {
        method: 'POST',
        headers: {
          ...getAuthorizationHeader(userId),
        },
      });

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

      const response = await fetch(`${url}/training-plan/${trainingPlan.id}/clone`, {
        method: 'POST',
        headers: {
          ...getAuthorizationHeader(userId),
        },
      });

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

      const response = await fetch(`${url}/training-plan/${trainingPlan.id}/clone`, {
        method: 'POST',
        headers: {
          ...getAuthorizationHeader(userId),
        },
      });

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

      const response = await fetch(`${url}/training-plan/${trainingPlan.id}/clone`, {
        method: 'POST',
        headers: {
          ...getAuthorizationHeader(userId),
        },
      });

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

      const response = await fetch(`${url}/training-plan/${trainingPlan.id}/clone`, {
        method: 'POST',
        headers: {
          ...getAuthorizationHeader(userId),
        },
      });

      const plans = await testDbClient(Tables.TrainingPlan).select('*');

      expect(plans).toHaveLength(1);
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
