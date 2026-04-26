import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateTrainerInviteCodeRequestSchema = z.object({
  inviteCode: z.string().min(3).max(50).describe('Código de convite personalizado'),
});

export class UpdateTrainerInviteCodeRequestDto extends createZodDto(UpdateTrainerInviteCodeRequestSchema) {}
