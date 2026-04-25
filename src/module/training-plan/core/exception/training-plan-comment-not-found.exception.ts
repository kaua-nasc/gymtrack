import { DomainException } from '@src/module/shared/core/exception/domain.exception';

export class TrainingPlanCommentNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Training plan comment with ID '${id}' was not found.`);
  }
}
