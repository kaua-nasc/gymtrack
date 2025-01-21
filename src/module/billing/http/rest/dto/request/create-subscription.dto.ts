import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateSubscriptionRequestDto {
  @IsUUID(4)
  @IsNotEmpty()
  readonly planId: string;
}
