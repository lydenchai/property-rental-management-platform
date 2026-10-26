export const MaintenancePriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  EMERGENCY: 'EMERGENCY',
} as const;

export type MaintenancePriority = (typeof MaintenancePriority)[keyof typeof MaintenancePriority];
