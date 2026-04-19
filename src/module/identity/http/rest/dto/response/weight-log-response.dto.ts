import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class WeightLogResponseDto {
  @ApiProperty({ example: 'b863a0a1-cbe0-4bc0-b605-16361e3618da' })
  @Expose()
  id: string;

  @ApiProperty({ example: 80.5 })
  @Expose()
  weight: number;

  @ApiProperty({ example: '2026-03-01T12:00:00Z' })
  @Expose()
  measuredAt: Date;

  @ApiProperty({ example: 'Keep up the good work!', required: false })
  @Expose()
  trainerNote?: string;

  @ApiProperty({ example: '2026-03-01T12:00:00Z', required: false })
  @Expose()
  trainerNoteAt?: Date;
}
