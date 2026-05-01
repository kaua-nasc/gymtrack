import { MeasurementType } from '@src/module/identity/core/enum/measurement-type.enum';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const BodyMeasurementEntrySchema = z.object({
  type: z.enum(MeasurementType).describe('Tipo de medida corporal'),
  value: z.number().min(0).describe('Valor da medida'),
});

export const AddBodyMeasurementsRequestSchema = z.object({
  measurements: z
    .array(BodyMeasurementEntrySchema)
    .describe('Lista de medidas corporais'),
  measuredAt: z.iso.datetime().optional().describe('Data da medição'),
});

export class AddBodyMeasurementsRequestDto extends createZodDto(
  AddBodyMeasurementsRequestSchema
) {}
