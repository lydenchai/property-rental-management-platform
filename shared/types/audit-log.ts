import type { UserRole } from './enums/user-role.enum';

export interface AuditLogItem {
  id: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: any | null;
  newValues?: any | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    role: UserRole | string;
  };
}

export interface AuditLogFilterParams {
  action?: string;
  entityType?: string;
  search?: string;
}
