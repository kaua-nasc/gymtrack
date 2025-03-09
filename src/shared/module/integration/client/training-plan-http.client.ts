import { Injectable } from '@nestjs/common';
import { HttpClient } from '@src/shared/http/client/http.client';
import { ConfigService } from '@src/shared/module/config/service/config.service';
import { TrainingPlanApiExistsResponseDto } from '@src/shared/module/integration/http/dto/training-plan-exists-response.dto';
import {
  TrainingPlanCompleteApi,
  TrainingPlanExistsApi,
  TrainingPlanUpdateToInProgressApi,
} from '@src/shared/module/integration/interface/training-plan-integration.interface';

@Injectable()
export class TrainingPlanHttpClient
  implements
    TrainingPlanExistsApi,
    TrainingPlanCompleteApi,
    TrainingPlanUpdateToInProgressApi
{
  constructor(
    private readonly httpClient: HttpClient,
    private readonly configService: ConfigService
  ) {}
  async updateToInProgressTrainingPlan(
    userId: string,
    trainingPlanId: string
  ): Promise<{ status: boolean }> {
    const options = { method: 'PUT', headers: { accept: 'application/json' } };
    const url = `${this.configService.get('billingApi').url}/training-plan/progress/in-progress/${userId}/${trainingPlanId}`;

    return await this.httpClient.get<{ status: boolean }>(url, options);
  }

  async completeTrainingPlan(
    userId: string,
    trainingPlanId: string
  ): Promise<{ status: boolean }> {
    const options = {
      method: 'PUT',
      headers: {
        accept: 'application/json',
        //Authorization: `Bearer PUT SOMETHING`,
      },
    };
    const url = `${this.configService.get('billingApi').url}/training-plan/progress/complete/${userId}/${trainingPlanId}`;

    return await this.httpClient.get<{ status: boolean }>(url, options);
  }

  async traningPlanExists(trainingPlanId: string): Promise<boolean> {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        //Authorization: `Bearer PUT SOMETHING`,
      },
    };
    const url = `${this.configService.get('billingApi').url}/training-plan/exists/${trainingPlanId}`;

    const response = await this.httpClient.get<TrainingPlanApiExistsResponseDto>(
      url,
      options
    );

    return response.exists;
  }
}
