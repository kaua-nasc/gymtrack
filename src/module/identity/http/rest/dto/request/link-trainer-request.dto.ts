import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const LinkTrainerRequestSchema = z.object({
  inviteCode: z.string().min(1).describe('Código de convite do treinador'),
});

export class LinkTrainerRequestDto extends createZodDto(LinkTrainerRequestSchema) {}
