import { DomainException } from '@src/module/shared/core/exception/domain.exception';

export class BodyMeasurementNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Body measurement with ID '${id}' was not found.`);
  }
}
