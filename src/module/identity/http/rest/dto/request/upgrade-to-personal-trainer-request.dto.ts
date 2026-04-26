import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpgradeToPersonalTrainerRequestSchema = z.object({
  cref: z.string().min(5).max(20).describe('Registro Profissional (CREF)'),
});

export class UpgradeToPersonalTrainerRequestDto extends createZodDto(
  UpgradeToPersonalTrainerRequestSchema
) {}
