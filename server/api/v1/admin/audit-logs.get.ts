import { defineEventHandler, getQuery } from 'h3';
import { auditLogRepository } from '../../../repositories/audit-log.repo';
import { requireRole } from '../../../utils/permissions';
import { UserRole } from '../../../../shared/types/enums/user-role.enum';
import { createApiResponse, handleApiError } from '../../../utils/errors';

export default defineEventHandler(async (event) => {
  try {
    requireRole(event, [UserRole.ADMIN]);
    const query = getQuery(event);

    const logs = await auditLogRepository.findMany({
      action: query.action ? String(query.action) : undefined,
      entityType: query.entityType ? String(query.entityType) : undefined,
      search: query.search ? String(query.search) : undefined,
      userId: query.userId ? String(query.userId) : undefined,
    });

    return createApiResponse({
      logs,
      total: logs.length,
    });
  } catch (error) {
    return handleApiError(event, error);
  }
});
