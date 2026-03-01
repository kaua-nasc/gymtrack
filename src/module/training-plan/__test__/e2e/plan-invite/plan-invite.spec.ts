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
import { TrainingPlanModule } from '@src/module/training-plan/training-plan.module';
import { Tables } from '@testInfra/enum/table.enum';
import { testDbClient } from '@testInfra/knex.database';
import { createNestApp } from '@testInfra/test-e2e.setup';
import { sign } from 'jsonwebtoken';
import { SetupServerApi } from 'msw/node';
import { trainingPlanFactory } from '../../factory/training-plan.factory';
import { TrainingPlanVisibility } from '@src/module/training-plan/core/enum/training-plan-visibility.enum';
import { mockEmailService } from '@testInfra/mock/email.mock';

describe('Plan Invite Controller - (e2e)', () => {
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
    await testDbClient(Tables.PlanInvite).del();
    await testDbClient(Tables.TrainingPlan).del();
    mockEmailService.sendEmail.mockClear();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(async () => {
    if (module) {
      await testDbClient(Tables.PlanInvite).del();
      await testDbClient(Tables.TrainingPlan).del();
      await module.close();
    }

    if (app) {
      await app.close();
    }
  });

  const getAuthorizationHeader = (userId: string) => {
    return {
      Authorization: `Bearer ${sign(
        {
          sub: userId,
        },
        configuration['auth.jwtSecret'] as string
      )}`,
    };
  };

  describe('POST /training-plan/:id/share', () => {
    it('should share a training plan successfully', async () => {
      const trainingPlan = trainingPlanFactory.build({
        visibility: TrainingPlanVisibility.public,
      });
      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);

      const shareRequest = {
        recipientEmail: 'friend@example.com',
      };

      const response = await fetch(`${url}/training-plan/${trainingPlan.id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(trainingPlan.authorId!),
        },
        body: JSON.stringify(shareRequest),
      });

      expect(response.status).toBe(HttpStatus.OK);
      const invites = await testDbClient(Tables.PlanInvite).select('*');
      expect(invites).toHaveLength(1);
      expect(invites[0].recipientEmail).toBe(shareRequest.recipientEmail);
      expect(mockEmailService.sendEmail).toHaveBeenCalled();
    });

    it('should return 403 when trying to share a private plan', async () => {
      const trainingPlan = trainingPlanFactory.build({
        visibility: TrainingPlanVisibility.private,
      });
      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);

      const shareRequest = {
        recipientEmail: 'friend@example.com',
      };

      const response = await fetch(`${url}/training-plan/${trainingPlan.id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader(trainingPlan.authorId!),
        },
        body: JSON.stringify(shareRequest),
      });

      expect(response.status).toBe(HttpStatus.FORBIDDEN);
    });

    it('should return 403 when user is not the author', async () => {
      const trainingPlan = trainingPlanFactory.build({
        visibility: TrainingPlanVisibility.public,
      });
      await testDbClient(Tables.TrainingPlan).insert(trainingPlan);

      const shareRequest = {
        recipientEmail: 'friend@example.com',
      };

      const response = await fetch(`${url}/training-plan/${trainingPlan.id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader('other-user-id'),
        },
        body: JSON.stringify(shareRequest),
      });

      expect(response.status).toBe(HttpStatus.FORBIDDEN);
    });
  });
});
