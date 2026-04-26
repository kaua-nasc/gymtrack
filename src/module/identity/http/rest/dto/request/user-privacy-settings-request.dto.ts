import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UserPrivacySettingsRequestSchema = z.object({
  shareName: z
    .boolean()
    .optional()
    .describe('Indica se o nome do usuário pode ser exibido publicamente'),
  shareEmail: z
    .boolean()
    .optional()
    .describe('Indica se o e-mail do usuário pode ser compartilhado'),
  shareTrainingProgress: z
    .boolean()
    .optional()
    .describe('Indica se o progresso de treino pode ser compartilhado'),
  sharePastDataWithTrainer: z
    .boolean()
    .optional()
    .describe('Indica se o treinador pode ver o histórico anterior ao vínculo'),
});

export class UserPrivacySettingsRequestDto extends createZodDto(
  UserPrivacySettingsRequestSchema
) {}
