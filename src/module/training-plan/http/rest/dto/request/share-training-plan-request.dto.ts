import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ShareTrainingPlanRequestSchema = z.object({
  recipientEmail: z.email().describe('Email do destinatário'),
  recipientId: z.uuid().optional().describe('ID do usuário destinatário (opcional)'),
});

export class ShareTrainingPlanRequestDto extends createZodDto(
  ShareTrainingPlanRequestSchema
) {}
