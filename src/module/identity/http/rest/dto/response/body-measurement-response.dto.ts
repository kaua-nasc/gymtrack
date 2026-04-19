import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { MeasurementType } from '@src/module/identity/core/enum/measurement-type.enum';

export class BodyMeasurementResponseDto {
  @ApiProperty({ example: 'b863a0a1-cbe0-4bc0-b605-16361e3618da' })
  @Expose()
  id: string;

  @ApiProperty({ type: String, enum: MeasurementType, enumName: 'MeasurementType' })
  @Expose()
  type: MeasurementType;

  @ApiProperty({ example: 85.5 })
  @Expose()
  value: number;

  @ApiProperty({ example: '2026-03-01T12:00:00Z' })
  @Expose()
  measuredAt: Date;

  @ApiProperty({ example: 'Great progress on muscle mass!', required: false })
  @Expose()
  trainerNote?: string;

  @ApiProperty({ example: '2026-03-01T12:00:00Z', required: false })
  @Expose()
  trainerNoteAt?: Date;
}
