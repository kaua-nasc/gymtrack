import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TrainingPlanRepository } from '@src/module/training-plan/persistence/repository/training-plan.repository';
import { CreateTrainingPlanRequestDto } from '../../http/rest/dto/request/create-training-plan-request.dto';
import { TrainingPlan } from '../../persistence/entity/training-plan.entity';
import { IdentityUserExistsApi } from '@src/module/shared/module/integration/interface/identity-integration.interface';

@Injectable()
export class TrainingPlanManagementService {
  constructor(
    private readonly trainingPlanRepository: TrainingPlanRepository,
    @Inject(IdentityUserExistsApi)
    private readonly identityUserServiceClient: IdentityUserExistsApi
  ) {}

  async traningPlanExists(trainingPlanId: string) {
    return await this.trainingPlanRepository.traningPlanExists(trainingPlanId);
  }

  async create(trainingPlanData: CreateTrainingPlanRequestDto) {
    if (!(await this.identityUserServiceClient.userExists(trainingPlanData.authorId))) {
      throw new NotFoundException('user not found');
    }

    const trainingPlan = await this.trainingPlanRepository.saveTrainingPlan(
      new TrainingPlan({ ...trainingPlanData })
    );

    return {
      id: trainingPlan.id,
      authorId: trainingPlan.authorId,
      name: trainingPlan.name,
    };
  }

  async delete(id: string) {
    const exists = await this.exists(id);
    if (!exists) throw new NotFoundException(`training plan with id ${id} not found`);

    return await this.trainingPlanRepository.deleteTrainingPlan(id);
  }

  async get(id: string) {
    const trainingPlan = await this.trainingPlanRepository.find({
      where: { id },
      relations: { days: { exercises: true } },
    });

    if (!trainingPlan) throw new NotFoundException();

    return { ...trainingPlan };
  }

  async exists(id: string) {
    const trainingPlan = await this.trainingPlanRepository.find({
      where: { id },
    });

    return trainingPlan ? true : false;
  }

  async list() {
    const plans = await this.trainingPlanRepository.findMany({});
    return plans ?? [];
  }

  async listByUserId(userId: string) {
    return await this.trainingPlanRepository.findTrainingPlansByAuthorId(userId);
  }

  async listAll() {
    return await this.trainingPlanRepository.findTrainingPlans();
  }
}
