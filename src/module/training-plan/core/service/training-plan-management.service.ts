import { Injectable, NotFoundException } from '@nestjs/common';
import { TrainingPlanRepository } from '@src/module/training-plan/persistence/repository/training-plan.repository';
import { CreateTrainingPlanRequestDto } from '../../http/rest/dto/request/create-training-plan-request.dto';
import { TrainingPlan } from '../../persistence/entity/training-plan.entity';

@Injectable()
export class TrainingPlanManagementService {
  constructor(private readonly trainingPlanRepository: TrainingPlanRepository) {}

  async traningPlanExists(trainingPlanId: string) {
    return await this.trainingPlanRepository.traningPlanExists(trainingPlanId);
  }

  async create(trainingPlanData: CreateTrainingPlanRequestDto) {
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
    return await this.trainingPlanRepository.deleteTrainingPlan(id);
  }

  async get(id: string) {
    const trainingPlan = await this.trainingPlanRepository.findOneById(id);

    if (!trainingPlan) throw new NotFoundException();

    return { ...trainingPlan };
  }

  async list(userId: string) {
    return await this.trainingPlanRepository.findTrainingPlansByAuthorId(userId);
  }

  async listAll() {
    return await this.trainingPlanRepository.findTrainingPlans();
  }
}
