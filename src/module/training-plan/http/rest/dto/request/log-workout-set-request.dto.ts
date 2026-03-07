import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class LogWorkoutSetRequestDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsUUID()
  @IsNotEmpty()
  exerciseId: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  reps: number;

  @ApiProperty({ example: 60.5 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  weight: number;

  @ApiProperty({ example: 8, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  rpe?: number;
}
