import { defineEventHandler, getQuery } from 'h3';
import { maintenanceService } from '../../../services/maintenance.service';
import { requireAuth } from '../../../utils/permissions';
import { createApiResponse, handleApiError } from '../../../utils/errors';
import { MaintenanceStatus } from '../../../../shared/types/enums/maintenance-status.enum';
import { MaintenancePriority } from '../../../../shared/types/enums/maintenance-priority.enum';

export default defineEventHandler(async (event) => {
  try {
    const user = requireAuth(event);
    const query = getQuery(event);

    const requests = await maintenanceService.listRequests(user, {
      unitId: query.unitId ? String(query.unitId) : undefined,
      status: query.status ? (query.status as MaintenanceStatus) : undefined,
      priority: query.priority ? (query.priority as MaintenancePriority) : undefined,
    });

    return createApiResponse({
      requests,
      total: requests.length,
    });
  } catch (error) {
    return handleApiError(event, error);
  }
});
