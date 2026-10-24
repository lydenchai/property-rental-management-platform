import { z } from 'zod';

export const ContactCategorySchema = z.enum([
  'GENERAL',
  'LANDLORD_ONBOARDING',
  'TENANT_SUPPORT',
  'TECHNICAL_SECURITY',
  'BILLING'
]);

export type ContactCategory = z.infer<typeof ContactCategorySchema>;

export const ContactInputSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),
  email: z
    .string()
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),
  category: ContactCategorySchema.default('GENERAL'),
  propertyReference: z
    .string()
    .max(100, 'Property reference must not exceed 100 characters')
    .optional()
    .nullable(),
  subject: z
    .string()
    .min(3, 'Subject must be at least 3 characters')
    .max(150, 'Subject must not exceed 150 characters')
    .trim(),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters long')
    .max(2000, 'Message must not exceed 2,000 characters')
    .trim(),
});

export type ContactInput = z.infer<typeof ContactInputSchema>;
