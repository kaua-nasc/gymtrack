import { DomainException } from '@src/module/shared/core/exception/domain.exception';

export class UnauthorizedDomainException extends DomainException {
  constructor(message = 'Unauthorized') {
    super(message);
  }
}
