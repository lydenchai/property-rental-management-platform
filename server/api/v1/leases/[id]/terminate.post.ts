import { defineEventHandler, getRouterParam } from 'h3';
import { leaseService } from '../../../../services/lease.service';
import { requireRole } from '../../../../utils/permissions';
import { UserRole } from '../../../../../shared/types/enums/user-role.enum';
import { createApiResponse, handleApiError, badRequestError } from '../../../../utils/errors';

export default defineEventHandler(async (event) => {
  try {
    const user = requireRole(event, [UserRole.LANDLORD, UserRole.ADMIN]);
    const id = getRouterParam(event, 'id');
    if (!id) throw badRequestError('Lease ID is required');

    const result = await leaseService.terminateLease(id, user);
    return createApiResponse(result);
  } catch (error) {
    return handleApiError(event, error);
  }
});
