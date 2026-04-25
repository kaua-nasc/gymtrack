import { DomainException } from '@src/module/shared/core/exception/domain.exception';

export class EmailAlreadyInUseException extends DomainException {
  constructor(email: string) {
    super(`The email '${email}' is already in use.`);
  }
}
