import type { InvoiceStatus } from './enums/invoice-status.enum';
import type { PaymentMethod } from './enums/payment-method.enum';
import type { PaymentStatus } from './enums/payment-status.enum';

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
  notes?: string | null;
  createdAt: string;
}

export interface InvoiceItem extends InvoiceDetail {
  lease?: {
    id: string;
    unitId: string;
    landlordId: string;
    unit?: {
      id: string;
      unitNumber: string;
      property?: {
        id: string;
        title: string;
        city: string;
        state: string;
      };
    };
    landlord?: {
      id: string;
      fullName: string;
      email: string;
    };
  };
  tenant?: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
  };
  payments?: Array<{
    id: string;
    amount: number;
    method: PaymentMethod | string;
    referenceNumber: string | null;
    paidAt: string;
    receiptUrl: string | null;
  }>;
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

export interface GenerateInvoiceInput {
  leaseId: string;
  dueDate: string;
  amountDue: number;
  notes?: string;
}

export interface RecordPaymentInput {
  invoiceId: string;
  amount: number;
  method: PaymentMethod | string;
  referenceNumber?: string;
  notes?: string;
}

export interface PaymentReceipt {
  id: string;
  invoiceId: string;
  receiptNumber: string;
  amount: number;
  method: PaymentMethod | string;
  referenceNumber?: string | null;
  paidAt: string;
  invoice?: InvoiceItem;
}
