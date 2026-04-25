import { DomainException } from '@src/module/shared/core/exception/domain.exception';

export class TokenMismatchException extends DomainException {
  constructor() {
    super('The provided token does not match or is invalid.');
  }
}
