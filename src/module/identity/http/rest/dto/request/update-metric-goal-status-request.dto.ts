import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { MetricGoalStatus } from '../../../../core/enum/metric-goal-status.enum';

export class UpdateMetricGoalStatusRequestDto {
  @ApiProperty({ enum: MetricGoalStatus, example: MetricGoalStatus.ABANDONED })
  @IsEnum(MetricGoalStatus)
  status: MetricGoalStatus;
}
