import { Test, TestingModule } from '@nestjs/testing';
import { UserManagementService } from '@src/module/identity/core/service/user-management.service';
import { UserRepository } from '@src/module/identity/persistence/repository/user.repository';
import { ConfigModule } from '@src/shared/module/config/config.module';
import { HttpClientModule } from '@src/shared/module/http-client/http-client.module';
import { TrainingPlanHttpClient } from '@src/shared/module/integration/client/training-plan-http.client';
import { TrainingPlanExistsApi } from '@src/shared/module/integration/interface/training-plan-integration.interface';

describe('UserManagementService', () => {
  let service: UserManagementService;
  let userRepository: UserRepository;
  let trainingPlanExistsApi: TrainingPlanExistsApi;

  let user: any;
  let trainingPlan: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), HttpClientModule],
      providers: [
        UserManagementService,
        {
          provide: TrainingPlanExistsApi,
          useClass: TrainingPlanHttpClient,
        },
        {
          provide: UserRepository,
          useValue: {
            saveUser: jest.fn(),
            findUserById: jest.fn(),
            associateCurrentTrainingPlanToUser: jest.fn(),
            associateNextTrainingPlanToUser: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserManagementService>(UserManagementService);
    userRepository = module.get<UserRepository>(UserRepository);
    trainingPlanExistsApi = module.get<TrainingPlanExistsApi>(TrainingPlanExistsApi);

    user = {
      id: '123',
      email: 'test@example.com',
      password: 'password',
      firstName: 'John',
      lastName: 'Doe',
      createdAt: new Date(),
    };

    trainingPlan = { id: '12345' };
  });

  describe('create', () => {
    it('should create a new user', async () => {
      jest.spyOn(userRepository, 'saveUser').mockResolvedValueOnce();

      const { email } = await service.create(user);

      expect(email).toEqual(user.email);
    });
  });

  describe('associate training plan to user', () => {
    beforeEach(() => {
      jest.spyOn(trainingPlanExistsApi, 'traningPlanExists').mockResolvedValueOnce(true);
      jest.spyOn(userRepository, 'findUserById').mockResolvedValueOnce({ ...user });
    });

    it('should associate a current training plan to the use', async () => {
      jest
        .spyOn(userRepository, 'associateCurrentTrainingPlanToUser')
        .mockResolvedValueOnce();

      const { currentTrainingPlan } = await service.associateCurrentTrainingPlan(
        user.id,
        trainingPlan.id
      );

      expect(currentTrainingPlan).toEqual(trainingPlan.id);
    });

    it('should associate a next training plan to the user', async () => {
      jest
        .spyOn(userRepository, 'associateNextTrainingPlanToUser')
        .mockResolvedValueOnce();

      const { nextTrainingPlan } = await service.associateNextTrainingPlan(
        user.id,
        trainingPlan.id
      );

      expect(nextTrainingPlan).toEqual(trainingPlan.id);
    });
  });
});
