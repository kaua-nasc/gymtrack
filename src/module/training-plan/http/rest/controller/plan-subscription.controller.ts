import { Controller, Delete, Param, Post } from '@nestjs/common';
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
}
