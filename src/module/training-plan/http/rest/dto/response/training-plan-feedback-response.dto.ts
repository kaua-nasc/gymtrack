export class TrainingPlanFeedbackDataResponseDto {
  trainingPlanId: string;

  userId: string;

  rating: number;

  message: string | undefined;
}

export class TrainingPlanFeedbackResponseDto {
  data: TrainingPlanFeedbackDataResponseDto[];
  nextCursor: string | null;
  hasNextPage: boolean;
}
