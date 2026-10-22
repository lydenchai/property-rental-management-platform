import { defineEventHandler, readBody } from 'h3';
import { propertyService } from '../../../services/property.service';
import { requireRole } from '../../../utils/permissions';
import { UserRole } from '../../../../shared/types/enums/user-role.enum';
import { createApiResponse, handleApiError } from '../../../utils/errors';

export default defineEventHandler(async (event) => {
  try {
    const user = requireRole(event, [UserRole.LANDLORD, UserRole.ADMIN]);
    const body = await readBody(event);
    const created = await propertyService.createProperty(user, body);

    return createApiResponse({
      property: created,
      message: 'Property created successfully',
    });
  } catch (error) {
    return handleApiError(event, error);
  }
});
