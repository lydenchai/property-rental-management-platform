import { defineEventHandler, readBody } from 'h3';
import { leaseService } from '../../../services/lease.service';
import { requireRole } from '../../../utils/permissions';
import { UserRole } from '../../../../shared/types/enums/user-role.enum';
import { createApiResponse, handleApiError } from '../../../utils/errors';

export default defineEventHandler(async (event) => {
  try {
    const landlord = requireRole(event, [UserRole.LANDLORD, UserRole.ADMIN]);
    const body = await readBody(event);
    const lease = await leaseService.createLease(landlord, body);

    return createApiResponse({
      lease,
      message: 'Lease contract generated successfully',
    });
  } catch (error) {
    return handleApiError(event, error);
  }
});
