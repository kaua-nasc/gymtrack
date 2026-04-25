import { DomainException } from '@src/module/shared/core/exception/domain.exception';

export class InvalidCredentialsException extends DomainException {
  constructor() {
    super('Invalid credentials provided.');
  }
}
