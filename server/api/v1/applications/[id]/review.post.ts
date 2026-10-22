import { defineEventHandler, getRouterParam, readBody } from 'h3';
import { leaseService } from '../../../../services/lease.service';
import { requireRole } from '../../../../utils/permissions';
import { UserRole } from '../../../../../shared/types/enums/user-role.enum';
import { createApiResponse, handleApiError, badRequestError } from '../../../../utils/errors';

export default defineEventHandler(async (event) => {
  try {
    const reviewer = requireRole(event, [UserRole.LANDLORD, UserRole.ADMIN]);
    const id = getRouterParam(event, 'id');
    if (!id) throw badRequestError('Application ID is required');

    const body = await readBody(event);
    const result = await leaseService.reviewApplication(id, reviewer, body);

    return createApiResponse(result);
  } catch (error) {
    return handleApiError(event, error);
  }
});
