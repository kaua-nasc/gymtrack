import { UserType } from '@src/module/identity/core/enum/user-type.enum';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UserCreateRequestSchema = z
  .object({
    id: z
      .string()
      .uuid()
      .optional()
      .describe('ID do usuário (opcional, usado em testes)'),
    email: z.string().email().describe('Email do usuário'),
    password: z.string().min(1).describe('Senha do usuário'),
    firstName: z.string().min(1).describe('Primeiro nome do usuário'),
    lastName: z.string().min(1).describe('Sobrenome do usuário'),
    bio: z.string().min(1).optional().describe('Bio do usuário'),
    type: z
      .nativeEnum(UserType)
      .optional()
      .default(UserType.client)
      .describe('Tipo de usuário (CLIENT ou PERSONAL_TRAINER)'),
  })
  .passthrough();

export class UserCreateRequestDto extends createZodDto(UserCreateRequestSchema) {}
