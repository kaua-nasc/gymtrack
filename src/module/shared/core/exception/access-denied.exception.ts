import { DomainException } from '@src/module/shared/core/exception/domain.exception';

export class AccessDeniedException extends DomainException {
  constructor(message = 'Access denied') {
    super(message);
  }
}
