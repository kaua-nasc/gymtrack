import { Injectable } from '@nestjs/common';
import { TrainingPlanManagementService } from '@src/module/training-plan/core/service/training-plan-management.service';
import { TrainingPlanExistsApi } from '@src/module/shared/module/integration/interface/training-plan-integration.interface';

@Injectable()
export class TrainingPlanPublicApiProvider implements TrainingPlanExistsApi {
  constructor(
    private readonly trainingPlanManagementService: TrainingPlanManagementService
  ) {}

  public async traningPlanExists(trainingPlanId: string): Promise<boolean> {
    return await this.trainingPlanManagementService.traningPlanExists(trainingPlanId);
  }
}
