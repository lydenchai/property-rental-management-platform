import { defineEventHandler, readBody, getRequestHeader, getRequestIP } from 'h3';
import { LoginInputSchema } from '../../../../shared/schemas/auth.schema';
import { authService } from '../../../services/auth.service';
import { setSessionCookie } from '../../../utils/session';
import { createApiResponse, handleApiError } from '../../../utils/errors';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const validatedInput = LoginInputSchema.parse(body);

    const userAgent = getRequestHeader(event, 'user-agent');
    const ipAddress = getRequestIP(event, { xForwardedFor: true });

    const { user, sessionId } = await authService.login(validatedInput, {
      ipAddress,
      userAgent,
    });

    setSessionCookie(event, sessionId);

    return createApiResponse({
      user,
      message: 'Login successful',
    });
  } catch (error) {
    return handleApiError(event, error);
  }
});
