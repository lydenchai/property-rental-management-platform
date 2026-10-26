import { prisma } from '../utils/db';
import { InvoiceStatus } from '../../shared/types/enums/invoice-status.enum';

export interface InvoiceEntity {
  id: string;
  leaseId: string;
  tenantId: string;
  invoiceNumber: string;
  amountDue: number;
  amountPaid: number;
  issueDate: Date;
  dueDate: Date;
  status: InvoiceStatus;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  lease?: any;
  tenant?: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
  };
  payments?: any[];
}

const inMemoryInvoices: InvoiceEntity[] = [
  {
    id: 'inv-skyline-001',
    leaseId: 'lease-skyline-101a',
    tenantId: 'user-tenant-01',
    invoiceNumber: 'INV-2026-001',
    amountDue: 1650,
    amountPaid: 0,
    issueDate: new Date('2026-02-01T00:00:00Z'),
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    status: InvoiceStatus.UNPAID,
    notes: 'February 2026 Monthly Rent for Skyline Heights #101A',
    createdAt: new Date('2026-02-01T08:00:00Z'),
    updatedAt: new Date('2026-02-01T08:00:00Z'),
    tenant: {
      id: 'user-tenant-01',
      fullName: 'Sarah Jenkins',
      email: 'tenant@example.com',
      phone: '+1 (555) 234-5678',
    },
    payments: [],
  },
  {
    id: 'inv-skyline-000',
    leaseId: 'lease-skyline-101a',
    tenantId: 'user-tenant-01',
    invoiceNumber: 'INV-2026-000',
    amountDue: 1650,
    amountPaid: 1650,
    issueDate: new Date('2026-01-01T00:00:00Z'),
    dueDate: new Date('2026-01-05T23:59:59Z'),
    status: InvoiceStatus.PAID,
    notes: 'January 2026 Monthly Rent for Skyline Heights #101A',
    createdAt: new Date('2026-01-01T08:00:00Z'),
    updatedAt: new Date('2026-01-03T10:00:00Z'),
    tenant: {
      id: 'user-tenant-01',
      fullName: 'Sarah Jenkins',
      email: 'tenant@example.com',
      phone: '+1 (555) 234-5678',
    },
    payments: [
      {
        id: 'pmt-sample-000',
        invoiceId: 'inv-skyline-000',
        recordedById: 'user-tenant-01',
        amount: 1650,
        method: 'BANK_TRANSFER',
        referenceNumber: 'TXN-WIRE-9921',
        status: 'CONFIRMED',
        paidAt: new Date('2026-01-03T10:00:00Z'),
        receiptUrl: 'RCPT-JAN2026-01',
        notes: 'ACH Direct Transfer settled',
      },
    ],
  },
];

export class InvoiceRepository {
  async create(data: {
    leaseId: string;
    tenantId: string;
    invoiceNumber: string;
    amountDue: number;
    amountPaid?: number;
    issueDate?: Date;
    dueDate: Date;
    status?: InvoiceStatus;
    notes?: string | null;
  }): Promise<InvoiceEntity> {
    try {
      const created = await prisma.invoice.create({
        data: {
          leaseId: data.leaseId,
          tenantId: data.tenantId,
          invoiceNumber: data.invoiceNumber,
          amountDue: data.amountDue,
          amountPaid: data.amountPaid || 0,
          issueDate: data.issueDate || new Date(),
          dueDate: data.dueDate,
          status: (data.status as any) || InvoiceStatus.UNPAID,
        },
        include: {
          lease: {
            include: {
              unit: { include: { property: true } },
              landlord: { select: { id: true, fullName: true, email: true, phone: true } },
            },
          },
          tenant: {
            select: { id: true, fullName: true, email: true, phone: true },
          },
          payments: true,
        },
      });

      return {
        ...created,
        amountDue: Number(created.amountDue),
        amountPaid: Number(created.amountPaid),
        status: created.status as InvoiceStatus,
        notes: data.notes || null,
        payments: created.payments.map((p: any) => ({
          ...p,
          amount: Number(p.amount),
        })),
      };
    } catch {
      const newInvoice: InvoiceEntity = {
        id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        leaseId: data.leaseId,
        tenantId: data.tenantId,
        invoiceNumber: data.invoiceNumber,
        amountDue: data.amountDue,
        amountPaid: data.amountPaid || 0,
        issueDate: data.issueDate || new Date(),
        dueDate: data.dueDate,
        status: data.status || InvoiceStatus.UNPAID,
        notes: data.notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        payments: [],
      };

      inMemoryInvoices.unshift(newInvoice);
      return newInvoice;
    }
  }

  async findById(id: string): Promise<InvoiceEntity | null> {
    try {
      const inv = await prisma.invoice.findUnique({
        where: { id },
        include: {
          lease: {
            include: {
              unit: { include: { property: true } },
              landlord: { select: { id: true, fullName: true, email: true, phone: true } },
            },
          },
          tenant: {
            select: { id: true, fullName: true, email: true, phone: true },
          },
          payments: true,
        },
      });

      if (!inv) return null;
      return {
        ...inv,
        amountDue: Number(inv.amountDue),
        amountPaid: Number(inv.amountPaid),
        status: inv.status as InvoiceStatus,
        payments: inv.payments.map((p: any) => ({
          ...p,
          amount: Number(p.amount),
        })),
      };
    } catch {
      const found = inMemoryInvoices.find((i) => i.id === id);
      return found ? { ...found } : null;
    }
  }

  async findByInvoiceNumber(invoiceNumber: string): Promise<InvoiceEntity | null> {
    try {
      const inv = await prisma.invoice.findUnique({
        where: { invoiceNumber },
        include: {
          lease: {
            include: {
              unit: { include: { property: true } },
              landlord: { select: { id: true, fullName: true, email: true, phone: true } },
            },
          },
          tenant: {
            select: { id: true, fullName: true, email: true, phone: true },
          },
          payments: true,
        },
      });

      if (!inv) return null;
      return {
        ...inv,
        amountDue: Number(inv.amountDue),
        amountPaid: Number(inv.amountPaid),
        status: inv.status as InvoiceStatus,
        payments: inv.payments.map((p: any) => ({
          ...p,
          amount: Number(p.amount),
        })),
      };
    } catch {
      const found = inMemoryInvoices.find((i) => i.invoiceNumber === invoiceNumber);
      return found ? { ...found } : null;
    }
  }

  async findMany(
    filter: {
      leaseId?: string;
      tenantId?: string;
      status?: InvoiceStatus;
      landlordId?: string;
    } = {}
  ): Promise<InvoiceEntity[]> {
    try {
      const where: any = {};
      if (filter.leaseId) where.leaseId = filter.leaseId;
      if (filter.tenantId) where.tenantId = filter.tenantId;
      if (filter.status) where.status = filter.status;
      if (filter.landlordId) {
        where.lease = { landlordId: filter.landlordId };
      }

      const list = await prisma.invoice.findMany({
        where,
        include: {
          lease: {
            include: {
              unit: { include: { property: true } },
              landlord: { select: { id: true, fullName: true, email: true, phone: true } },
            },
          },
          tenant: {
            select: { id: true, fullName: true, email: true, phone: true },
          },
          payments: true,
        },
        orderBy: { dueDate: 'desc' },
      });

      return list.map((i: any) => ({
        ...i,
        amountDue: Number(i.amountDue),
        amountPaid: Number(i.amountPaid),
        status: i.status as InvoiceStatus,
        payments: i.payments.map((p: any) => ({
          ...p,
          amount: Number(p.amount),
        })),
      }));
    } catch {
      let filtered = [...inMemoryInvoices];
      if (filter.leaseId) {
        filtered = filtered.filter((i) => i.leaseId === filter.leaseId);
      }
      if (filter.tenantId) {
        filtered = filtered.filter((i) => i.tenantId === filter.tenantId);
      }
      if (filter.status) {
        filtered = filtered.filter((i) => i.status === filter.status);
      }
      return filtered;
    }
  }

  async update(id: string, data: Partial<InvoiceEntity>): Promise<InvoiceEntity | null> {
    try {
      const updatePayload: any = {};
      if (data.amountDue !== undefined) updatePayload.amountDue = data.amountDue;
      if (data.amountPaid !== undefined) updatePayload.amountPaid = data.amountPaid;
      if (data.dueDate !== undefined) updatePayload.dueDate = data.dueDate;
      if (data.status !== undefined) updatePayload.status = data.status as any;

      const updated = await prisma.invoice.update({
        where: { id },
        data: updatePayload,
        include: {
          lease: {
            include: {
              unit: { include: { property: true } },
              landlord: { select: { id: true, fullName: true, email: true, phone: true } },
            },
          },
          tenant: {
            select: { id: true, fullName: true, email: true, phone: true },
          },
          payments: true,
        },
      });

      return {
        ...updated,
        amountDue: Number(updated.amountDue),
        amountPaid: Number(updated.amountPaid),
        status: updated.status as InvoiceStatus,
        payments: updated.payments.map((p: any) => ({
          ...p,
          amount: Number(p.amount),
        })),
      };
    } catch {
      const idx = inMemoryInvoices.findIndex((i) => i.id === id);
      if (idx === -1) return null;
      inMemoryInvoices[idx] = {
        ...inMemoryInvoices[idx],
        ...(data as any),
        updatedAt: new Date(),
      };
      return { ...inMemoryInvoices[idx] } as any;
    }
  }
}

export const invoiceRepository = new InvoiceRepository();
