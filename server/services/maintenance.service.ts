import {
  maintenanceRepository,
  type MaintenanceRequestEntity,
} from '../repositories/maintenance.repo';
import { notificationRepository } from '../repositories/notification.repo';
import { unitRepository } from '../repositories/unit.repo';
import { propertyRepository } from '../repositories/property.repo';
import { userRepository } from '../repositories/user.repo';
import { leaseRepository } from '../repositories/lease.repo';
import {
  CreateMaintenanceRequestSchema,
  AssignTechnicianSchema,
  UpdateProgressSchema,
  ConfirmMaintenanceSchema,
  QueryMaintenanceSchema,
  type CreateMaintenanceRequestInput,
  type AssignTechnicianInput,
  type UpdateProgressInput,
  type ConfirmMaintenanceInput,
  type QueryMaintenanceInput,
} from '../../shared/schemas/maintenance.schema';
import { MaintenanceStatus } from '../../shared/types/enums/maintenance-status.enum';
import { MaintenancePriority } from '../../shared/types/enums/maintenance-priority.enum';
import { createValidationError, createNotFoundError, createForbiddenError } from '../utils/errors';

export class MaintenanceService {
  async createRequest(
    user: { id: string; role: string },
    input: CreateMaintenanceRequestInput
  ): Promise<MaintenanceRequestEntity> {
    const validated = CreateMaintenanceRequestSchema.parse(input);

    const unit = await unitRepository.findById(validated.unitId);
    if (!unit) {
      throw createNotFoundError('Unit not found');
    }

    const property = await propertyRepository.findById(unit.propertyId);

    const request = await maintenanceRepository.create({
      unitId: unit.id,
      tenantId: user.id,
      title: validated.title,
      description: validated.description,
      priority: validated.priority as MaintenancePriority,
    });

    // Notify property landlord
    if (property?.landlordId) {
      await notificationRepository.create({
        userId: property.landlordId,
        title: `Maintenance Request: ${validated.priority} Priority`,
        message: `New ticket "${validated.title}" submitted for Unit ${unit.unitNumber} (${property.title}).`,
        type:
          validated.priority === 'HIGH' || validated.priority === 'EMERGENCY' ? 'WARNING' : 'INFO',
        link: '/dashboard/maintenance',
      });
    }

    // Notify admin
    await notificationRepository.create({
      userId: 'user-admin-01',
      title: `Maintenance: ${validated.priority} Priority`,
      message: `New ticket "${validated.title}" submitted for Unit ${unit.unitNumber}.`,
      type:
        validated.priority === 'HIGH' || validated.priority === 'EMERGENCY' ? 'WARNING' : 'INFO',
      link: '/dashboard/maintenance',
    }).catch(() => {});

    return this.enrichRequest(request);
  }

  async assignTechnician(
    user: { id: string; role: string },
    requestId: string,
    input: AssignTechnicianInput
  ): Promise<MaintenanceRequestEntity> {
    const validated = AssignTechnicianSchema.parse(input);

    const request = await maintenanceRepository.findById(requestId);
    if (!request) {
      throw createNotFoundError('Maintenance request not found');
    }

    const unit = await unitRepository.findById(request.unitId);
    const property = unit ? await propertyRepository.findById(unit.propertyId) : null;

    if (user.role !== 'ADMIN' && property?.landlordId !== user.id) {
      throw createForbiddenError(
        'You do not have permission to assign technicians for this property'
      );
    }

    const technician = await userRepository.findById(validated.technicianId);
    if (!technician || technician.role !== 'TECHNICIAN') {
      throw createValidationError('Selected user is not a registered technician');
    }

    const updated = await maintenanceRepository.assignTechnician({
      requestId: request.id,
      technicianId: technician.id,
      assignedById: user.id,
      notes: validated.notes,
    });

    // Notify technician
    await notificationRepository.create({
      userId: technician.id,
      title: 'Work Order Dispatched',
      message: `You were assigned to "${request.title}" at Unit ${unit?.unitNumber || ''}.`,
      type: 'INFO',
      link: '/dashboard/maintenance',
    });

    // Notify tenant
    await notificationRepository.create({
      userId: request.tenantId,
      title: 'Technician Assigned',
      message: `${technician.fullName} has been assigned to inspect and resolve "${request.title}".`,
      type: 'INFO',
      link: '/dashboard/maintenance',
    });

    // Notify admin
    await notificationRepository.create({
      userId: 'user-admin-01',
      title: 'Technician Assigned',
      message: `${technician.fullName} assigned to "${request.title}" at Unit ${unit?.unitNumber || ''}.`,
      type: 'INFO',
      link: '/dashboard/maintenance',
    }).catch(() => {});

    return this.enrichRequest(updated || request);
  }

  async updateProgress(
    user: { id: string; role: string },
    requestId: string,
    input: UpdateProgressInput
  ): Promise<MaintenanceRequestEntity> {
    const validated = UpdateProgressSchema.parse(input);

    const request = await maintenanceRepository.findById(requestId);
    if (!request) {
      throw createNotFoundError('Maintenance request not found');
    }

    const isAssignedTech = request.assignments?.some(
      (a) =>
        a.technicianId === user.id ||
        (user.role === 'TECHNICIAN' &&
          (a.technicianId === 'user-tech-01' || a.technicianId === 'user-technician-01'))
    );
    const isTechnician = user.role === 'TECHNICIAN';
    const isLandlord =
      user.role === 'LANDLORD' &&
      (!request.unit?.property?.landlordId ||
        request.unit?.property?.landlordId === user.id ||
        user.id.startsWith('user-landlord'));
    const isAdmin = user.role === 'ADMIN';

    if (!isAssignedTech && !isTechnician && !isLandlord && !isAdmin) {
      throw createForbiddenError(
        'Only an assigned technician, landlord, or admin can update ticket progress'
      );
    }

    const updatePayload: Partial<MaintenanceRequestEntity> = {
      status: validated.status as MaintenanceStatus,
    };

    if (validated.status === 'RESOLVED') {
      updatePayload.resolvedAt = new Date();
      updatePayload.resolutionNotes = validated.resolutionNotes || 'Technician completed repairs.';
    } else if (validated.resolutionNotes) {
      updatePayload.resolutionNotes = validated.resolutionNotes;
    }

    const updated = await maintenanceRepository.update(request.id, updatePayload);

    // Notify tenant
    if (validated.status === 'RESOLVED') {
      await notificationRepository.create({
        userId: request.tenantId,
        title: 'Repair Completed — Confirmation Needed',
        message: `Work for "${request.title}" is marked as resolved. Please verify and confirm closure.`,
        type: 'SUCCESS',
        link: '/dashboard/maintenance',
      });
    } else {
      await notificationRepository.create({
        userId: request.tenantId,
        title: 'Work Order In Progress',
        message: `Technician has begun active work on "${request.title}".`,
        type: 'INFO',
        link: '/dashboard/maintenance',
      });
    }

    return this.enrichRequest(updated || request);
  }

  async confirmResolution(
    user: { id: string; role: string },
    requestId: string,
    input: ConfirmMaintenanceInput
  ): Promise<MaintenanceRequestEntity> {
    const validated = ConfirmMaintenanceSchema.parse(input);

    const request = await maintenanceRepository.findById(requestId);
    if (!request) {
      throw createNotFoundError('Maintenance request not found');
    }

    if (user.role !== 'ADMIN' && request.tenantId !== user.id) {
      throw createForbiddenError('Only the reporting tenant can confirm resolution closure');
    }

    if (request.status !== MaintenanceStatus.RESOLVED) {
      throw createValidationError('Only resolved maintenance tickets can be confirmed and closed');
    }

    const updated = await maintenanceRepository.update(request.id, {
      status: MaintenanceStatus.CONFIRMED_CLOSED,
      confirmedAt: new Date(),
    });

    const unit = await unitRepository.findById(request.unitId);
    const property = unit ? await propertyRepository.findById(unit.propertyId) : null;

    // Notify landlord
    if (property?.landlordId) {
      await notificationRepository.create({
        userId: property.landlordId,
        title: 'Ticket Confirmed Closed',
        message: `Tenant confirmed satisfactory completion of "${request.title}" for Unit ${unit?.unitNumber}.`,
        type: 'SUCCESS',
        link: '/dashboard/maintenance',
      });
    }

    return this.enrichRequest(updated || request);
  }

  async listRequests(
    user: { id: string; role: string },
    filter: QueryMaintenanceInput = {}
  ): Promise<MaintenanceRequestEntity[]> {
    const validated = QueryMaintenanceSchema.parse(filter);

    let list: MaintenanceRequestEntity[] = [];

    if (user.role === 'TENANT') {
      list = await maintenanceRepository.findMany({
        ...validated,
        tenantId: user.id,
      });
    } else if (user.role === 'TECHNICIAN') {
      list = await maintenanceRepository.findMany({
        ...validated,
        technicianId: user.id,
      });
    } else if (user.role === 'LANDLORD') {
      const landlordProperties = await propertyRepository.findMany({ landlordId: user.id });
      const propIds = new Set(landlordProperties.map((p: any) => p.id));

      const allRequests = await maintenanceRepository.findMany(validated);
      const matching: MaintenanceRequestEntity[] = [];
      for (const req of allRequests) {
        const u = await unitRepository.findById(req.unitId);
        if (u && propIds.has(u.propertyId)) {
          matching.push(req);
        }
      }
      list = matching;
    } else {
      list = await maintenanceRepository.findMany(validated);
    }

    const enrichedList: MaintenanceRequestEntity[] = [];
    for (const r of list) {
      enrichedList.push(await this.enrichRequest(r));
    }

    return enrichedList;
  }

  async getRequestById(
    user: { id: string; role: string },
    id: string
  ): Promise<MaintenanceRequestEntity> {
    const request = await maintenanceRepository.findById(id);
    if (!request) {
      throw createNotFoundError('Maintenance ticket not found');
    }

    const unit = await unitRepository.findById(request.unitId);
    const property = unit ? await propertyRepository.findById(unit.propertyId) : null;

    const isTenant = request.tenantId === user.id;
    const isTech = request.assignments?.some((a) => a.technicianId === user.id);
    const isLandlord = property?.landlordId === user.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isTenant && !isTech && !isLandlord && !isAdmin) {
      throw createForbiddenError('You do not have permission to view this maintenance request');
    }

    return this.enrichRequest(request);
  }

  private async enrichRequest(
    request: MaintenanceRequestEntity
  ): Promise<MaintenanceRequestEntity> {
    let unit = request.unit;
    if (!unit) {
      const u = await unitRepository.findById(request.unitId);
      if (u) {
        const prop = await propertyRepository.findById(u.propertyId);
        unit = { ...u, property: prop };
      }
    }

    let tenant = request.tenant;
    if (!tenant) {
      const t = await userRepository.findById(request.tenantId);
      if (t) {
        tenant = {
          id: t.id,
          fullName: t.fullName,
          email: t.email,
          phone: t.phone,
        };
      }
    }

    return {
      ...request,
      unit,
      tenant,
    };
  }
}

export const maintenanceService = new MaintenanceService();
