import { prisma } from '../utils/db';
import { MaintenancePriority } from '../../shared/types/enums/maintenance-priority.enum';
import { MaintenanceStatus } from '../../shared/types/enums/maintenance-status.enum';

export interface MaintenanceRequestEntity {
  id: string;
  unitId: string;
  tenantId: string;
  title: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  requestedAt: Date;
  resolvedAt: Date | null;
  confirmedAt: Date | null;
  resolutionNotes: string | null;
  feedback?: string | null;
  createdAt: Date;
  updatedAt: Date;
  unit?: any;
  tenant?: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
  };
  assignments?: Array<{
    id: string;
    requestId: string;
    technicianId: string;
    assignedById: string;
    assignedAt: Date;
    status: string;
    notes: string | null;
    technician?: {
      id: string;
      fullName: string;
      email: string;
      phone?: string | null;
    };
    assignedBy?: {
      id: string;
      fullName: string;
    };
  }>;
}

const inMemoryMaintenanceRequests: MaintenanceRequestEntity[] = [
  {
    id: 'maint-sample-01',
    unitId: 'unit-skyline-101a',
    tenantId: 'user-tenant-01',
    title: 'HVAC Air Conditioning Not Cooling',
    description:
      'The master bedroom cooling unit is blowing ambient temperature air during afternoon hours.',
    priority: MaintenancePriority.HIGH,
    status: MaintenanceStatus.ASSIGNED,
    requestedAt: new Date('2026-02-10T14:30:00Z'),
    resolvedAt: null,
    confirmedAt: null,
    resolutionNotes: null,
    createdAt: new Date('2026-02-10T14:30:00Z'),
    updatedAt: new Date('2026-02-10T15:00:00Z'),
    tenant: {
      id: 'user-tenant-01',
      fullName: 'Sophea Kem',
      email: 'tenant@rentease.com',
      phone: '+855 12 345 102',
    },
    assignments: [
      {
        id: 'assign-01',
        requestId: 'maint-sample-01',
        technicianId: 'user-tech-01',
        assignedById: 'user-landlord-01',
        assignedAt: new Date('2026-02-10T15:00:00Z'),
        status: 'ASSIGNED',
        notes: 'Please check refrigerant levels and compressor capacitor.',
        technician: {
          id: 'user-tech-01',
          fullName: 'Alex Rivers',
          email: 'technician@example.com',
          phone: '+1 (555) 876-5432',
        },
      },
    ],
  },
];

export class MaintenanceRepository {
  async create(data: {
    unitId: string;
    tenantId: string;
    title: string;
    description: string;
    priority?: MaintenancePriority;
  }): Promise<MaintenanceRequestEntity> {
    try {
      const created = await prisma.maintenanceRequest.create({
        data: {
          unitId: data.unitId,
          tenantId: data.tenantId,
          title: data.title,
          description: data.description,
          priority: (data.priority as any) || MaintenancePriority.MEDIUM,
          status: MaintenanceStatus.OPEN as any,
        },
        include: {
          unit: { include: { property: true } },
          tenant: { select: { id: true, fullName: true, email: true, phone: true } },
          assignments: {
            include: {
              technician: { select: { id: true, fullName: true, email: true } },
              assignedBy: { select: { id: true, fullName: true } },
            },
          },
        },
      });

      return {
        ...created,
        priority: created.priority as MaintenancePriority,
        status: created.status as MaintenanceStatus,
      };
    } catch {
      const newRequest: MaintenanceRequestEntity = {
        id: `maint-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        unitId: data.unitId,
        tenantId: data.tenantId,
        title: data.title,
        description: data.description,
        priority: data.priority || MaintenancePriority.MEDIUM,
        status: MaintenanceStatus.OPEN,
        requestedAt: new Date(),
        resolvedAt: null,
        confirmedAt: null,
        resolutionNotes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        assignments: [],
      };

      inMemoryMaintenanceRequests.unshift(newRequest);
      return newRequest;
    }
  }

  async findById(id: string): Promise<MaintenanceRequestEntity | null> {
    try {
      const request = await prisma.maintenanceRequest.findUnique({
        where: { id },
        include: {
          unit: { include: { property: true } },
          tenant: { select: { id: true, fullName: true, email: true, phone: true } },
          assignments: {
            include: {
              technician: { select: { id: true, fullName: true, email: true } },
              assignedBy: { select: { id: true, fullName: true } },
            },
          },
        },
      });

      if (!request) return null;
      return {
        ...request,
        priority: request.priority as MaintenancePriority,
        status: request.status as MaintenanceStatus,
      };
    } catch {
      const found = inMemoryMaintenanceRequests.find((r) => r.id === id);
      return found ? { ...found } : null;
    }
  }

  async findMany(
    filter: {
      unitId?: string;
      tenantId?: string;
      technicianId?: string;
      status?: MaintenanceStatus;
      priority?: MaintenancePriority;
    } = {}
  ): Promise<MaintenanceRequestEntity[]> {
    try {
      const where: any = {};
      if (filter.unitId) where.unitId = filter.unitId;
      if (filter.tenantId) where.tenantId = filter.tenantId;
      if (filter.status) where.status = filter.status;
      if (filter.priority) where.priority = filter.priority;
      if (filter.technicianId) {
        where.assignments = {
          some: { technicianId: filter.technicianId },
        };
      }

      const list = await prisma.maintenanceRequest.findMany({
        where,
        include: {
          unit: { include: { property: true } },
          tenant: { select: { id: true, fullName: true, email: true, phone: true } },
          assignments: {
            include: {
              technician: { select: { id: true, fullName: true, email: true } },
              assignedBy: { select: { id: true, fullName: true } },
            },
          },
        },
        orderBy: { requestedAt: 'desc' },
      });

      return list.map((r: any) => ({
        ...r,
        priority: r.priority as MaintenancePriority,
        status: r.status as MaintenanceStatus,
      }));
    } catch {
      let filtered = [...inMemoryMaintenanceRequests];
      if (filter.unitId) {
        filtered = filtered.filter((r) => r.unitId === filter.unitId);
      }
      if (filter.tenantId) {
        filtered = filtered.filter((r) => r.tenantId === filter.tenantId);
      }
      if (filter.status) {
        filtered = filtered.filter((r) => r.status === filter.status);
      }
      if (filter.priority) {
        filtered = filtered.filter((r) => r.priority === filter.priority);
      }
      if (filter.technicianId) {
        filtered = filtered.filter((r) =>
          r.assignments?.some((a) => a.technicianId === filter.technicianId)
        );
      }
      return filtered;
    }
  }

  async assignTechnician(data: {
    requestId: string;
    technicianId: string;
    assignedById: string;
    notes?: string | null;
  }): Promise<MaintenanceRequestEntity | null> {
    try {
      await prisma.maintenanceAssignment.create({
        data: {
          requestId: data.requestId,
          technicianId: data.technicianId,
          assignedById: data.assignedById,
          notes: data.notes || null,
        },
      });

      const updated = await prisma.maintenanceRequest.update({
        where: { id: data.requestId },
        data: { status: MaintenanceStatus.ASSIGNED as any },
        include: {
          unit: { include: { property: true } },
          tenant: { select: { id: true, fullName: true, email: true, phone: true } },
          assignments: {
            include: {
              technician: { select: { id: true, fullName: true, email: true } },
              assignedBy: { select: { id: true, fullName: true } },
            },
          },
        },
      });

      return {
        ...updated,
        priority: updated.priority as MaintenancePriority,
        status: updated.status as MaintenanceStatus,
      };
    } catch {
      const idx = inMemoryMaintenanceRequests.findIndex((r) => r.id === data.requestId);
      if (idx === -1) return null;

      const newAssignment = {
        id: `assign-${Date.now()}`,
        requestId: data.requestId,
        technicianId: data.technicianId,
        assignedById: data.assignedById,
        assignedAt: new Date(),
        status: 'ASSIGNED',
        notes: data.notes || null,
      };

      if (!inMemoryMaintenanceRequests[idx]!.assignments) {
        inMemoryMaintenanceRequests[idx]!.assignments = [];
      }
      inMemoryMaintenanceRequests[idx]!.assignments.push(newAssignment);
      inMemoryMaintenanceRequests[idx]!.status = MaintenanceStatus.ASSIGNED;
      inMemoryMaintenanceRequests[idx]!.updatedAt = new Date();

      return { ...inMemoryMaintenanceRequests[idx]! };
    }
  }

  async update(
    id: string,
    data: Partial<MaintenanceRequestEntity>
  ): Promise<MaintenanceRequestEntity | null> {
    try {
      const payload: any = {};
      if (data.status) payload.status = data.status as any;
      if (data.priority) payload.priority = data.priority as any;
      if (data.resolutionNotes !== undefined) payload.resolutionNotes = data.resolutionNotes;
      if (data.resolvedAt !== undefined) payload.resolvedAt = data.resolvedAt;
      if (data.confirmedAt !== undefined) payload.confirmedAt = data.confirmedAt;

      const updated = await prisma.maintenanceRequest.update({
        where: { id },
        data: payload,
        include: {
          unit: { include: { property: true } },
          tenant: { select: { id: true, fullName: true, email: true, phone: true } },
          assignments: {
            include: {
              technician: { select: { id: true, fullName: true, email: true } },
              assignedBy: { select: { id: true, fullName: true } },
            },
          },
        },
      });

      return {
        ...updated,
        priority: updated.priority as MaintenancePriority,
        status: updated.status as MaintenanceStatus,
      };
    } catch {
      const idx = inMemoryMaintenanceRequests.findIndex((r) => r.id === id);
      if (idx === -1) return null;

      inMemoryMaintenanceRequests[idx] = {
        ...inMemoryMaintenanceRequests[idx]!,
        ...data,
        updatedAt: new Date(),
      };

      return { ...inMemoryMaintenanceRequests[idx]! };
    }
  }
}

export const maintenanceRepo = new MaintenanceRepository();
export const maintenanceRepository = maintenanceRepo;
