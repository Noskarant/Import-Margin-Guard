import { z } from 'zod';

export const organizationSchema = z.object({
  name: z.string().min(2),
  countryCode: z.string().length(2),
  defaultCurrency: z.string().length(3),
  defaultLocale: z.enum(['fr-FR', 'en-US']).default('fr-FR'),
});

export const memberRoleSchema = z.enum(['owner', 'admin', 'member']);
