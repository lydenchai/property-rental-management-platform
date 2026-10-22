import { defineEventHandler, getRouterParam } from 'h3';
import { leaseService } from '../../../../services/lease.service';
import { requireAuth } from '../../../../utils/permissions';
import { createApiResponse, handleApiError, badRequestError } from '../../../../utils/errors';

export default defineEventHandler(async (event) => {
  try {
    const user = requireAuth(event);
    const id = getRouterParam(event, 'id');
    if (!id) throw badRequestError('Lease ID is required');

    const lease = await leaseService.getLease(id, user);
    return createApiResponse({ lease });
  } catch (error) {
    return handleApiError(event, error);
  }
});
