import type { MaintenanceStatus } from './enums/maintenance-status.enum';
import type { MaintenancePriority } from './enums/maintenance-priority.enum';

export interface MaintenanceRequestDetail {
  id: string;
  unitId: string;
  tenantId: string;
  title: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  requestedAt: string;
  resolvedAt?: string | null;
  confirmedAt?: string | null;
  resolutionNotes?: string | null;
  technicianName?: string | null;
  createdAt: string;
}

export interface MaintenanceItem {
  id: string;
  unitId: string;
  tenantId: string;
  title: string;
  description: string;
  priority: MaintenancePriority | string;
  status: MaintenanceStatus | string;
  requestedAt: string;
  resolvedAt: string | null;
  confirmedAt: string | null;
  resolutionNotes: string | null;
  createdAt: string;
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
  tenant?: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
  };
  assignments?: Array<{
    id: string;
    technicianId: string;
    assignedAt: string;
    notes: string | null;
    technician?: {
      id: string;
      fullName: string;
      email: string;
    };
  }>;
}

export interface CreateMaintenanceInput {
  unitId: string;
  title: string;
  description: string;
  priority: MaintenancePriority | string;
}

export interface AssignTechnicianInput {
  technicianId: string;
  notes?: string;
}

export interface UpdateProgressInput {
  status: MaintenanceStatus | string;
  resolutionNotes?: string;
}

export interface ConfirmResolutionInput {
  confirmed: boolean;
  feedback?: string;
}
