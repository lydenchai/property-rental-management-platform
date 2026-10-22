import { defineEventHandler, readBody, getRequestHeader, getRequestIP } from 'h3';
import { RegisterInputSchema } from '../../../../shared/schemas/auth.schema';
import { authService } from '../../../services/auth.service';
import { setSessionCookie } from '../../../utils/session';
import { createApiResponse, handleApiError } from '../../../utils/errors';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const validatedInput = RegisterInputSchema.parse(body);

    const userAgent = getRequestHeader(event, 'user-agent');
    const ipAddress = getRequestIP(event, { xForwardedFor: true });

    const { user, sessionId } = await authService.register(validatedInput, {
      ipAddress,
      userAgent,
    });

    setSessionCookie(event, sessionId);

    return createApiResponse({
      user,
      message: 'Account registered successfully',
    });
  } catch (error) {
    return handleApiError(event, error);
  }
});
