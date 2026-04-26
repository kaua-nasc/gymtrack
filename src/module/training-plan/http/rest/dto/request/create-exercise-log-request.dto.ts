import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateExerciseLogRequestSchema = z.object({
  userId: z.string().uuid().describe('The ID of the user performing the exercise.'),
  exerciseId: z.string().uuid().describe('The ID of the exercise being logged.'),
  reps: z.array(z.number()).describe('An array of repetitions performed for each set.'),
  weight: z.array(z.number()).describe('An array of weights used for each set (in kg).'),
  notes: z.string().optional().describe('Optional notes for the log entry.'),
});

export class CreateExerciseLogRequestDto extends createZodDto(CreateExerciseLogRequestSchema) {}
