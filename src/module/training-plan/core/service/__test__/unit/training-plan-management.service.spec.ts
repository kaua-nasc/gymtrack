import { Test, TestingModule } from '@nestjs/testing';
import { TrainingPlanManagementService } from '@src/module/training-plan/core/service/training-plan-management.service';
import { TrainingPlanRepository } from '@src/module/training-plan/persistence/repository/training-plan.repository';
import { ConfigModule } from '@src/shared/module/config/config.module';
import { mock, MockProxy } from 'jest-mock-extended';

describe('TrainingPlanManagementService', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let service: TrainingPlanManagementService;
  let trainingPlanRepository: MockProxy<TrainingPlanRepository>;

  beforeEach(async () => {
    trainingPlanRepository = mock<TrainingPlanRepository>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        TrainingPlanManagementService,
        { provide: TrainingPlanRepository, useValue: trainingPlanRepository },
      ],
    }).compile();

    service = module.get(TrainingPlanManagementService);
  });
});
