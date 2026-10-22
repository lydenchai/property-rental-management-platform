
import { MaintenanceStatus } from "./enums/maintenance-status.enum";
import { MaintenancePriority } from "./enums/maintenance-priority.enum";

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
