import { defineEventHandler, getQuery } from 'h3';
import { leaseService } from '../../../services/lease.service';
import { requireAuth } from '../../../utils/permissions';
import { createApiResponse, handleApiError } from '../../../utils/errors';
import { LeaseStatus } from '../../../../shared/types/enums/lease-status.enum';

export default defineEventHandler(async (event) => {
  try {
    const user = requireAuth(event);
    const query = getQuery(event);

    const leases = await leaseService.listLeases(user, {
      status: query.status ? (query.status as LeaseStatus) : undefined,
    });

    return createApiResponse({
      leases,
      total: leases.length,
    });
  } catch (error) {
    return handleApiError(event, error);
  }
});
