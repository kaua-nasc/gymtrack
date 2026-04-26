import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ResetPasswordVerifySchema = z.object({
  token: z
    .string()
    .length(4)
    .describe('Codigo gerado ao requerir a redefinicao da senha'),
  email: z.string().email().describe('Email do usuário'),
});

export class ResetPasswordVerifyDto extends createZodDto(ResetPasswordVerifySchema) {}
