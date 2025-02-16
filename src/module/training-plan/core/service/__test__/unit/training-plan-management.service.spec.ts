import { Test, TestingModule } from '@nestjs/testing';
import { TrainingPlanManagementService } from '@src/module/training-plan/core/service/training-plan-management.service';
import { TrainingPlan } from '@src/module/training-plan/persistence/entity/training-plan.entity';
import { TrainingPlanRepository } from '@src/module/training-plan/persistence/repository/training-plan.repository';
import { ConfigModule } from '@src/shared/module/config/config.module';
import { mock, MockProxy } from 'jest-mock-extended';

const createTrainingPlanMock = (overrides = {}) => ({
  level: 12,
  name: 'Exemplo',
  timeInDays: 4,
  type: 12,
  authorId: '123',
  visibility: 1,
  ...overrides, // Permite modificar campos para testes específicos
});

const data = {
  level: 12,
  name: 'Exemplo',
  timeInDays: 4,
  type: 12,
  authorId: '123',
  visibility: 1,
  id: '123',
  createdAt: new Date(),
};
describe('TrainingPlanManagementService', () => {
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

  describe('createTrainingPlan', () => {
    it('should create a new training plan successfully', async () => {
      const trainingPlanData = createTrainingPlanMock();

      const trainingPlanEntity = new TrainingPlan({
        ...trainingPlanData,
        id: 'generated-id',
        createdAt: new Date(),
        updatedAt: undefined,
        deletedAt: undefined,
      });

      trainingPlanRepository.saveTrainingPlan.mockResolvedValueOnce(trainingPlanEntity);

      const createdTrainingPlan = await service.createTrainingPlan(trainingPlanData);

      expect(createdTrainingPlan).toMatchObject(trainingPlanData);

      expect(trainingPlanRepository.saveTrainingPlan).toHaveBeenCalledWith(
        expect.objectContaining(trainingPlanData)
      );
    });

    it('should throw an error if repository fails', async () => {
      const trainingPlanData = createTrainingPlanMock();

      trainingPlanRepository.saveTrainingPlan.mockRejectedValueOnce(
        new Error('Database error')
      );

      await expect(service.createTrainingPlan(trainingPlanData)).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('getTrainingPlanById', () => {
    it('should return a training plan by its ID', async () => {
      trainingPlanRepository.findOneTrainingPlanById.mockResolvedValueOnce(data);

      const result = await service.findOneTrainingPlanById('plan123');

      expect(result).toEqual(data);
      expect(trainingPlanRepository.findOneTrainingPlanById).toHaveBeenCalledWith(
        'plan123'
      );
    });

    it('should throw an error if repository fails', async () => {
      trainingPlanRepository.findOneTrainingPlanById.mockRejectedValueOnce(
        new Error('Database error')
      );

      await expect(service.findOneTrainingPlanById('non-existent-id')).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('getTrainingPlansByUserId', () => {
    it('should return a list of training plans for a user', async () => {
      const userId = 'user123';
      const data2 = {
        level: 12,
        name: 'Exemplo',
        timeInDays: 4,
        type: 12,
        visibility: 1,
        authorId: userId,
        createdAt: new Date(),
      };

      trainingPlanRepository.findTrainingPlansByAuthorId.mockResolvedValueOnce([
        { ...data2, id: 'plan1' },
        { ...data2, id: 'plan2' },
      ]);

      let result = await service.findTrainingPlansByAuthorId(userId);

      result = result.map((val) => {
        return { ...val, createdAt: data2.createdAt };
      });
      expect(result).toMatchObject([
        { ...data2, id: 'plan1' },
        { ...data2, id: 'plan2' },
      ]);
      expect(trainingPlanRepository.findTrainingPlansByAuthorId).toHaveBeenCalledWith(
        userId
      );
    });

    it('should return an empty array if the user has no training plans', async () => {
      trainingPlanRepository.findTrainingPlansByAuthorId.mockResolvedValueOnce([]);

      const result = await service.findTrainingPlansByAuthorId('user456');

      expect(result).toEqual([]);
      expect(trainingPlanRepository.findTrainingPlansByAuthorId).toHaveBeenCalledWith(
        'user456'
      );
    });
  });
});
