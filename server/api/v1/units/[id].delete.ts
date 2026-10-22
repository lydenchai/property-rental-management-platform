import { defineEventHandler, getRouterParam } from 'h3';
import { propertyService } from '../../../services/property.service';
import { requireRole } from '../../../utils/permissions';
import { UserRole } from '../../../../shared/types/enums/user-role.enum';
import { createApiResponse, handleApiError, badRequestError } from '../../../utils/errors';

export default defineEventHandler(async (event) => {
  try {
    const user = requireRole(event, [UserRole.LANDLORD, UserRole.ADMIN]);
    const id = getRouterParam(event, 'id');
    if (!id) throw badRequestError('Unit ID is required');

    await propertyService.deleteUnit(id, user);

    return createApiResponse({
      message: 'Unit deleted successfully',
    });
  } catch (error) {
    return handleApiError(event, error);
  }
});
