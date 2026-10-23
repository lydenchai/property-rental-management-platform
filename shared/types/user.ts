import type { UserRole } from './enums/user-role.enum';
import type { UserStatus } from './enums/user-status.enum';

export interface UserAccount {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: UserRole | string;
  status: UserStatus | string;
  emailVerifiedAt: string | null;
  createdAt: string;
}

export interface UpdateUserStatusInput {
  status: UserStatus | string;
}
