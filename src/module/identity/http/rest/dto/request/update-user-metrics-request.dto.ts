import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { WeightUnit } from '../../../../core/enum/weight-unit.enum';
import { HeightUnit } from '../../../../core/enum/height-unit.enum';

export class UpdateUserMetricsRequestDto {
  @ApiProperty({ example: 175, description: 'User height' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  height?: number;

  @ApiProperty({ example: 75.5, description: 'User current weight' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  currentWeight?: number;

  @ApiProperty({ enum: WeightUnit, example: WeightUnit.kg })
  @IsEnum(WeightUnit)
  @IsOptional()
  weightUnit?: WeightUnit;

  @ApiProperty({ enum: HeightUnit, example: HeightUnit.cm })
  @IsEnum(HeightUnit)
  @IsOptional()
  heightUnit?: HeightUnit;
}
