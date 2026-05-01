import { HeightUnit } from '@src/module/identity/core/enum/height-unit.enum';
import { MeasurementType } from '@src/module/identity/core/enum/measurement-type.enum';
import { MetricGoalStatus } from '@src/module/identity/core/enum/metric-goal-status.enum';
import { UserType } from '@src/module/identity/core/enum/user-type.enum';
import { WeightUnit } from '@src/module/identity/core/enum/weight-unit.enum';
import { z } from 'zod';

export const signInRequestSchema = z.object({
  email: z.email().trim(),
  password: z.string().trim().min(1),
});
export type SignInRequestSchema = z.infer<typeof signInRequestSchema>;

export const resetPasswordRequestSchema = z.object({
  email: z.email().trim(),
});
export type ResetPasswordRequestSchema = z.infer<typeof resetPasswordRequestSchema>;

export const resetPasswordVerifySchema = z.object({
  token: z.string().min(4).max(4),
  email: z.email().trim(),
});
export type ResetPasswordVerifySchema = z.infer<typeof resetPasswordVerifySchema>;

export const resetPasswordNewPasswordSchema = z.object({
  userId: z.uuid(),
  newPassword: z.string().min(8).max(255),
});
export type ResetPasswordNewPasswordSchema = z.infer<
  typeof resetPasswordNewPasswordSchema
>;

export const userGetByIdsRequestSchema = z.object({
  userIds: z.array(z.uuid()).min(1),
});
export type UserGetByIdsRequestSchema = z.infer<typeof userGetByIdsRequestSchema>;

export const userCreateRequestSchema = z.looseObject({
  id: z.uuid().optional(),
  email: z.email().trim(),
  password: z.string().trim().min(1),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  bio: z.string().trim().min(1).optional(),
  type: z.enum(UserType).optional(),
});
export type UserCreateRequestSchema = z.infer<typeof userCreateRequestSchema>;

export const userPrivacySettingsRequestSchema = z.object({
  shareName: z.boolean().optional(),
  shareEmail: z.boolean().optional(),
  shareTrainingProgress: z.boolean().optional(),
  sharePastDataWithTrainer: z.boolean().optional(),
});
export type UserPrivacySettingsRequestSchema = z.infer<
  typeof userPrivacySettingsRequestSchema
>;

export const userChangeBioRequestSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  bio: z.string().trim(),
  cref: z.string().trim().max(20).optional(),
});
export type UserChangeBioRequestSchema = z.infer<typeof userChangeBioRequestSchema>;

export const updateUserMetricsRequestSchema = z.object({
  height: z.number().min(0).optional(),
  currentWeight: z.number().min(0).optional(),
  weightUnit: z.enum(WeightUnit).optional(),
  heightUnit: z.enum(HeightUnit).optional(),
});
export type UpdateUserMetricsRequestSchema = z.infer<
  typeof updateUserMetricsRequestSchema
>;

export const upgradeToPersonalTrainerRequestSchema = z.object({
  cref: z.string().trim().min(5).max(20),
});
export type UpgradeToPersonalTrainerRequestSchema = z.infer<
  typeof upgradeToPersonalTrainerRequestSchema
>;

export const addWeightLogRequestSchema = z.object({
  weight: z.number().min(0),
  measuredAt: z.iso.datetime().optional(),
});
export type AddWeightLogRequestSchema = z.infer<typeof addWeightLogRequestSchema>;

export const bodyMeasurementEntrySchema = z.object({
  type: z.enum(MeasurementType),
  value: z.number().min(0),
});

export const addBodyMeasurementsRequestSchema = z.object({
  measurements: z.array(bodyMeasurementEntrySchema).min(1),
  measuredAt: z.iso.datetime().optional(),
});
export type AddBodyMeasurementsRequestSchema = z.infer<
  typeof addBodyMeasurementsRequestSchema
>;

export const createMetricGoalRequestSchema = z.object({
  type: z.string().trim().min(1),
  targetValue: z.number().min(0),
  deadline: z.iso.datetime().optional(),
});
export type CreateMetricGoalRequestSchema = z.infer<typeof createMetricGoalRequestSchema>;

export const updateMetricGoalStatusRequestSchema = z.object({
  status: z.enum(MetricGoalStatus),
});
export type UpdateMetricGoalStatusRequestSchema = z.infer<
  typeof updateMetricGoalStatusRequestSchema
>;

export const updateTrainerInviteCodeRequestSchema = z.object({
  inviteCode: z.string().trim().min(3).max(50),
});
export type UpdateTrainerInviteCodeRequestSchema = z.infer<
  typeof updateTrainerInviteCodeRequestSchema
>;

export const linkTrainerRequestSchema = z.object({
  inviteCode: z.string().trim().min(1),
});
export type LinkTrainerRequestSchema = z.infer<typeof linkTrainerRequestSchema>;

export const updateTrainerNoteRequestSchema = z.object({
  note: z.string().trim().min(1),
});
export type UpdateTrainerNoteRequestSchema = z.infer<
  typeof updateTrainerNoteRequestSchema
>;
