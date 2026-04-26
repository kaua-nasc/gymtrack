import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const AddWeightLogRequestSchema = z.object({
  weight: z.number().min(0).describe('User weight'),
  measuredAt: z.string().datetime().optional().describe('When the weight was measured'),
});

export class AddWeightLogRequestDto extends createZodDto(AddWeightLogRequestSchema) {}
