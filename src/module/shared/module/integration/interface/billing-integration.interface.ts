export interface BillingSubscriptionStatusApi {
  isUserSubscriptionActive(userId: string): Promise<boolean>;
}

export const BillingSubscriptionStatusApi = Symbol('BillingSubscriptionStatusApi');

export interface BillingSubscriptionPlanTrainingPlanQuantityApi {
  subscriptionPlanTrainingPlanQuantity(userId: string): Promise<number>;
}

export const BillingSubscriptionPlanTrainingPlanQuantityApi = Symbol(
  'BillingSubscriptionPlanTrainingPlanQuantityStatusApi'
);
