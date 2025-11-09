import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TrainingPlanRepository } from '@src/module/training-plan/persistence/repository/training-plan.repository';
import { CreateTrainingPlanRequestDto } from '../../http/rest/dto/request/create-training-plan-request.dto';
import { TrainingPlan } from '../../persistence/entity/training-plan.entity';
import { IdentityUserExistsApi } from '@src/module/shared/module/integration/interface/identity-integration.interface';
import { TrainingPlanFeedbackRepository } from '../../persistence/repository/training-plan-feedback.repository';
import { TrainingPlanFeedback } from '../../persistence/entity/training-plan-feedback.entity';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import { AzureStorageService } from '@src/module/shared/module/storage/service/azure-storage.service';
import { FilePath } from '@src/module/shared/module/storage/enum/file-path.enum';

@Injectable()
export class TrainingPlanManagementService {
  constructor(
    private readonly trainingPlanRepository: TrainingPlanRepository,
    private readonly trainingPlanFeedbackRepository: TrainingPlanFeedbackRepository,
    @Inject(IdentityUserExistsApi)
    private readonly identityUserServiceClient: IdentityUserExistsApi,
    private readonly logger: AppLogger,
    private readonly storageService: AzureStorageService
  ) {}

  async traningPlanExists(trainingPlanId: string) {
    this.logger.log('Checking if training plan exists', { trainingPlanId });
    return await this.trainingPlanRepository.traningPlanExists(trainingPlanId);
  }

  async create(trainingPlanData: CreateTrainingPlanRequestDto) {
    this.logger.log('Creating new training plan', {
      authorId: trainingPlanData.authorId,
    });
    if (!(await this.identityUserServiceClient.userExists(trainingPlanData.authorId))) {
      this.logger.warn('User not found when creating training plan', {
        authorId: trainingPlanData.authorId,
      });
      throw new NotFoundException('user not found');
    }

    const trainingPlan = await this.trainingPlanRepository.save(
      new TrainingPlan({ ...trainingPlanData })
    );

    this.logger.log('Training plan created successfully', {
      trainingPlanId: trainingPlan.id,
      authorId: trainingPlan.authorId,
      name: trainingPlan.name,
    });

    return {
      id: trainingPlan.id,
      authorId: trainingPlan.authorId,
      name: trainingPlan.name,
    };
  }

  async delete(id: string) {
    this.logger.log('Deleting training plan', { trainingPlanId: id });

    const exists = await this.exists(id);
    if (!exists) {
      this.logger.warn('Attempt to delete non-existing training plan', {
        trainingPlanId: id,
      });
      throw new NotFoundException(`training plan with id ${id} not found`);
    }

    await this.trainingPlanRepository.deleteTrainingPlan(id);
    this.logger.log('Training plan deleted successfully', { trainingPlanId: id });
  }

  async get(id: string) {
    this.logger.log('Fetching training plan details', { trainingPlanId: id });
    const trainingPlan = await this.trainingPlanRepository.find({
      where: { id },
      relations: { days: { exercises: true } },
    });

    if (!trainingPlan) {
      this.logger.warn('Training plan not found', { trainingPlanId: id });
      throw new NotFoundException();
    }

    this.logger.log('Training plan fetched successfully', { trainingPlanId: id });
    return { ...trainingPlan };
  }

  async exists(id: string) {
    const trainingPlan = await this.trainingPlanRepository.find({
      where: { id },
    });

    const exists = !!trainingPlan;
    this.logger.log('Checked if training plan exists', { trainingPlanId: id, exists });

    return exists;
  }

  async list() {
    this.logger.log('Listing all training plans');

    const plans = await this.trainingPlanRepository.findMany({});
    this.logger.log('Training plans listed', { count: plans?.length ?? 0 });

    return plans ?? [];
  }

  async listByUserId(userId: string) {
    this.logger.log('Listing training plans by user ID', { userId });
    const plans = await this.trainingPlanRepository.findTrainingPlansByAuthorId(userId);
    this.logger.log('Training plans listed by user ID', {
      userId,
      count: plans?.length ?? 0,
    });
    return plans;
  }

  async listAll() {
    this.logger.log('Listing all training plans (with relations)');
    const plans = await this.trainingPlanRepository.findTrainingPlans();
    this.logger.log('Training plans fully listed', { count: plans?.length ?? 0 });
    return plans;
  }

  async giveFeedback(newFeedback: {
    trainingPlanId: string;
    userId: string;
    rating: number;
    message: string | null;
  }) {
    this.logger.log('Giving feedback to training plan', {
      trainingPlanId: newFeedback.trainingPlanId,
      userId: newFeedback.userId,
      rating: newFeedback.rating,
    });

    const trainingPlan = await this.trainingPlanRepository.findOneById(
      newFeedback.trainingPlanId
    );

    if (!trainingPlan) {
      this.logger.warn('Feedback failed: training plan not found', {
        trainingPlanId: newFeedback.trainingPlanId,
      });
      throw new NotFoundException('training plan not found');
    }

    if (trainingPlan?.authorId === newFeedback.userId) {
      this.logger.warn('Training plan author attempted to give feedback to own plan', {
        trainingPlanId: newFeedback.trainingPlanId,
        userId: newFeedback.userId,
      });
      throw new BadRequestException(
        'training plan author cannot give feedback to your training plan'
      );
    }

    if (!(await this.identityUserServiceClient.userExists(newFeedback.userId))) {
      this.logger.warn('Feedback failed: user not found', { userId: newFeedback.userId });
      throw new NotFoundException('user not found');
    }

    const feedback = new TrainingPlanFeedback({
      userId: newFeedback.userId,
      trainingPlanId: newFeedback.trainingPlanId,
      rating: newFeedback.rating,
      message: newFeedback.message,
    });

    await this.trainingPlanFeedbackRepository.save(feedback);
    this.logger.log('Feedback saved successfully', {
      trainingPlanId: newFeedback.trainingPlanId,
      userId: newFeedback.userId,
    });
  }

  async getFeedbacks(
    trainingPlanId: string,
    limit: number,
    lastCursor?: string
  ): Promise<{
    data: {
      trainingPlanId: string;
      userId: string;
      rating: number;
      message: string | null;
    }[];
    nextCursor: string | null;
    hasNextPage: boolean;
  }> {
    this.logger.log('Fetching feedbacks for training plan', {
      trainingPlanId,
      limit,
      lastCursor,
    });

    const trainingPlan = await this.trainingPlanRepository.findOneById(trainingPlanId);
    if (!trainingPlan) {
      this.logger.warn('Attempted to fetch feedbacks for non-existing plan', {
        trainingPlanId,
      });
      throw new NotFoundException('training plan not found');
    }

    const { data: feedbacks, nextCursor } =
      await this.trainingPlanFeedbackRepository.findManyWithCursor(
        { trainingPlanId: trainingPlan.id },
        limit,
        lastCursor,
        'createdAt'
      );

    this.logger.log('Feedbacks fetched successfully', {
      trainingPlanId,
      feedbackCount: feedbacks?.length ?? 0,
      hasNextPage: !!nextCursor,
    });

    return {
      data:
        feedbacks.map((f) => ({
          ...f,
        })) ?? [],
      nextCursor,
      hasNextPage: !!nextCursor,
    };
  }

  async addImage(trainingPlanId: string, file: Buffer) {
    this.logger.log(`Attempting to add image for training plan: ${trainingPlanId}`);
    const trainingPlan = await this.trainingPlanRepository.findOneById(trainingPlanId);
    if (!trainingPlan) {
      this.logger.warn(`Add image failed: Training plan not found: ${trainingPlanId}`);
      throw new NotFoundException('training plan not exists');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${FilePath.trainingPlan}/training-plan-${trainingPlan.id}_${timestamp}.png`;

    this.logger.log(`Uploading new image for plan ${trainingPlanId} to: ${filename}`);
    await this.storageService.upload(filename, file);

    if (trainingPlan.imageUrl) {
      this.logger.log(
        `Deleting old image ${trainingPlan.imageUrl} for plan ${trainingPlanId}`
      );
      await this.storageService.delete(trainingPlan.imageUrl);
    }

    await this.trainingPlanRepository.update(
      { id: trainingPlan.id },
      { imageUrl: filename }
    );
    this.logger.log(
      `Successfully added/updated image for plan ${trainingPlanId}. New file: ${filename}`
    );
  }
}
