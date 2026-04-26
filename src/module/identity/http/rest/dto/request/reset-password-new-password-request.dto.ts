import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ResetPasswordNewPasswordRequestSchema = z.object({
  userId: z.string().uuid().describe('id do usuario'),
  newPassword: z.string().min(8).max(255).describe('Nova senha criada'),
});

export class ResetPasswordNewPasswordRequestDto extends createZodDto(ResetPasswordNewPasswordRequestSchema) {}
