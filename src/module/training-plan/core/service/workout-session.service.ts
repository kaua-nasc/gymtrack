import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { UserType } from '@src/module/identity/core/enum/user-type.enum';
import { DomainException } from '@src/module/shared/core/exception/domain.exception';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import { LogWorkoutSetRequestDto } from '../../http/rest/dto/request/log-workout-set-request.dto';
import { StartWorkoutSessionRequestDto } from '../../http/rest/dto/request/start-workout-session-request.dto';
import { ActiveSetLog } from '../../persistence/entity/active-set-log.entity';
import { ActiveWorkoutSession } from '../../persistence/entity/active-workout-session.entity';
import { ExerciseLog } from '../../persistence/entity/exercise-log.entity';
import { PlanDayProgress } from '../../persistence/entity/plan-day-progress.entity';
import { ActiveWorkoutSessionRepository } from '../../persistence/repository/active-workout-session.repository';
import { PlanSubscriptionRepository } from '../../persistence/repository/plan-subscription.repository';
import { PlanDayProgressStatus } from '../enum/plan-day-progress-status.enum';
import { PlanSubscriptionStatus } from '../enum/plan-subscription-status.enum';
import { ActiveWorkoutSessionNotFoundException } from '../exception/active-workout-session-not-found.exception';
import { DayNotFoundException } from '../exception/day-not-found.exception';

@Injectable({ scope: Scope.REQUEST })
export class WorkoutSessionService {
  constructor(
    private readonly activeWorkoutSessionRepository: ActiveWorkoutSessionRepository,
    private readonly planSubscriptionRepository: PlanSubscriptionRepository,
    private readonly logger: AppLogger,
    @Inject(REQUEST) private readonly request: { user: { id: string; type: UserType } }
  ) {}

  async startSession(dto: StartWorkoutSessionRequestDto): Promise<ActiveWorkoutSession> {
    const { id: userId } = this.request.user;
    const { dayId } = dto;

    this.logger.log(`Starting workout session for user ${userId}, day ${dayId}`);

    const activeSession =
      await this.activeWorkoutSessionRepository.findActiveSessionByUserId(userId);
    if (activeSession) {
      return activeSession;
    }

    const subscription = await this.planSubscriptionRepository.find({
      where: { userId },
      relations: { trainingPlan: { days: { exercises: true } } },
    });

    if (!subscription) {
      throw new DomainException('User is not subscribed to this training plan');
    }

    const day = subscription.trainingPlan.days.find((d) => d.id === dayId);
    if (!day) {
      throw new DayNotFoundException(dayId);
    }

    if (subscription.status !== PlanSubscriptionStatus.inProgress) {
      await this.planSubscriptionRepository.update(
        { id: subscription.id },
        { status: PlanSubscriptionStatus.inProgress }
      );
    }

    const firstExerciseId = day.exercises?.[0]?.id;

    const progress = await this.activeWorkoutSessionRepository.manager.save(
      new PlanDayProgress({
        planSubscriptionId: subscription.id,
        dayId,
        status: PlanDayProgressStatus.IN_PROGRESS,
      })
    );

    const session = new ActiveWorkoutSession({
      userId,
      planDayProgressId: progress.id,
      currentExerciseId: firstExerciseId,
      currentSetIndex: 0,
      startedAt: new Date(),
    });

    return await this.activeWorkoutSessionRepository.save(session);
  }

  async getActiveSession(): Promise<ActiveWorkoutSession> {
    const { id: userId } = this.request.user;
    const session =
      await this.activeWorkoutSessionRepository.findActiveSessionByUserId(userId);
    if (!session) {
      throw new ActiveWorkoutSessionNotFoundException();
    }
    return session;
  }

  async logSet(dto: LogWorkoutSetRequestDto): Promise<ActiveWorkoutSession> {
    const { id: userId } = this.request.user;
    const session =
      await this.activeWorkoutSessionRepository.findActiveSessionByUserId(userId);
    if (!session) {
      throw new ActiveWorkoutSessionNotFoundException();
    }

    const exerciseLogs =
      session.logs?.filter((l) => l.exerciseId === dto.exerciseId) ?? [];
    const setIndex = exerciseLogs.length;

    const setLog = new ActiveSetLog({
      sessionId: session.id,
      exerciseId: dto.exerciseId,
      reps: dto.reps,
      weight: dto.weight,
      rpe: dto.rpe,
      setIndex,
    });

    await this.activeWorkoutSessionRepository.manager.save(ActiveSetLog, setLog);

    let adaptiveRest = 60;
    if (dto.rpe) {
      if (dto.rpe >= 10) adaptiveRest = 180;
      else if (dto.rpe >= 9) adaptiveRest = 120;
      else if (dto.rpe >= 8) adaptiveRest = 90;
    }

    await this.activeWorkoutSessionRepository.update(
      { id: session.id },
      {
        currentExerciseId: dto.exerciseId,
        currentSetIndex: setIndex + 1,
        adaptiveRestDurationSeconds: adaptiveRest,
        restStartedAt: new Date(),
        lastActiveAt: new Date(),
      }
    );

    const updatedSession =
      await this.activeWorkoutSessionRepository.findActiveSessionByUserId(userId);
    return updatedSession!;
  }

  async finishSession(): Promise<void> {
    const { id: userId } = this.request.user;
    const session =
      await this.activeWorkoutSessionRepository.findActiveSessionByUserId(userId);
    if (!session) {
      throw new ActiveWorkoutSessionNotFoundException();
    }

    await this.activeWorkoutSessionRepository.manager.transaction(async (manager) => {
      // Group logs by exerciseId
      const exerciseLogsMap = new Map<string, { reps: number[]; weight: number[] }>();

      for (const log of session.logs ?? []) {
        if (!exerciseLogsMap.has(log.exerciseId)) {
          exerciseLogsMap.set(log.exerciseId, { reps: [], weight: [] });
        }
        const data = exerciseLogsMap.get(log.exerciseId)!;
        data.reps.push(log.reps);
        data.weight.push(log.weight);
      }

      // Save ExerciseLogs
      for (const [exerciseId, data] of exerciseLogsMap.entries()) {
        const exerciseLog = new ExerciseLog({
          userId,
          exerciseId,
          reps: data.reps,
          weight: data.weight,
        });
        await manager.save(ExerciseLog, exerciseLog);
      }

      await manager.update(
        PlanDayProgress,
        { id: session.planDayProgressId },
        { status: PlanDayProgressStatus.COMPLETED }
      );

      await manager.delete(ActiveWorkoutSession, { id: session.id });
    });

    this.logger.log(
      `Workout session ${session.id} finished (and converted to exercise logs)`
    );
  }

  async cancelSession(): Promise<void> {
    const { id: userId } = this.request.user;
    const session =
      await this.activeWorkoutSessionRepository.findActiveSessionByUserId(userId);
    if (!session) {
      throw new ActiveWorkoutSessionNotFoundException();
    }

    await this.activeWorkoutSessionRepository.manager.transaction(async (manager) => {
      await manager.update(
        PlanDayProgress,
        { id: session.planDayProgressId },
        { status: PlanDayProgressStatus.CANCELLED }
      );

      await manager.delete(ActiveWorkoutSession, { id: session.id });
    });

    this.logger.log(`Workout session ${session.id} cancelled`);
  }
}
