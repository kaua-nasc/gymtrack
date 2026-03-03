import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateMetricGoalRequestDto {
  @ApiProperty({ example: 'WEIGHT', description: 'Can be WEIGHT or any MeasurementType' })
  @IsString()
  type: string;

  @ApiProperty({ example: 75.0, description: 'The target value to reach' })
  @IsNumber()
  @Min(0)
  targetValue: number;

  @ApiProperty({ example: '2026-06-01T00:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  deadline?: string;
}
