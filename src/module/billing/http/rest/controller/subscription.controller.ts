import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { NotFoundDomainException } from '@src/shared/core/exception/not-found-domain.exception';
import { SubscriptionResponseDto } from '@src/module/billing/http/rest/dto/response/subscription-response.dto';
import { CreateSubscriptionRequestDto } from '@src/module/billing/http/rest/dto/request/create-subscription.dto';
import { SubscriptionService } from '@src/module/billing/core/service/subscription.service';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  async createSubscription(
    @Body() createSubscriptionRequest: CreateSubscriptionRequestDto
  ): Promise<SubscriptionResponseDto> {
    try {
      const createdSubscription = await this.subscriptionService.createSubscription(
        createSubscriptionRequest
      );
      //TODO validate
      return plainToInstance(
        SubscriptionResponseDto,
        { ...createdSubscription, ...{ plan: createdSubscription.Plan } },
        {
          excludeExtraneousValues: true,
        }
      );
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }
      console.error('Error creating subscription', error);
      throw new InternalServerErrorException();
    }
  }

  @Get('/user/:userId')
  async getSubscriptionByUserId(userId: string): Promise<SubscriptionResponseDto> {
    const subscription = await this.subscriptionService.getSubscriptionByUserId(userId);
    return plainToInstance(SubscriptionResponseDto, subscription, {
      excludeExtraneousValues: true,
    });
  }
}
