import { defineEventHandler } from 'h3';
import { reportService } from '../../../services/report.service';
import { requireAuth } from '../../../utils/permissions';
import { createApiResponse, handleApiError } from '../../../utils/errors';

export default defineEventHandler(async (event) => {
  try {
    const user = requireAuth(event);
    const metrics = await reportService.getDashboardMetrics(user);

    return createApiResponse({
      metrics,
    });
  } catch (error) {
    return handleApiError(event, error);
  }
});
