import { defineEventHandler } from 'h3';
import { reportService } from '../../../services/report.service';
import { requireRole } from '../../../utils/permissions';
import { UserRole } from '../../../../shared/types/enums/user-role.enum';
import { createApiResponse, handleApiError } from '../../../utils/errors';

export default defineEventHandler(async (event) => {
  try {
    const user = requireRole(event, [UserRole.LANDLORD, UserRole.ADMIN]);
    const report = await reportService.getOccupancyReport(user);

    return createApiResponse({
      report,
    });
  } catch (error) {
    return handleApiError(event, error);
  }
});
