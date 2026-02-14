import { Injectable } from '@nestjs/common';
import { ConfigService } from '@src/module/shared/module/config/service/config.service';
import { TrainingPlanApiExistsResponseDto } from '@src/module/shared/module/integration/http/dto/training-plan-exists-response.dto';
import { HttpClient } from '../../http-client/client/http.client';

@Injectable()
export class TrainingPlanHttpClient {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly configService: ConfigService
  ) {}

  async traningPlanExists(trainingPlanId: string): Promise<boolean> {
    const serviceToken = this.configService.get('trainingPlanApi.serviceToken');

    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${serviceToken}`,
      },
    };
    const url = `${this.configService.get('trainingPlanApi.url')}/training-plan/exists/${trainingPlanId}`;

    const response = await this.httpClient.get<TrainingPlanApiExistsResponseDto>(
      url,
      options
    );

    return response.exists;
  }
}
