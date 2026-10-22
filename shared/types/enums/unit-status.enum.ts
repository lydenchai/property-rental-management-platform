export const UnitStatus = {
    AVAILABLE: "AVAILABLE",
    RESERVED: "RESERVED",
    OCCUPIED: "OCCUPIED",
    MAINTENANCE: "MAINTENANCE",
    UNDER_RENOVATION: "UNDER_RENOVATION",
} as const;

export type UnitStatus = (typeof UnitStatus)[keyof typeof UnitStatus]