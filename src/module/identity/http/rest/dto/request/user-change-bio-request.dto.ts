import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UserChangeBioRequestSchema = z.object({
  firstName: z.string().min(1).describe('Primeiro nome do usuário'),
  lastName: z.string().min(1).describe('Sobrenome do usuário'),
  bio: z.string().min(1).describe('Bio do usuário'),
  cref: z.string().max(20).optional().describe('Registro Profissional (CREF)'),
});

export class UserChangeBioRequestDto extends createZodDto(UserChangeBioRequestSchema) {}
