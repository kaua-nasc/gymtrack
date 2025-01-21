export enum BillingApiSubscriptionStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
}

export class BillingApiSubscriptionStatusResponseDto {
  readonly id: string;
  readonly status: BillingApiSubscriptionStatus;
}
