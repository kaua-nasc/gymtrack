export interface TrainingPlanExistsApi {
  traningPlanExists(trainingPlanId: string): Promise<boolean>;
}

export const TrainingPlanExistsApi = Symbol('TrainingPlanExistsApi');
