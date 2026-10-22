import { defineEventHandler } from 'h3';
import { requireAuth } from '../../../utils/permissions';
import { authService } from '../../../services/auth.service';
import { createApiResponse, handleApiError } from '../../../utils/errors';

export default defineEventHandler(async (event) => {
  try {
    const authUser = requireAuth(event);
    const profile = await authService.getProfile(authUser.id);

    return createApiResponse({
      user: profile,
    });
  } catch (error) {
    return handleApiError(event, error);
  }
});
