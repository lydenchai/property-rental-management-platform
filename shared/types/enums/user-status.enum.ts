export const UserStatus = {
    ACTIVE: "ACTIVE",
    SUSPENDED: "SUSPENDED",
    PENDING_VERIFICATION: "PENDING_VERIFICATION",
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus]