import { Controller, Delete, Param, Post, Put } from '@nestjs/common';
import { PlanSubscriptionManagementService } from '@src/module/training-plan/core/service/plan-subscription-management.service';

@Controller('training-plan/subscription')
export class PlanSubscriptionController {
  constructor(
    private readonly planSubscriptionManagementService: PlanSubscriptionManagementService
  ) {}

  @Post('/:trainingPlanId/:userId')
  async createSubscription(
    @Param('trainingPlanId') trainingPlanId: string,
    @Param('userId') userId: string
  ) {
    return await this.planSubscriptionManagementService.createSubscription(
      trainingPlanId,
      userId
    );
  }

  @Delete('/:trainingPlanId/:userId')
  async removeSubscription(
    @Param('trainingPlanId') trainingPlanId: string,
    @Param('userId') userId: string
  ) {
    return await this.planSubscriptionManagementService.removeSubscription(
      trainingPlanId,
      userId
    );
  }

  @Put('/send/in-progress/:trainingPlanId/:userId')
  async updateStatusToInProgress(
    @Param('trainingPlanId') trainingPlanId: string,
    @Param('userId') userId: string
  ) {
    return await this.planSubscriptionManagementService.updateStatusToInProgress(
      trainingPlanId,
      userId
    );
  }

  @Put('/send/finished/:trainingPlanId/:userId')
  async updateStatusToFinished(
    @Param('trainingPlanId') trainingPlanId: string,
    @Param('userId') userId: string
  ) {
    return await this.planSubscriptionManagementService.updateStatusToFinished(
      trainingPlanId,
      userId
    );
  }

  @Put('/send/canceled/:trainingPlanId/:userId')
  async updateStatusToCanceled(
    @Param('trainingPlanId') trainingPlanId: string,
    @Param('userId') userId: string
  ) {
    return await this.planSubscriptionManagementService.updateStatusToCanceled(
      trainingPlanId,
      userId
    );
  }
}
