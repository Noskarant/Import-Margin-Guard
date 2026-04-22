import { z } from 'zod';

export const scenarioInputSchema = z.object({
  unitPurchasePrice: z.number().min(0),
  quantity: z.number().positive(),
  transportCost: z.number().min(0),
  dutyRate: z.number().min(0).max(1),
  ancillaryFees: z.number().min(0),
  salesPrice: z.number().positive().optional(),
});

export const scenarioSchema = z.object({
  name: z.string().min(1),
  rows: z.array(scenarioInputSchema).min(1),
});
