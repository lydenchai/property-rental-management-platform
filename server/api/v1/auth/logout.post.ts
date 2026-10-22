import { defineEventHandler } from 'h3';
import { authService } from '../../../services/auth.service';
import { getSessionCookie, clearSessionCookie } from '../../../utils/session';
import { createApiResponse, handleApiError } from '../../../utils/errors';

export default defineEventHandler(async (event) => {
  try {
    const sessionId = getSessionCookie(event);
    if (sessionId) {
      await authService.logout(sessionId);
    }
    clearSessionCookie(event);

    return createApiResponse({
      message: 'Logged out successfully',
    });
  } catch (error) {
    return handleApiError(event, error);
  }
});
