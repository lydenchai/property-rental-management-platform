import { prisma } from '../utils/db';
import { LeaseStatus } from '../../shared/types/enums/lease-status.enum';

export interface LeaseEntity {
  id: string;
  unitId: string;
  tenantId: string;
  landlordId: string;
  applicationId: string | null;
  startDate: Date;
  endDate: Date;
  rentAmount: number;
  depositAmount: number;
  paymentDueDay: number;
  status: LeaseStatus;
  tenantSignedAt: Date | null;
  landlordSignedAt: Date | null;
  termsAndConditions: string;
  createdAt: Date;
  updatedAt: Date;
  unit?: any;
  tenant?: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
  };
  landlord?: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
  };
}

const inMemoryLeases: LeaseEntity[] = [
  {
    id: 'lease-skyline-101a',
    unitId: 'unit-skyline-101a',
    tenantId: 'user-tenant-01',
    landlordId: 'user-landlord-01',
    applicationId: 'app-sample-02',
    startDate: new Date('2026-01-01T00:00:00Z'),
    endDate: new Date('2026-12-31T23:59:59Z'),
    rentAmount: 1650,
    depositAmount: 1650,
    paymentDueDay: 1,
    status: LeaseStatus.ACTIVE,
    tenantSignedAt: new Date('2026-01-02T12:00:00Z'),
    landlordSignedAt: new Date('2026-01-02T14:00:00Z'),
    termsAndConditions: 'Standard 12-month residential contract. Rent due on the 1st of every month with a 5-day grace period. Quiet hours observed after 10:00 PM.',
    createdAt: new Date('2026-01-02T10:30:00Z'),
    updatedAt: new Date('2026-01-02T14:00:00Z'),
  },
];

export class LeaseRepository {
  async create(data: {
    unitId: string;
    tenantId: string;
    landlordId: string;
    applicationId?: string | null;
    startDate: Date;
    endDate: Date;
    rentAmount: number;
    depositAmount: number;
    paymentDueDay?: number;
    termsAndConditions: string;
    status?: LeaseStatus;
  }): Promise<LeaseEntity> {
    try {
      const created = await prisma.lease.create({
        data: {
          unitId: data.unitId,
          tenantId: data.tenantId,
          landlordId: data.landlordId,
          applicationId: data.applicationId || null,
          startDate: data.startDate,
          endDate: data.endDate,
          rentAmount: data.rentAmount,
          depositAmount: data.depositAmount,
          paymentDueDay: data.paymentDueDay || 1,
          termsAndConditions: data.termsAndConditions,
          status: (data.status as any) || LeaseStatus.PENDING_SIGNATURES,
        },
        include: {
          unit: {
            include: { property: true },
          },
          tenant: {
            select: { id: true, fullName: true, email: true, phone: true },
          },
          landlord: {
            select: { id: true, fullName: true, email: true, phone: true },
          },
        },
      });

      return {
        ...created,
        rentAmount: Number(created.rentAmount),
        depositAmount: Number(created.depositAmount),
        status: created.status as LeaseStatus,
      };
    } catch {
      const newLease: LeaseEntity = {
        id: `lease-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        unitId: data.unitId,
        tenantId: data.tenantId,
        landlordId: data.landlordId,
        applicationId: data.applicationId || null,
        startDate: data.startDate,
        endDate: data.endDate,
        rentAmount: data.rentAmount,
        depositAmount: data.depositAmount,
        paymentDueDay: data.paymentDueDay || 1,
        termsAndConditions: data.termsAndConditions,
        status: data.status || LeaseStatus.PENDING_SIGNATURES,
        tenantSignedAt: null,
        landlordSignedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryLeases.unshift(newLease);
      return newLease;
    }
  }

  async findById(id: string): Promise<LeaseEntity | null> {
    try {
      const lease = await prisma.lease.findUnique({
        where: { id },
        include: {
          unit: {
            include: { property: true },
          },
          tenant: {
            select: { id: true, fullName: true, email: true, phone: true },
          },
          landlord: {
            select: { id: true, fullName: true, email: true, phone: true },
          },
        },
      });
      if (!lease) return null;
      return {
        ...lease,
        rentAmount: Number(lease.rentAmount),
        depositAmount: Number(lease.depositAmount),
        status: lease.status as LeaseStatus,
      };
    } catch {
      const found = inMemoryLeases.find((l) => l.id === id);
      return found ? { ...found } : null;
    }
  }

  async findAll(filter: {
    tenantId?: string;
    landlordId?: string;
    unitId?: string;
    status?: LeaseStatus;
  } = {}): Promise<LeaseEntity[]> {
    try {
      const where: any = {};
      if (filter.tenantId) where.tenantId = filter.tenantId;
      if (filter.landlordId) where.landlordId = filter.landlordId;
      if (filter.unitId) where.unitId = filter.unitId;
      if (filter.status) where.status = filter.status;

      const list = await prisma.lease.findMany({
        where,
        include: {
          unit: {
            include: { property: true },
          },
          tenant: {
            select: { id: true, fullName: true, email: true, phone: true },
          },
          landlord: {
            select: { id: true, fullName: true, email: true, phone: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return list.map((l: any) => ({
        ...l,
        rentAmount: Number(l.rentAmount),
        depositAmount: Number(l.depositAmount),
        status: l.status as LeaseStatus,
      }));
    } catch {
      return inMemoryLeases.filter((l) => {
        if (filter.tenantId && l.tenantId !== filter.tenantId) return false;
        if (filter.landlordId && l.landlordId !== filter.landlordId) return false;
        if (filter.unitId && l.unitId !== filter.unitId) return false;
        if (filter.status && l.status !== filter.status) return false;
        return true;
      });
    }
  }

  async findMany(filter: {
    tenantId?: string;
    landlordId?: string;
    unitId?: string;
    status?: LeaseStatus;
  } = {}): Promise<LeaseEntity[]> {
    return this.findAll(filter);
  }

  async update(id: string, data: Partial<LeaseEntity>): Promise<LeaseEntity | null> {
    try {
      const updated = await prisma.lease.update({
        where: { id },
        data: {
          ...(data.status && { status: data.status as any }),
          ...(data.tenantSignedAt !== undefined && { tenantSignedAt: data.tenantSignedAt }),
          ...(data.landlordSignedAt !== undefined && { landlordSignedAt: data.landlordSignedAt }),
          ...(data.termsAndConditions && { termsAndConditions: data.termsAndConditions }),
        },
      });

      return {
        ...updated,
        rentAmount: Number(updated.rentAmount),
        depositAmount: Number(updated.depositAmount),
        status: updated.status as LeaseStatus,
      };
    } catch {
      const idx = inMemoryLeases.findIndex((l) => l.id === id);
      if (idx === -1) return null;
      inMemoryLeases[idx] = {
        ...inMemoryLeases[idx],
        ...data as any,
        updatedAt: new Date(),
      };
      return inMemoryLeases[idx]!;
    }
  }
}

export const leaseRepo = new LeaseRepository();
export const leaseRepository = leaseRepo;
