export const MaintenanceStatus = {
    OPEN: "OPEN",
    ASSIGNED: "ASSIGNED",
    IN_PROGRESS: "IN_PROGRESS",
    RESOLVED: "RESOLVED",
    CONFIRMED_CLOSED: "CONFIRMED_CLOSED",
    CANCELLED: "CANCELLED",
} as const;

export type MaintenanceStatus = (typeof MaintenanceStatus)[keyof typeof MaintenanceStatus]