export enum TrainingPlanApiSubscriptionStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
}

export class TrainingPlanApiSubscriptionStatusResponseDto {
  readonly id: string;
  readonly status: TrainingPlanApiSubscriptionStatus;
}
