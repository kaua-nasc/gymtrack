import { DomainException } from '@src/module/shared/core/exception/domain.exception';

export class NotFoundDomainException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
