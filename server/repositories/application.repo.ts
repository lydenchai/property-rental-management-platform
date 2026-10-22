import { prisma } from '../utils/db';
import { ApplicationStatus } from '../../shared/types/enums/application-status.enum';

export interface ApplicationEntity {
  id: string;
  unitId: string;
  tenantId: string;
  status: ApplicationStatus;
  desiredMoveInDate: Date;
  proposedRent: number;
  employmentDetails: string;
  notes: string | null;
  reviewedById: string | null;
  reviewedAt: Date | null;
  reviewReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  unit?: any;
  tenant?: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
  };
  reviewer?: {
    id: string;
    fullName: string;
  } | null;
  lease?: any;
}

const inMemoryApplications: ApplicationEntity[] = [
  {
    id: 'app-sample-01',
    unitId: 'unit-skyline-204b',
    tenantId: 'user-tenant-01',
    status: ApplicationStatus.PENDING,
    desiredMoveInDate: new Date('2026-11-01T00:00:00Z'),
    proposedRent: 1800,
    employmentDetails: 'Senior Software Architect at Smart Axiata Phnom Penh. Monthly salary $3,200. Clean background check.',
    notes: 'Looking for a quiet top-tier 2-bedroom unit with underground parking in BKK1.',
    reviewedById: null,
    reviewedAt: null,
    reviewReason: null,
    createdAt: new Date('2026-10-15T14:00:00Z'),
    updatedAt: new Date('2026-10-15T14:00:00Z'),
  },
  {
    id: 'app-sample-02',
    unitId: 'unit-skyline-101a',
    tenantId: 'user-tenant-01',
    status: ApplicationStatus.APPROVED,
    desiredMoveInDate: new Date('2026-01-01T00:00:00Z'),
    proposedRent: 1200,
    employmentDetails: 'Fintech Systems Lead at ABA Bank Phnom Penh. Verifiable income documentation on file.',
    notes: 'Initial lease application for Unit 101A.',
    reviewedById: 'user-landlord-01',
    reviewedAt: new Date('2026-01-02T10:00:00Z'),
    reviewReason: 'Background check verified, credit and income qualifications exceeded.',
    createdAt: new Date('2026-01-01T08:00:00Z'),
    updatedAt: new Date('2026-01-02T10:00:00Z'),
  },
];

export class ApplicationRepository {
  async create(data: {
    unitId: string;
    tenantId: string;
    desiredMoveInDate: Date;
    proposedRent: number;
    employmentDetails: string;
    notes?: string | null;
  }): Promise<ApplicationEntity> {
    try {
      const created = await prisma.rentalApplication.create({
        data: {
          unitId: data.unitId,
          tenantId: data.tenantId,
          desiredMoveInDate: data.desiredMoveInDate,
          proposedRent: data.proposedRent,
          employmentDetails: data.employmentDetails,
          notes: data.notes || null,
          status: ApplicationStatus.PENDING,
        },
        include: {
          unit: {
            include: { property: true },
          },
          tenant: {
            select: { id: true, fullName: true, email: true, phone: true },
          },
        },
      });

      return {
        ...created,
        proposedRent: Number(created.proposedRent),
        status: created.status as ApplicationStatus,
      };
    } catch {
      const newApp: ApplicationEntity = {
        id: `app-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        unitId: data.unitId,
        tenantId: data.tenantId,
        status: ApplicationStatus.PENDING,
        desiredMoveInDate: data.desiredMoveInDate,
        proposedRent: data.proposedRent,
        employmentDetails: data.employmentDetails,
        notes: data.notes || null,
        reviewedById: null,
        reviewedAt: null,
        reviewReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryApplications.unshift(newApp);
      return newApp;
    }
  }

  async findById(id: string): Promise<ApplicationEntity | null> {
    try {
      const app = await prisma.rentalApplication.findUnique({
        where: { id },
        include: {
          unit: {
            include: { property: true },
          },
          tenant: {
            select: { id: true, fullName: true, email: true, phone: true },
          },
          reviewer: {
            select: { id: true, fullName: true },
          },
          lease: true,
        },
      });
      if (!app) return null;
      return {
        ...app,
        proposedRent: Number(app.proposedRent),
        status: app.status as ApplicationStatus,
      };
    } catch {
      const found = inMemoryApplications.find((a) => a.id === id);
      return found ? { ...found } : null;
    }
  }

  async findAll(filter: {
    tenantId?: string;
    unitId?: string;
    status?: ApplicationStatus;
  } = {}): Promise<ApplicationEntity[]> {
    try {
      const where: any = {};
      if (filter.tenantId) where.tenantId = filter.tenantId;
      if (filter.unitId) where.unitId = filter.unitId;
      if (filter.status) where.status = filter.status;

      const list = await prisma.rentalApplication.findMany({
        where,
        include: {
          unit: {
            include: { property: true },
          },
          tenant: {
            select: { id: true, fullName: true, email: true, phone: true },
          },
          reviewer: {
            select: { id: true, fullName: true },
          },
          lease: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return list.map((a: any) => ({
        ...a,
        proposedRent: Number(a.proposedRent),
        status: a.status as ApplicationStatus,
      }));
    } catch {
      return inMemoryApplications.filter((a) => {
        if (filter.tenantId && a.tenantId !== filter.tenantId) return false;
        if (filter.unitId && a.unitId !== filter.unitId) return false;
        if (filter.status && a.status !== filter.status) return false;
        return true;
      });
    }
  }

  async findMany(filter: {
    tenantId?: string;
    unitId?: string;
    status?: ApplicationStatus;
  } = {}): Promise<ApplicationEntity[]> {
    return this.findAll(filter);
  }

  async update(id: string, data: Partial<ApplicationEntity>): Promise<ApplicationEntity | null> {
    try {
      const updated = await prisma.rentalApplication.update({
        where: { id },
        data: {
          ...(data.status && { status: data.status as any }),
          ...(data.reviewedById !== undefined && { reviewedById: data.reviewedById }),
          ...(data.reviewedAt !== undefined && { reviewedAt: data.reviewedAt }),
          ...(data.reviewReason !== undefined && { reviewReason: data.reviewReason }),
          ...(data.notes !== undefined && { notes: data.notes }),
        },
      });

      return {
        ...updated,
        proposedRent: Number(updated.proposedRent),
        status: updated.status as ApplicationStatus,
      };
    } catch {
      const idx = inMemoryApplications.findIndex((a) => a.id === id);
      if (idx === -1) return null;
      inMemoryApplications[idx] = {
        ...inMemoryApplications[idx],
        ...(data as any),
        updatedAt: new Date(),
      };
      return inMemoryApplications[idx]!;
    }
  }
}

export const applicationRepo = new ApplicationRepository();
export const applicationRepository = applicationRepo;
