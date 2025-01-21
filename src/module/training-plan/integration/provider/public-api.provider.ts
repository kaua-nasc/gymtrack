import { Injectable } from '@nestjs/common';
import { TrainingPlanExistsApi } from '@src/shared/module/integration/interface/training-plan-integration.interface';
import { TrainingPlanManagementService } from '@src/module/training-plan/core/service/training-plan-management.service';

@Injectable()
export class TrainingPlanPublicApiProvider implements TrainingPlanExistsApi {
  constructor(
    private readonly trainingPlanManagementService: TrainingPlanManagementService
  ) {}
  public async traningPlanExists(trainingPlanId: string): Promise<boolean> {
    return await this.trainingPlanManagementService.traningPlanExists(trainingPlanId);
  }
}
