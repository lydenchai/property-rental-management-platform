import { InvoiceStatus } from "./enums/invoice-status.enum";
import { PaymentMethod } from "./enums/payment-method.enum";
import { PaymentStatus } from "./enums/payment-status.enum";

export interface InvoiceDetail {
  id: string;
  leaseId: string;
  tenantId: string;
  invoiceNumber: string;
  amountDue: number;
  amountPaid: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  createdAt: string;
}

export interface PaymentDetail {
  id: string;
  invoiceId: string;
  recordedBy: string;
  amount: number;
  method: PaymentMethod;
  referenceNumber?: string | null;
  status: PaymentStatus;
  paidAt: string;
  receiptUrl?: string | null;
  notes?: string | null;
  createdAt: string;
}
