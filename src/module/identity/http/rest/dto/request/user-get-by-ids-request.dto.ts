import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UserGetByIdsRequestSchema = z.object({
  userIds: z.array(z.string().uuid()).describe('Lista de IDs dos usuários'),
});

export class UserGetByIdsRequestDto extends createZodDto(UserGetByIdsRequestSchema) {}
