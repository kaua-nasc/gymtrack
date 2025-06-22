import { Injectable, NotFoundException } from '@nestjs/common';
import { TrainingPlanRepository } from '@src/module/training-plan/persistence/repository/training-plan.repository';
import { CreateTrainingPlanRequestDto } from '../../http/rest/dto/request/create-training-plan-request.dto';
import { TrainingPlan } from '../../persistence/entity/training-plan.entity';

@Injectable()
export class TrainingPlanManagementService {
  constructor(
    private readonly trainingPlanRepository: TrainingPlanRepository
    // private readonly trainingPlanProgressRepository: TrainingPlanProgressRepository,
    // private readonly trainingPlanProgressService: TrainingPlanProgressService
  ) {}

  async traningPlanExists(trainingPlanId: string) {
    return await this.trainingPlanRepository.traningPlanExists(trainingPlanId);
  }

  async create(trainingPlanData: CreateTrainingPlanRequestDto) {
    const trainingPlan = await this.trainingPlanRepository.saveTrainingPlan(
      new TrainingPlan({ ...trainingPlanData })
    );

    // const trainingPlanProgress = new TrainingPlanProgress({
    //   userId: trainingPlan.authorId,
    //   trainingPlanId: trainingPlan.id,
    // });

    // this.trainingPlanProgressService.setStatusToNotStarted(trainingPlanProgress);

    // await this.trainingPlanProgressRepository.saveTrainingPlanProgress(
    //   trainingPlanProgress
    // );

    // const progress = await this.trainingPlanProgressRepository.findTrainingPlanProgress(
    //   trainingPlan.authorId,
    //   trainingPlan.id
    // );

    return {
      id: trainingPlan.id,
      authorId: trainingPlan.authorId,
      name: trainingPlan.name,
      //status: progress.status,
    };
  }

  async delete(id: string) {
    return await this.trainingPlanRepository.deleteTrainingPlan(id);
  }

  async get(id: string) {
    const trainingPlan = await this.trainingPlanRepository.findOneById(id);

    if (!trainingPlan) throw new NotFoundException();

    // const progress = await this.trainingPlanProgressRepository.findTrainingPlanProgress(
    //   trainingPlan.authorId,
    //   trainingPlan.id
    // );

    // return { ...trainingPlan, status: progress.status };
    return { ...trainingPlan };
  }

  async list(userId: string) {
    return await this.trainingPlanRepository.findTrainingPlansByAuthorId(userId);
  }

  async lista() {
    return await this.trainingPlanRepository.findTrainingPlans();
  }
}
