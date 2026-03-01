import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, Min } from 'class-validator';

export class AddWeightLogRequestDto {
  @ApiProperty({ example: 80.5, description: 'User weight' })
  @IsNumber()
  @Min(0)
  weight: number;

  @ApiProperty({ example: '2026-03-01T12:00:00Z', description: 'When the weight was measured', required: false })
  @IsDateString()
  @IsOptional()
  measuredAt?: string;
}
