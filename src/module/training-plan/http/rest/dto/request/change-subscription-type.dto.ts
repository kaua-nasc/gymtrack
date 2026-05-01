import { PlanSubscriptionType } from "@src/module/training-plan/core/enum/plan-subscription-type.enum";
import { createZodDto } from "nestjs-zod";
import { z }from "zod";

export const ChangeSubscriptionTypeRequestSchema = z.object({
  type: z.enum(PlanSubscriptionType).describe('Novo tipo da assinatura do plano'),
});

export class ChangeSubscriptionTypeRequestDto extends createZodDto(ChangeSubscriptionTypeRequestSchema) {}