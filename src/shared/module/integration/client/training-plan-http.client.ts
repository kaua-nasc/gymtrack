import { Injectable } from '@nestjs/common';
import { HttpClient } from '@src/shared/http/client/http.client';
import { TrainingPlanExistsApi } from '@src/shared/module/integration/interface/training-plan-integration.interface';
import { TrainingPlanApiExistsResponseDto } from '@src/shared/module/integration/http/dto/training-plan-exists-response.dto';
import { ConfigService } from '../../config/service/config.service';

@Injectable()
export class TrainingPlanHttpClient implements TrainingPlanExistsApi {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly configService: ConfigService
  ) {}

  async traningPlanExists(trainingPlanId: string): Promise<boolean> {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer PUT SOMETHING`,
      },
    };
    const url = `${this.configService.get('billingApi').url}/training-plan/${trainingPlanId}`;

    const response = await this.httpClient.get<TrainingPlanApiExistsResponseDto>(
      url,
      options
    );

    return response.exists;
  }
}
