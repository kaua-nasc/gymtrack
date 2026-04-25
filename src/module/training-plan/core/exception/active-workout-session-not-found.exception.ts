import { DomainException } from '@src/module/shared/core/exception/domain.exception';

export class ActiveWorkoutSessionNotFoundException extends DomainException {
  constructor() {
    super('No active workout session was found for this user.');
  }
}
