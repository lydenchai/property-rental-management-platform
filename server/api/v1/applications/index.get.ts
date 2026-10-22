import { defineEventHandler, getQuery } from 'h3';
import { leaseService } from '../../../services/lease.service';
import { requireAuth } from '../../../utils/permissions';
import { createApiResponse, handleApiError } from '../../../utils/errors';
import { ApplicationStatus } from '../../../../shared/types/enums/application-status.enum';

export default defineEventHandler(async (event) => {
  try {
    const user = requireAuth(event);
    const query = getQuery(event);

    const applications = await leaseService.listApplications(user, {
      status: query.status ? (query.status as ApplicationStatus) : undefined,
    });

    return createApiResponse({
      applications,
      total: applications.length,
    });
  } catch (error) {
    return handleApiError(event, error);
  }
});
