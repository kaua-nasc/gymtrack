import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { DomainException } from '@src/module/shared/core/exception/domain.exception';
import { UserNotFoundException } from '@src/module/identity/core/exception/user-not-found.exception';
import { EmailAlreadyInUseException } from '@src/module/identity/core/exception/email-already-in-use.exception';
import { InvalidCredentialsException } from '@src/module/identity/core/exception/invalid-credentials.exception';
import { MetricGoalNotFoundException } from '@src/module/identity/core/exception/metric-goal-not-found.exception';
import { WeightLogNotFoundException } from '@src/module/identity/core/exception/weight-log-not-found.exception';
import { BodyMeasurementNotFoundException } from '@src/module/identity/core/exception/body-measurement-not-found.exception';
import { TokenMismatchException } from '@src/module/identity/core/exception/token-mismatch.exception';
import { TrainingPlanNotFoundException } from '@src/module/training-plan/core/exception/training-plan-not-found.exception';
import { TrainingPlanCommentNotFoundException } from '@src/module/training-plan/core/exception/training-plan-comment-not-found.exception';
import { PlanSubscriptionNotFoundException } from '@src/module/training-plan/core/exception/plan-subscription-not-found.exception';
import { DayNotFoundException } from '@src/module/training-plan/core/exception/day-not-found.exception';
import { ActiveWorkoutSessionNotFoundException } from '@src/module/training-plan/core/exception/active-workout-session-not-found.exception';
import { AccessDeniedException } from '@src/module/shared/core/exception/access-denied.exception';
import { ResourceAlreadyExistsException } from '@src/module/shared/core/exception/resource-already-exists.exception';
import { UnauthorizedDomainException } from '@src/module/shared/core/exception/unauthorized.exception';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalHttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else if (exception instanceof DomainException) {
      status = this.mapDomainExceptionToStatus(exception);
      message = exception.message;
    } else {
      this.logger.error(
        `Unhandled exception: ${exception instanceof Error ? exception.stack : exception}`,
      );
    }

    const responseBody = {
      statusCode: status,
      message:
        typeof message === 'string'
          ? message
          : (message as Record<string, unknown>).message || message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(responseBody);
  }

  private mapDomainExceptionToStatus(exception: DomainException): HttpStatus {
    if (
      exception instanceof UserNotFoundException ||
      exception instanceof MetricGoalNotFoundException ||
      exception instanceof WeightLogNotFoundException ||
      exception instanceof BodyMeasurementNotFoundException ||
      exception instanceof TrainingPlanNotFoundException ||
      exception instanceof TrainingPlanCommentNotFoundException ||
      exception instanceof PlanSubscriptionNotFoundException ||
      exception instanceof DayNotFoundException ||
      exception instanceof ActiveWorkoutSessionNotFoundException
    ) {
      return HttpStatus.NOT_FOUND;
    }

    if (
      exception instanceof EmailAlreadyInUseException ||
      exception instanceof ResourceAlreadyExistsException ||
      exception.message.toLowerCase().includes('already in use')
    ) {
      return HttpStatus.CONFLICT;
    }

    if (exception instanceof AccessDeniedException || 
        exception.message.toLowerCase().includes('not authorized')) {
      return HttpStatus.FORBIDDEN;
    }

    if (
      exception instanceof InvalidCredentialsException ||
      exception instanceof TokenMismatchException ||
      exception instanceof UnauthorizedDomainException ||
      exception.message.toLowerCase().includes('not found')
    ) {
        if (exception.message.toLowerCase().includes('user not found')) {
            return HttpStatus.NOT_FOUND;
        }
      return HttpStatus.UNAUTHORIZED;
    }

    return HttpStatus.BAD_REQUEST;
  }
}
