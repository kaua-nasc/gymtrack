import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import { DataSource } from 'typeorm';
import { ActiveWorkoutSession } from '../../persistence/entity/active-workout-session.entity';
import { ActiveSetLog } from '../../persistence/entity/active-set-log.entity';
import { ExerciseLog } from '../../persistence/entity/exercise-log.entity';
import { PlanDayProgress } from '../../persistence/entity/plan-day-progress.entity';
import { ActiveWorkoutSessionRepository } from '../../persistence/repository/active-workout-session.repository';
import { ActiveSetLogRepository } from '../../persistence/repository/active-set-log.repository';
import { DayRepository } from '../../persistence/repository/day.repository';
import { PlanSubscriptionRepository } from '../../persistence/repository/plan-subscription.repository';
import { StartWorkoutSessionRequestDto } from '../../http/rest/dto/request/start-workout-session-request.dto';
import { LogWorkoutSetRequestDto } from '../../http/rest/dto/request/log-workout-set-request.dto';

@Injectable()
export class WorkoutSessionService {
  constructor(
    private readonly activeSessionRepository: ActiveWorkoutSessionRepository,
    private readonly activeSetLogRepository: ActiveSetLogRepository,
    private readonly dayRepository: DayRepository,
    private readonly planSubscriptionRepository: PlanSubscriptionRepository,
    @InjectDataSource('training-plan') private readonly dataSource: DataSource,
    private readonly logger: AppLogger,
    @Inject(REQUEST) private readonly request: { user: { id: string } }
  ) {}

  async startSession(dto: StartWorkoutSessionRequestDto): Promise<ActiveWorkoutSession> {
    const userId = this.request.user.id;
    this.logger.log(`User ${userId} attempting to start workout session for day ${dto.dayId}`);

    const activeSession = await this.activeSessionRepository.findActiveSessionByUserId(userId);
    if (activeSession) {
      this.logger.log(`User ${userId} already has an active session: ${activeSession.id}`);
      return activeSession;
    }

    const day = await this.dayRepository.findDayById(dto.dayId, true);
    if (!day) {
      throw new NotFoundException('Day not found');
    }

    const subscriptions = await this.planSubscriptionRepository.getUserSubscriptionForPlan(
      userId,
      [day.trainingPlanId]
    );

    if (!subscriptions || subscriptions.length === 0) {
      throw new BadRequestException('User is not subscribed to this training plan');
    }

    const subscription = subscriptions[0];

    return await this.dataSource.transaction(async (manager) => {
      // Find or create PlanDayProgress for today
      // For simplicity, we create a new one each time they start a session if one doesn't exist for today
      // In a real app, we'd check if they already have one for today
      let progress = await manager.findOne(PlanDayProgress, {
        where: {
          planSubscriptionId: subscription.id,
          dayId: day.id,
        },
        order: { createdAt: 'DESC' },
      });

      // If progress exists but was created more than 12 hours ago, create a new one
      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
      if (!progress || progress.createdAt < twelveHoursAgo) {
        progress = new PlanDayProgress({
          planSubscriptionId: subscription.id,
          dayId: day.id,
        });
        progress = await manager.save(PlanDayProgress, progress);
      }

      const firstExerciseId = day.exercises && day.exercises.length > 0 
        ? day.exercises[0].id 
        : undefined;

      const session = new ActiveWorkoutSession({
        userId,
        planDayProgressId: progress.id,
        currentExerciseId: firstExerciseId,
        currentSetIndex: 0,
        startedAt: new Date(),
        lastActiveAt: new Date(),
      });

      const savedSession = await manager.save(ActiveWorkoutSession, session);
      this.logger.log(`Successfully started workout session ${savedSession.id} for user ${userId}`);
      return savedSession;
    });
  }

  async getActiveSession(): Promise<ActiveWorkoutSession> {
    const userId = this.request.user.id;
    const session = await this.activeSessionRepository.findActiveSessionByUserId(userId);
    if (!session) {
      throw new NotFoundException('No active workout session found');
    }
    return session;
  }

  async logSet(dto: LogWorkoutSetRequestDto): Promise<ActiveWorkoutSession> {
    const userId = this.request.user.id;
    const session = await this.activeSessionRepository.findActiveSessionByUserId(userId);
    if (!session) {
      throw new NotFoundException('No active workout session found');
    }

    return await this.dataSource.transaction(async (manager) => {
      const log = new ActiveSetLog({
        sessionId: session.id,
        exerciseId: dto.exerciseId,
        setIndex: session.currentSetIndex,
        reps: dto.reps,
        weight: dto.weight,
        rpe: dto.rpe,
      });

      await manager.save(ActiveSetLog, log);

      // Update session state
      const updateData = {
        currentExerciseId: dto.exerciseId,
        currentSetIndex: session.currentSetIndex + 1,
        restStartedAt: new Date(),
        adaptiveRestDurationSeconds: this.calculateAdaptiveRest(dto.rpe),
        lastActiveAt: new Date(),
      };

      await manager.update(ActiveWorkoutSession, session.id, updateData);
      
      this.logger.log(`Logged set for user ${userId} in session ${session.id}`);
      
      // Return updated session
      return Object.assign(session, updateData);
    });
  }

  async finishSession(): Promise<void> {
    const userId = this.request.user.id;
    const session = await this.activeSessionRepository.findActiveSessionByUserId(userId);
    if (!session) {
      throw new NotFoundException('No active workout session found');
    }

    const logs = await this.activeSetLogRepository.findLogsBySessionId(session.id);
    if (!logs || logs.length === 0) {
      // If no logs, just delete the session
      await this.activeSessionRepository.delete({ id: session.id });
      return;
    }

    return await this.dataSource.transaction(async (manager) => {
      // Group logs by exerciseId
      const groupedLogs = logs.reduce((acc, log) => {
        if (!acc[log.exerciseId]) {
          acc[log.exerciseId] = {
            reps: [],
            weight: [],
          };
        }
        acc[log.exerciseId].reps.push(log.reps);
        acc[log.exerciseId].weight.push(Number(log.weight));
        return acc;
      }, {} as Record<string, { reps: number[]; weight: number[] }>);

      // Create permanent ExerciseLog entries
      for (const [exerciseId, data] of Object.entries(groupedLogs)) {
        const exerciseLog = new ExerciseLog({
          userId,
          exerciseId,
          reps: data.reps,
          weight: data.weight,
        });
        await manager.save(ExerciseLog, exerciseLog);
      }

      // Delete active session and logs (cascade will handle logs)
      await manager.delete(ActiveWorkoutSession, { id: session.id });
      this.logger.log(`Finished workout session ${session.id} for user ${userId}`);
    });
  }

  private calculateAdaptiveRest(rpe?: number): number {
    if (!rpe || rpe <= 6) return 60;
    if (rpe <= 8) return 90;
    return 120;
  }
}
