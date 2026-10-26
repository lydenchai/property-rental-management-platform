import { UserRole } from './enums/user-role.enum';
import { UserStatus } from './enums/user-status.enum';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerifiedAt?: string | null;
  createdAt: string;
}

export interface SessionData {
  userId: string;
  role: UserRole;
  email: string;
}
