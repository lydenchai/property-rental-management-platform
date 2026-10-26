import { prisma } from '../utils/db';

export interface AuditLogEntity {
  id: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: any | null;
  newValues?: any | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
  user?: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}

const inMemoryAuditLogs: AuditLogEntity[] = [
  {
    id: 'audit-001',
    userId: 'user-admin-01',
    action: 'AUTH_LOGIN',
    entityType: 'User',
    entityId: 'user-admin-01',
    oldValues: null,
    newValues: { session: 'session-01', ip: '127.0.0.1' },
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    createdAt: new Date('2026-02-12T08:30:00Z'),
    user: {
      id: 'user-admin-01',
      fullName: 'System Administrator',
      email: 'admin@rentease.com',
      role: 'ADMIN',
    },
  },
  {
    id: 'audit-002',
    userId: 'user-landlord-01',
    action: 'APPLICATION_APPROVED',
    entityType: 'RentalApplication',
    entityId: 'app-sample-02',
    oldValues: { status: 'PENDING' },
    newValues: { status: 'APPROVED', unitStatus: 'RESERVED' },
    ipAddress: '192.168.1.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    createdAt: new Date('2026-02-12T09:15:00Z'),
    user: {
      id: 'user-landlord-01',
      fullName: 'Marcus Sterling',
      email: 'landlord@rentease.com',
      role: 'LANDLORD',
    },
  },
  {
    id: 'audit-003',
    userId: 'user-tenant-01',
    action: 'LEASE_SIGNED',
    entityType: 'Lease',
    entityId: 'lease-skyline-101a',
    oldValues: { status: 'PENDING_SIGNATURES', tenantSignedAt: null },
    newValues: { status: 'ACTIVE', unitStatus: 'OCCUPIED' },
    ipAddress: '10.0.0.12',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    createdAt: new Date('2026-02-12T10:00:00Z'),
    user: {
      id: 'user-tenant-01',
      fullName: 'Sarah Jenkins',
      email: 'tenant@rentease.com',
      role: 'TENANT',
    },
  },
  {
    id: 'audit-004',
    userId: 'user-tenant-01',
    action: 'PAYMENT_RECORDED',
    entityType: 'PaymentRecord',
    entityId: 'pmt-sample-000',
    oldValues: { invoiceAmountPaid: 0, invoiceStatus: 'UNPAID' },
    newValues: { paymentAmount: 1650, invoiceStatus: 'PAID' },
    ipAddress: '10.0.0.12',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    createdAt: new Date('2026-02-12T11:45:00Z'),
    user: {
      id: 'user-tenant-01',
      fullName: 'Sarah Jenkins',
      email: 'tenant@rentease.com',
      role: 'TENANT',
    },
  },
  {
    id: 'audit-005',
    userId: 'user-landlord-01',
    action: 'MAINTENANCE_DISPATCHED',
    entityType: 'MaintenanceRequest',
    entityId: 'maint-sample-01',
    oldValues: { status: 'OPEN' },
    newValues: { status: 'ASSIGNED', technicianId: 'user-tech-01' },
    ipAddress: '192.168.1.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    createdAt: new Date('2026-02-12T14:30:00Z'),
    user: {
      id: 'user-landlord-01',
      fullName: 'Marcus Sterling',
      email: 'landlord@rentease.com',
      role: 'LANDLORD',
    },
  },
  {
    id: 'audit-006',
    userId: 'user-tech-01',
    action: 'MAINTENANCE_RESOLVED',
    entityType: 'MaintenanceRequest',
    entityId: 'maint-sample-01',
    oldValues: { status: 'IN_PROGRESS' },
    newValues: { status: 'RESOLVED', resolutionNotes: 'Replaced AC capacitor.' },
    ipAddress: '172.16.0.8',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    createdAt: new Date('2026-02-12T16:20:00Z'),
    user: {
      id: 'user-tech-01',
      fullName: 'Alex Rivers',
      email: 'alex.rivers@rentease.com',
      role: 'TECHNICIAN',
    },
  },
];

export class AuditLogRepository {
  async log(data: {
    userId?: string | null;
    action: string;
    entityType: string;
    entityId: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string | null;
    userAgent?: string | null;
  }): Promise<AuditLogEntity> {
    try {
      const created = await prisma.auditLog.create({
        data: {
          userId: data.userId || null,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          oldValues: data.oldValues || null,
          newValues: data.newValues || null,
          ipAddress: data.ipAddress || null,
          userAgent: data.userAgent || null,
        },
        include: {
          user: {
            select: { id: true, fullName: true, email: true, role: true },
          },
        },
      });

      return {
        ...created,
        user: created.user
          ? {
              ...created.user,
              role: created.user.role as string,
            }
          : undefined,
      };
    } catch {
      const entry: AuditLogEntity = {
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        userId: data.userId || null,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        oldValues: data.oldValues || null,
        newValues: data.newValues || null,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
        createdAt: new Date(),
      };

      inMemoryAuditLogs.unshift(entry);
      return entry;
    }
  }

  async findMany(
    filter: {
      userId?: string;
      action?: string;
      entityType?: string;
      search?: string;
    } = {}
  ): Promise<AuditLogEntity[]> {
    try {
      const where: any = {};
      if (filter.userId) where.userId = filter.userId;
      if (filter.action) where.action = filter.action;
      if (filter.entityType) where.entityType = filter.entityType;

      const list = await prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, fullName: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return list.map((l) => ({
        ...l,
        user: l.user
          ? {
              ...l.user,
              role: l.user.role as string,
            }
          : undefined,
      }));
    } catch {
      let filtered = [...inMemoryAuditLogs];
      if (filter.userId) {
        filtered = filtered.filter((l) => l.userId === filter.userId);
      }
      if (filter.action) {
        filtered = filtered.filter((l) => l.action.toLowerCase() === filter.action!.toLowerCase());
      }
      if (filter.entityType) {
        filtered = filtered.filter(
          (l) => l.entityType.toLowerCase() === filter.entityType!.toLowerCase()
        );
      }
      if (filter.search) {
        const q = filter.search.toLowerCase();
        filtered = filtered.filter(
          (l) =>
            l.action.toLowerCase().includes(q) ||
            l.entityType.toLowerCase().includes(q) ||
            l.entityId.toLowerCase().includes(q) ||
            l.user?.fullName.toLowerCase().includes(q) ||
            l.user?.email.toLowerCase().includes(q)
        );
      }
      return filtered;
    }
  }
}

export const auditLogRepo = new AuditLogRepository();
export const auditLogRepository = auditLogRepo;
