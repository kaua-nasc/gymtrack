import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateExerciseLogRequestDto {
  @ApiProperty({
    description: 'The ID of the user performing the exercise.',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'The ID of the exercise being logged.',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @IsUUID()
  @IsNotEmpty()
  exerciseId: string;

  @ApiProperty({
    description: 'An array of repetitions performed for each set.',
    example: [12, 10, 8],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  reps: number[];

  @ApiProperty({
    description: 'An array of weights used for each set (in kg).',
    example: [50, 55, 60],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  weight: number[];

  @ApiProperty({
    description: 'Optional notes for the log entry.',
    example: 'Felt a bit of a strain in the last set.',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
