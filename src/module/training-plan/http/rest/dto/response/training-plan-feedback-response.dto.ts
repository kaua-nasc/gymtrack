export class TrainingPlanFeedbackDataResponseDto {
  trainingPlanId: string;

  userId: string;

  rating: number;

  message: string | null;
}

export class TrainingPlanFeedbackResponseDto {
  data: TrainingPlanFeedbackDataResponseDto[];
  nextCursor: string | null;
  hasNextPage: boolean;
}
