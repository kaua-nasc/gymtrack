import { Injectable } from '@nestjs/common';
import {
  BillingSubscriptionPlanTrainingPlanQuantityApi,
  BillingSubscriptionStatusApi,
} from '@src/shared/module/integration/interface/billing-integration.interface';
import { HttpClient } from '@src/shared/http/client/http.client';
import {
  BillingApiSubscriptionStatus,
  BillingApiSubscriptionStatusResponseDto,
} from '@src/shared/module/integration/http/dto/billing-api-subscription-status-response.dto';
import { BillingApiSubscriptionPlanTrainingPlanQuantityResponseDto } from '@src/shared/module/integration/http/dto/billing-api-subscription-plan-training-plan-quantity-response.dto';
import { ConfigService } from '../../config/service/config.service';

@Injectable()
export class BillingSubscriptionHttpClient
  implements BillingSubscriptionStatusApi, BillingSubscriptionPlanTrainingPlanQuantityApi
{
  constructor(
    private readonly httpClient: HttpClient,
    private readonly configService: ConfigService
  ) {}

  async isUserSubscriptionActive(userId: string): Promise<boolean> {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer PUT SOMETHING`,
      },
    };
    const url = `${this.configService.get('billingApi').url}/subscription/user/${userId}`;

    const response = await this.httpClient.get<BillingApiSubscriptionStatusResponseDto>(
      url,
      options
    );

    return response.status === BillingApiSubscriptionStatus.Active ? true : false;
  }

  async subscriptionPlanTrainingPlanQuantity(userId: string): Promise<number> {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer PUT SOMETHING`,
      },
    };

    const url = `${this.configService.get('billingApi').url}/subscription/user/${userId}`;

    const response =
      await this.httpClient.get<BillingApiSubscriptionPlanTrainingPlanQuantityResponseDto>(
        url,
        options
      );

    return response.plan.trainingPlanQuantity;
  }
}
