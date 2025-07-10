import { Injectable } from '@nestjs/common';
import { TrainingPlanManagementService } from '@src/module/training-plan/core/service/training-plan-management.service';

@Injectable()
export class TrainingPlanPublicApiProvider {
  constructor(
    private readonly trainingPlanManagementService: TrainingPlanManagementService
  ) {}

  public async traningPlanExists(trainingPlanId: string): Promise<boolean> {
    return await this.trainingPlanManagementService.traningPlanExists(trainingPlanId);
  }
}
