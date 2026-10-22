import { defineEventHandler, readBody } from 'h3';
import { leaseService } from '../../../services/lease.service';
import { requireRole } from '../../../utils/permissions';
import { UserRole } from '../../../../shared/types/enums/user-role.enum';
import { createApiResponse, handleApiError } from '../../../utils/errors';

export default defineEventHandler(async (event) => {
  try {
    const user = requireRole(event, [UserRole.TENANT, UserRole.ADMIN]);
    const body = await readBody(event);
    const application = await leaseService.submitApplication(user, body);

    return createApiResponse({
      application,
      message: 'Rental application submitted successfully',
    });
  } catch (error) {
    return handleApiError(event, error);
  }
});
