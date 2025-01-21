import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserManagementService } from '@src/module/identity/core/service/user-management.service';

@Injectable()
export class UserTrainingAssociatedEventHandler {
  constructor(private readonly userManagementService: UserManagementService) {}

  @OnEvent('user.associated.training.plan')
  async handlerContentProcessedEvent() {}
}
