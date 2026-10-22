import { defineEventHandler, readBody } from 'h3';
import { maintenanceService } from '../../../../services/maintenance.service';
import { requireAuth } from '../../../../utils/permissions';
import { createApiResponse, handleApiError, createValidationError } from '../../../../utils/errors';

export default defineEventHandler(async (event) => {
  try {
    const user = requireAuth(event);
    const id = event.context.params?.id;

    if (!id) {
      throw createValidationError('Maintenance request ID is required');
    }

    const body = await readBody(event);
    const request = await maintenanceService.confirmResolution(user, id, body || {});

    return createApiResponse({
      request,
      message: 'Resolution confirmed and ticket closed successfully',
    });
  } catch (error) {
    return handleApiError(event, error);
  }
});
