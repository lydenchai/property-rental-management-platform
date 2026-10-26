export const UserRole = {
  ADMIN: 'ADMIN',
  LANDLORD: 'LANDLORD',
  TENANT: 'TENANT',
  TECHNICIAN: 'TECHNICIAN',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
