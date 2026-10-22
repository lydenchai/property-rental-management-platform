import { z } from 'zod';

export const ApplicationStatusSchema = z.enum([
  'PENDING',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
  'WITHDRAWN',
]);

export const LeaseStatusSchema = z.enum([
  'DRAFT',
  'PENDING_SIGNATURES',
  'ACTIVE',
  'TERMINATED',
  'EXPIRED',
]);

export const SubmitApplicationSchema = z.object({
  unitId: z.string().min(1, 'Unit ID is required'),
  desiredMoveInDate: z.string().min(1, 'Desired move-in date is required'),
  proposedRent: z.number().positive('Proposed rent must be positive'),
  employmentDetails: z.string().min(5, 'Please provide employment details'),
  notes: z.string().max(1000).optional().nullable(),
});

export type SubmitApplicationInput = z.infer<typeof SubmitApplicationSchema>;

export const ReviewApplicationSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'UNDER_REVIEW']),
  reason: z.string().min(3, 'Reason or review note must be provided').max(500),
});

export type ReviewApplicationInput = z.infer<typeof ReviewApplicationSchema>;

export const CreateLeaseSchema = z.object({
  unitId: z.string().min(1, 'Unit ID is required'),
  tenantId: z.string().min(1, 'Tenant ID is required'),
  applicationId: z.string().optional().nullable(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  rentAmount: z.number().positive('Monthly rent must be positive'),
  depositAmount: z.number().nonnegative('Deposit cannot be negative'),
  paymentDueDay: z.number().int().min(1).max(28).default(1),
  termsAndConditions: z.string().min(10, 'Terms and conditions must be specified'),
});

export type CreateLeaseInput = z.infer<typeof CreateLeaseSchema>;

export const SignLeaseSchema = z.object({
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the terms to sign the lease' }),
  }),
});

export type SignLeaseInput = z.infer<typeof SignLeaseSchema>;
