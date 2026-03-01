import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsEnum, IsNumber, IsOptional, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MeasurementType } from '../../../../core/enum/measurement-type.enum';

export class BodyMeasurementEntryDto {
  @ApiProperty({ enum: MeasurementType, example: MeasurementType.WAIST })
  @IsEnum(MeasurementType)
  type: MeasurementType;

  @ApiProperty({ example: 85.5 })
  @IsNumber()
  @Min(0)
  value: number;
}

export class AddBodyMeasurementsRequestDto {
  @ApiProperty({ type: [BodyMeasurementEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BodyMeasurementEntryDto)
  measurements: BodyMeasurementEntryDto[];

  @ApiProperty({ example: '2026-03-01T12:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  measuredAt?: string;
}
