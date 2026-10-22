import { z } from 'zod';

export const InvoiceStatusSchema = z.enum([
  'UNPAID',
  'PARTIALLY_PAID',
  'PAID',
  'OVERDUE',
  'CANCELLED',
]);

export const PaymentMethodSchema = z.enum([
  'BANK_TRANSFER',
  'CREDIT_CARD',
  'CASH',
  'CHECK',
  'STRIPE_MOCK',
]);

export const PaymentStatusSchema = z.enum(['PENDING', 'CONFIRMED', 'FAILED', 'REFUNDED']);

export const GenerateInvoiceSchema = z.object({
  leaseId: z.string().min(1, 'Lease ID is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  amountDue: z.number().positive('Invoice amount must be positive'),
  notes: z.string().max(500).optional().nullable(),
});

export type GenerateInvoiceInput = z.infer<typeof GenerateInvoiceSchema>;

export const RecordPaymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  amount: z.number().positive('Payment amount must be positive'),
  method: PaymentMethodSchema,
  referenceNumber: z.string().max(100).optional().nullable(),
  paidAt: z.string().optional(),
  notes: z.string().max(500).optional().nullable(),
});

export type RecordPaymentInput = z.infer<typeof RecordPaymentSchema>;

export const QueryInvoiceSchema = z.object({
  leaseId: z.string().optional(),
  tenantId: z.string().optional(),
  status: InvoiceStatusSchema.optional(),
});

export type QueryInvoiceInput = z.infer<typeof QueryInvoiceSchema>;
