import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { MetricGoalStatus } from '../../../../core/enum/metric-goal-status.enum';

export class MetricGoalResponseDto {
  @ApiProperty({ example: 'b863a0a1-cbe0-4bc0-b605-16361e3618da' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'WEIGHT' })
  @Expose()
  type: string;

  @ApiProperty({ example: 80.0 })
  @Expose()
  startingValue: number;

  @ApiProperty({ example: 75.0 })
  @Expose()
  targetValue: number;

  @ApiProperty({ example: 0.75, description: 'Progress from 0 to 1' })
  @Expose()
  progress: number;

  @ApiProperty({ example: '2026-06-01T00:00:00Z', required: false })
  @Expose()
  deadline?: Date;

  @ApiProperty({ example: '2026-05-15T12:00:00Z', required: false })
  @Expose()
  achievedAt?: Date;

  @ApiProperty({ enum: MetricGoalStatus, enumName: 'MetricGoalStatus' })
  @Expose()
  status: MetricGoalStatus;
}
