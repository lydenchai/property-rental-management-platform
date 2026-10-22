import { defineEventHandler, getRouterParam, readBody } from 'h3';
import { propertyService } from '../../../../services/property.service';
import { requireRole } from '../../../../utils/permissions';
import { UserRole } from '../../../../../shared/types/enums/user-role.enum';
import { createApiResponse, handleApiError, badRequestError } from '../../../../utils/errors';

export default defineEventHandler(async (event) => {
  try {
    const user = requireRole(event, [UserRole.LANDLORD, UserRole.ADMIN]);
    const propertyId = getRouterParam(event, 'id');
    if (!propertyId) throw badRequestError('Property ID is required');

    const body = await readBody(event);
    const created = await propertyService.addUnit(propertyId, user, body);

    return createApiResponse({
      unit: created,
      message: 'Unit created successfully',
    });
  } catch (error) {
    return handleApiError(event, error);
  }
});
