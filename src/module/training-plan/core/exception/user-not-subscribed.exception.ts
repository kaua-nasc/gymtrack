import { DomainException } from '@src/module/shared/core/exception/domain.exception';

export class UserNotSubscribedException extends DomainException {
  constructor(userId: string, planId: string) {
    super(`User '${userId}' is not subscribed to training plan '${planId}'.`);
  }
}
