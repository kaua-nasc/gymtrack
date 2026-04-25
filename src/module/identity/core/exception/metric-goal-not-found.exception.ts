import { DomainException } from '@src/module/shared/core/exception/domain.exception';

export class MetricGoalNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Metric goal with ID '${id}' was not found.`);
  }
}
