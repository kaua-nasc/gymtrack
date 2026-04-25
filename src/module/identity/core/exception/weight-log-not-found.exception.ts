import { DomainException } from '@src/module/shared/core/exception/domain.exception';

export class WeightLogNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Weight log with ID '${id}' was not found.`);
  }
}
