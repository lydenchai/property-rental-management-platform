import { H3Event } from 'h3';
import { UserRole } from '../../shared/types/enums/user-role.enum';
import { unauthorizedError, forbiddenError } from './errors';

export interface AuthContext {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: string;
}

declare module 'h3' {
  interface H3EventContext {
    user?: AuthContext;
    sessionId?: string;
  }
}

export function requireAuth(event: H3Event): AuthContext {
  const user = event.context.user;
  if (!user) {
    throw unauthorizedError('You must be logged in to access this resource');
  }
  if (user.status === 'SUSPENDED') {
    throw forbiddenError('Your account has been suspended. Please contact support.');
  }
  return user;
}

export function requireRole(event: H3Event, allowedRoles: UserRole[]): AuthContext {
  const user = requireAuth(event);
  if (!allowedRoles.includes(user.role)) {
    throw forbiddenError(`Access restricted to: ${allowedRoles.join(', ')}`);
  }
  return user;
}
