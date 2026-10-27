import { defineEventHandler, readBody } from 'h3';
import { maintenanceService } from '../../../../services/maintenance.service';
import { requireRole } from '../../../../utils/permissions';
import { UserRole } from '../../../../../shared/types/enums/user-role.enum';
import { createApiResponse, handleApiError, createValidationError } from '../../../../utils/errors';

export default defineEventHandler(async (event) => {
  try {
    const user = requireRole(event, [
      UserRole.TECHNICIAN,
      UserRole.LANDLORD,
      UserRole.ADMIN,
    ]);
    const id = event.context.params?.id;

    if (!id) {
      throw createValidationError('Maintenance request ID is required');
    }

    const body = await readBody(event);
    const request = await maintenanceService.updateProgress(user, id, body);

    return createApiResponse({
      request,
      message: 'Maintenance progress updated successfully',
    });
  } catch (error) {
    return handleApiError(event, error);
  }
});
