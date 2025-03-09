export interface TrainingPlanExistsApi {
  traningPlanExists(trainingPlanId: string): Promise<boolean>;
}

export const TrainingPlanExistsApi = Symbol('TrainingPlanExistsApi');

export interface TrainingPlanCompleteApi {
  completeTrainingPlan(
    userId: string,
    trainingPlanId: string
  ): Promise<{ status: boolean }>;
}

export const TrainingPlanCompleteApi = Symbol('TrainingPlanCompleteApi');

export interface TrainingPlanUpdateToInProgressApi {
  updateToInProgressTrainingPlan(
    userId: string,
    trainingPlanId: string
  ): Promise<{ status: boolean }>;
}

export const TrainingPlanUpdateToInProgressApi = Symbol(
  'TrainingPlanUpdateToInProgressApi'
);
