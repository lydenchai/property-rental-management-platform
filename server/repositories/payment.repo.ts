import { prisma } from '../utils/db';
import { PaymentMethod } from '../../shared/types/enums/payment-method.enum';
import { PaymentStatus } from '../../shared/types/enums/payment-status.enum';

export interface PaymentEntity {
  id: string;
  invoiceId: string;
  recordedById: string;
  amount: number;
  method: PaymentMethod;
  referenceNumber: string | null;
  status: PaymentStatus;
  paidAt: Date;
  receiptUrl: string | null;
  notes: string | null;
  createdAt: Date;
  recordedBy?: {
    id: string;
    fullName: string;
    email: string;
  };
  invoice?: any;
}

const inMemoryPayments: PaymentEntity[] = [
  {
    id: 'pmt-sample-000',
    invoiceId: 'inv-skyline-000',
    recordedById: 'user-tenant-01',
    amount: 1650,
    method: PaymentMethod.BANK_TRANSFER,
    referenceNumber: 'TXN-WIRE-9921',
    status: PaymentStatus.CONFIRMED,
    paidAt: new Date('2026-01-03T10:00:00Z'),
    receiptUrl: 'RCPT-JAN2026-01',
    notes: 'ACH Direct Transfer settled',
    createdAt: new Date('2026-01-03T10:00:00Z'),
    recordedBy: {
      id: 'user-tenant-01',
      fullName: 'Sarah Jenkins',
      email: 'tenant@example.com',
    },
  },
];

export class PaymentRepository {
  async create(data: {
    invoiceId: string;
    recordedById: string;
    amount: number;
    method: PaymentMethod;
    referenceNumber?: string | null;
    status?: PaymentStatus;
    paidAt?: Date;
    receiptUrl?: string | null;
    notes?: string | null;
  }): Promise<PaymentEntity> {
    try {
      const created = await prisma.paymentRecord.create({
        data: {
          invoiceId: data.invoiceId,
          recordedById: data.recordedById,
          amount: data.amount,
          method: data.method as any,
          referenceNumber: data.referenceNumber || null,
          status: (data.status as any) || PaymentStatus.CONFIRMED,
          paidAt: data.paidAt || new Date(),
          receiptUrl: data.receiptUrl || null,
          notes: data.notes || null,
        },
        include: {
          recordedBy: {
            select: { id: true, fullName: true, email: true },
          },
          invoice: {
            include: {
              lease: {
                include: {
                  unit: { include: { property: true } },
                  tenant: { select: { id: true, fullName: true, email: true } },
                  landlord: { select: { id: true, fullName: true, email: true } },
                },
              },
            },
          },
        },
      });

      return {
        ...created,
        amount: Number(created.amount),
        method: created.method as PaymentMethod,
        status: created.status as PaymentStatus,
      };
    } catch {
      const newPayment: PaymentEntity = {
        id: `pmt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        invoiceId: data.invoiceId,
        recordedById: data.recordedById,
        amount: data.amount,
        method: data.method,
        referenceNumber: data.referenceNumber || null,
        status: data.status || PaymentStatus.CONFIRMED,
        paidAt: data.paidAt || new Date(),
        receiptUrl: data.receiptUrl || `RCPT-${Date.now().toString().slice(-6)}`,
        notes: data.notes || null,
        createdAt: new Date(),
      };

      inMemoryPayments.unshift(newPayment);
      return newPayment;
    }
  }

  async findById(id: string): Promise<PaymentEntity | null> {
    try {
      const p = await prisma.paymentRecord.findUnique({
        where: { id },
        include: {
          recordedBy: {
            select: { id: true, fullName: true, email: true },
          },
          invoice: {
            include: {
              lease: {
                include: {
                  unit: { include: { property: true } },
                  tenant: { select: { id: true, fullName: true, email: true } },
                  landlord: { select: { id: true, fullName: true, email: true } },
                },
              },
            },
          },
        },
      });

      if (!p) return null;
      return {
        ...p,
        amount: Number(p.amount),
        method: p.method as PaymentMethod,
        status: p.status as PaymentStatus,
      };
    } catch {
      const found = inMemoryPayments.find((p) => p.id === id);
      return found ? { ...found } : null;
    }
  }

  async findMany(filter: {
    invoiceId?: string;
    recordedById?: string;
    status?: PaymentStatus;
  } = {}): Promise<PaymentEntity[]> {
    try {
      const where: any = {};
      if (filter.invoiceId) where.invoiceId = filter.invoiceId;
      if (filter.recordedById) where.recordedById = filter.recordedById;
      if (filter.status) where.status = filter.status;

      const list = await prisma.paymentRecord.findMany({
        where,
        include: {
          recordedBy: {
            select: { id: true, fullName: true, email: true },
          },
          invoice: true,
        },
        orderBy: { paidAt: 'desc' },
      });

      return list.map((p: any) => ({
        ...p,
        amount: Number(p.amount),
        method: p.method as PaymentMethod,
        status: p.status as PaymentStatus,
      }));
    } catch {
      let filtered = [...inMemoryPayments];
      if (filter.invoiceId) {
        filtered = filtered.filter((p) => p.invoiceId === filter.invoiceId);
      }
      if (filter.recordedById) {
        filtered = filtered.filter((p) => p.recordedById === filter.recordedById);
      }
      if (filter.status) {
        filtered = filtered.filter((p) => p.status === filter.status);
      }
      return filtered;
    }
  }
}

export const paymentRepository = new PaymentRepository();
