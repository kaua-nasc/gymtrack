import { DomainException } from '@src/module/shared/core/exception/domain.exception';

export class PlanSubscriptionNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Plan subscription with ID '${id}' was not found.`);
  }
}
