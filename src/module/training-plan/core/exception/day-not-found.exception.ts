import { DomainException } from '@src/module/shared/core/exception/domain.exception';

export class DayNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Training day with ID '${id}' was not found.`);
  }
}
