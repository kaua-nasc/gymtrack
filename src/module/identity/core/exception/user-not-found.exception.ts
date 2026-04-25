import { DomainException } from '@src/module/shared/core/exception/domain.exception';

export class UserNotFoundException extends DomainException {
  constructor(identifier: string) {
    super(`User with identifier '${identifier}' was not found.`);
  }
}
