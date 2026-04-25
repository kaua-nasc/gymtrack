import { DomainException } from '@src/module/shared/core/exception/domain.exception';

export class TrainingPlanNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Training plan with ID '${id}' was not found.`);
  }
}
