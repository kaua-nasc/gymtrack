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

@Injectable()
export class TrainingPlanManagementService {
  constructor(
    private readonly trainingPlanRepository: TrainingPlanRepository,
    private readonly trainingPlanFeedbackRepository: TrainingPlanFeedbackRepository,
    @Inject(IdentityUserExistsApi)
    private readonly identityUserServiceClient: IdentityUserExistsApi
  ) {}

  async traningPlanExists(trainingPlanId: string) {
    return await this.trainingPlanRepository.traningPlanExists(trainingPlanId);
  }

  async create(trainingPlanData: CreateTrainingPlanRequestDto) {
    if (!(await this.identityUserServiceClient.userExists(trainingPlanData.authorId))) {
      throw new NotFoundException('user not found');
    }

    const trainingPlan = await this.trainingPlanRepository.saveTrainingPlan(
      new TrainingPlan({ ...trainingPlanData })
    );

    return {
      id: trainingPlan.id,
      authorId: trainingPlan.authorId,
      name: trainingPlan.name,
    };
  }

  async delete(id: string) {
    const exists = await this.exists(id);
    if (!exists) throw new NotFoundException(`training plan with id ${id} not found`);

    return await this.trainingPlanRepository.deleteTrainingPlan(id);
  }

  async get(id: string) {
    const trainingPlan = await this.trainingPlanRepository.find({
      where: { id },
      relations: { days: { exercises: true } },
    });

    if (!trainingPlan) throw new NotFoundException();

    return { ...trainingPlan };
  }

  async exists(id: string) {
    const trainingPlan = await this.trainingPlanRepository.find({
      where: { id },
    });

    return trainingPlan ? true : false;
  }

  async list() {
    const plans = await this.trainingPlanRepository.findMany({});
    return plans ?? [];
  }

  async listByUserId(userId: string) {
    return await this.trainingPlanRepository.findTrainingPlansByAuthorId(userId);
  }

  async listAll() {
    return await this.trainingPlanRepository.findTrainingPlans();
  }

  async giveFeedback(newFeedback: {
    trainingPlanId: string;
    userId: string;
    rating: number;
    message: string | undefined;
  }) {
    const trainingPlan = await this.trainingPlanRepository.findOneById(
      newFeedback.trainingPlanId
    );

    if (!trainingPlan) {
      throw new NotFoundException('training plan not found');
    }

    if (trainingPlan?.authorId === newFeedback.userId) {
      throw new BadRequestException(
        'training plan author cannot give feedback to your training plan'
      );
    }

    if (!(await this.identityUserServiceClient.userExists(newFeedback.userId))) {
      throw new NotFoundException('user not found');
    }

    const feedback = new TrainingPlanFeedback({
      userId: newFeedback.userId,
      trainingPlanId: newFeedback.trainingPlanId,
      rating: newFeedback.rating,
      message: newFeedback.message,
    });

    await this.trainingPlanFeedbackRepository.save(feedback);
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
      message: string | undefined;
    }[];
    nextCursor: string | null;
    hasNextPage: boolean;
  }> {
    const trainingPlan = await this.trainingPlanRepository.findOneById(trainingPlanId);
    if (!trainingPlan) {
      throw new NotFoundException('training plan not found');
    }

    const { data: feedbacks, nextCursor } =
      await this.trainingPlanFeedbackRepository.findManyWithCursor(
        { trainingPlanId: trainingPlan.id },
        limit,
        lastCursor,
        'createdAt'
      );

    return {
      data: feedbacks ?? [],
      nextCursor,
      hasNextPage: !!nextCursor,
    };
  }
}
