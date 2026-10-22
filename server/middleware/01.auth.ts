import { defineEventHandler } from 'h3';
import { getSessionCookie } from '../utils/session';
import { userRepo } from '../repositories/user.repo';
import { UserRole } from '~~/shared/types/enums/user-role.enum';

export default defineEventHandler(async (event) => {
  const sessionId = getSessionCookie(event);
  if (!sessionId) {
    return;
  }

  try {
    const session = await userRepo.findSession(sessionId);
    if (!session || !session.user) {
      return;
    }

    if (new Date(session.expiresAt) < new Date()) {
      // Session has expired, remove it asynchronously
      await userRepo.deleteSession(sessionId).catch(() => {});
      return;
    }

    event.context.sessionId = session.id;
    event.context.user = {
      id: session.user.id,
      email: session.user.email,
      fullName: session.user.fullName,
      role: session.user.role as UserRole,
      status: session.user.status,
    };
  } catch (error) {
    // If an unexpected error occurs, gracefully continue unauthenticated
    console.error('Session middleware error:', error);
  }
});
