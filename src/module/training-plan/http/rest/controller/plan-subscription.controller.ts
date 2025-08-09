import { Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { PlanSubscriptionManagementService } from '@src/module/training-plan/core/service/plan-subscription-management.service';

@Controller('training-plan/subscription')
export class PlanSubscriptionController {
  constructor(
    private readonly planSubscriptionManagementService: PlanSubscriptionManagementService
  ) {}

  @Get('/:userId')
  async getInProgressSubscription(@Param('userId') userId: string) {
    return await this.planSubscriptionManagementService.getInProgressSubscription(userId);
  }

  @Get('/list/:userId')
  async getSubscriptions(@Param('userId') userId: string) {
    return await this.planSubscriptionManagementService.getSubscriptions(userId);
  }

  @Get('/exists/:trainingPlanId/:userId')
  async exists(
    @Param('trainingPlanId') trainingPlanId: string,
    @Param('userId') userId: string
  ) {
    return await this.planSubscriptionManagementService.exists(trainingPlanId, userId);
  }

  @Get('/exists/in-progress/:trainingPlanId/:userId')
  async existsInProgress(
    @Param('trainingPlanId') trainingPlanId: string,
    @Param('userId') userId: string
  ) {
    return await this.planSubscriptionManagementService.existsInProgress(
      trainingPlanId,
      userId
    );
  }

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

  @Put('/send/not-started/:trainingPlanId/:userId')
  async updateStatusToNotStarted(
    @Param('trainingPlanId') trainingPlanId: string,
    @Param('userId') userId: string
  ) {
    return await this.planSubscriptionManagementService.updateStatusToNotStarted(
      trainingPlanId,
      userId
    );
  }

  @Post('add/day/progress/:planSubscriptionId/:dayId')
  async createDayProgress(
    @Param('planSubscriptionId') planSubscriptionId: string,
    @Param('dayId') dayId: string
  ) {
    return await this.planSubscriptionManagementService.createDayProgress(
      planSubscriptionId,
      dayId
    );
  }

  @Get('get/day/progress/:userId')
  async getDaysProgress(@Param('userId') userId: string) {
    return await this.planSubscriptionManagementService.getDaysProgress(userId);
  }
}
