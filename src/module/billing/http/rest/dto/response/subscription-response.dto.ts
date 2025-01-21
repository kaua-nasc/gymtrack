import { Expose, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { DefaultResponseDto } from './default-response.dto';
import { SubscriptionStatus } from '@src/module/billing/core/model/subscription.model';

class PlanResponseDto {
  @IsString()
  @Expose()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @Expose()
  @IsNotEmpty()
  readonly description?: string;

  @IsNumber()
  @Expose()
  @IsNotEmpty()
  readonly amount: number;

  @IsString()
  @Expose()
  @IsNotEmpty()
  readonly currency: string;

  @IsString()
  @Expose()
  @IsNotEmpty()
  readonly interval: string;

  @IsNumber()
  @Expose()
  @IsOptional()
  readonly trialPeriod: number | null;
}

export class SubscriptionResponseDto extends DefaultResponseDto {
  @IsUUID(4)
  @Expose()
  @IsNotEmpty()
  readonly userId: string;

  @IsUUID(4)
  @Expose()
  @IsNotEmpty()
  readonly planId: string;

  @IsEnum(SubscriptionStatus)
  @Expose()
  @IsNotEmpty()
  readonly status: SubscriptionStatus;

  @IsDateString()
  @Expose()
  @IsNotEmpty()
  readonly startDate: Date;

  @IsDateString()
  @Expose()
  @IsOptional()
  readonly endDate: Date | null;

  @IsBoolean()
  @Expose()
  @IsNotEmpty()
  readonly autoRenew: boolean;

  @Expose()
  @Type(() => PlanResponseDto)
  readonly plan: PlanResponseDto;
}
