import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateTrainerNoteRequestSchema = z.object({
  note: z.string().min(1).describe('Ótima evolução de massa magra!'),
});

export class UpdateTrainerNoteRequestDto extends createZodDto(
  UpdateTrainerNoteRequestSchema
) {}
