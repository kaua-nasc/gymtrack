import { Test, TestingModule } from '@nestjs/testing';
import { TrainingPlanProgressService } from '@src/module/training-plan/core/service/training-plan-progress.service';
import { TrainingPlanProgressRepository } from '@src/module/training-plan/persistence/repository/training-plan-progress.repository';
import { ConfigModule } from '@src/shared/module/config/config.module';
import { mock, MockProxy } from 'jest-mock-extended';

describe('TrainingPlanProgressService', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let service: TrainingPlanProgressService;
  let trainingPlanProgressRepository: MockProxy<TrainingPlanProgressRepository>;

  beforeEach(async () => {
    trainingPlanProgressRepository = mock<TrainingPlanProgressRepository>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        TrainingPlanProgressService,
        {
          provide: TrainingPlanProgressRepository,
          useValue: trainingPlanProgressRepository,
        },
      ],
    }).compile();

    service = module.get(TrainingPlanProgressService);
  });
});
