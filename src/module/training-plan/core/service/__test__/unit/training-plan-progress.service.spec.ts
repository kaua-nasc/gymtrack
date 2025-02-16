import { Test, TestingModule } from '@nestjs/testing';
import { TrainingPlanProgressModel } from '@src/module/training-plan/core/model/training-plan-progress.model';
import { TrainingPlanProgressService } from '@src/module/training-plan/core/service/training-plan-progress.service';
import { TrainingPlanProgressRepository } from '@src/module/training-plan/persistence/repository/training-plan-progress.repository';
import { ConfigModule } from '@src/shared/module/config/config.module';
import { mock, MockProxy } from 'jest-mock-extended';

describe('TrainingPlanProgressService', () => {
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

  describe('saveTrainingPlanProgress', () => {
    it('should create a new training plan progress successfully', async () => {
      const trainingPlan = TrainingPlanProgressModel.create({
        userId: '123',
        trainingPlanId: '123',
        status: 0,
      });

      trainingPlanProgressRepository.saveTrainingPlanProgress.mockResolvedValueOnce(
        trainingPlan
      );

      const createdTrainingPlan = await service.createTrainingPlanProgress(trainingPlan);

      expect(createdTrainingPlan.status).toEqual(0);
      expect(createdTrainingPlan).toMatchObject(trainingPlan);

      expect(
        trainingPlanProgressRepository.saveTrainingPlanProgress
      ).toHaveBeenCalledWith(expect.objectContaining(trainingPlan));
    });
  });

  describe('findTrainingPlanProgress', () => {
    it('should return a training plan progress by user id and training plan id', async () => {
      const data = { userId: '123', trainingPlanId: '321' };
      const dataResult = { ...data, status: 0, createdAt: new Date() };
      trainingPlanProgressRepository.findTrainingPlanProgress.mockResolvedValueOnce({
        ...data,
        createdAt: dataResult.createdAt,
        status: 0,
      });

      const result = await service.findTrainingPlanProgress(
        data.userId,
        data.trainingPlanId
      );

      expect(result).toEqual(dataResult);
      expect(
        trainingPlanProgressRepository.findTrainingPlanProgress
      ).toHaveBeenCalledWith(data.userId, data.trainingPlanId);
    });

    it('should throw an error if repository fails', async () => {
      trainingPlanProgressRepository.findTrainingPlanProgress.mockRejectedValueOnce(
        new Error('Database error')
      );

      await expect(
        service.findTrainingPlanProgress('non-existent-id', 'non-existent-id2')
      ).rejects.toThrow('Database error');
    });
  });
  describe('updateTrainingPlanProgressToInProgress', () => {
    it('should update a training plan progress status to in progress', async () => {
      const data = {
        userId: '123',
        trainingPlanId: '321',
      };
      const dataResult = {
        ...data,
        status: 1,
      };
      trainingPlanProgressRepository.updateTrainingPlanProgressStatus.mockResolvedValueOnce();

      const result = await service.updateTrainingPlanProgressToInProgress(
        data.userId,
        data.trainingPlanId
      );

      expect(result).toEqual(dataResult);
    });
  });
  describe('updateTrainingPlanProgressToCompleted', () => {
    it('should update a training plan progress status to completed', async () => {
      const data = {
        userId: '123',
        trainingPlanId: '321',
      };
      const dataResult = {
        ...data,
        status: 2,
      };
      trainingPlanProgressRepository.updateTrainingPlanProgressStatus.mockResolvedValueOnce();

      const result = await service.updateTrainingPlanProgressToCompleted(
        data.userId,
        data.trainingPlanId
      );

      expect(result).toEqual(dataResult);
    });
  });
});
