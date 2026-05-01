import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SignInRequestSchema = z.object({
  email: z.email().describe('Email do usuário'),
  password: z.string().min(1).describe('Senha do usuário'),
});

export class SignInRequestDto extends createZodDto(SignInRequestSchema) {}
