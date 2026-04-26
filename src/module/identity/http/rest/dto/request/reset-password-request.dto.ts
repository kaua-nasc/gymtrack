import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ResetPasswordRequestSchema = z.object({
  email: z.string().email().describe('Email do usuário'),
});

export class ResetPasswordRequestDto extends createZodDto(ResetPasswordRequestSchema) {}
