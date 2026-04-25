import { DomainException } from '@src/module/shared/core/exception/domain.exception';

export class ResourceAlreadyExistsException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
