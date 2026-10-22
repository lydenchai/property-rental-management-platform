import { defineEventHandler, readBody } from 'h3';
import { maintenanceService } from '../../../services/maintenance.service';
import { requireAuth } from '../../../utils/permissions';
import { createApiResponse, handleApiError } from '../../../utils/errors';

export default defineEventHandler(async (event) => {
  try {
    const user = requireAuth(event);
    const body = await readBody(event);
    const request = await maintenanceService.createRequest(user, body);

    return createApiResponse({
      request,
      message: 'Maintenance ticket submitted successfully',
    });
  } catch (error) {
    return handleApiError(event, error);
  }
});
