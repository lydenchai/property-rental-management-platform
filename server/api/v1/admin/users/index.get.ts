import { defineEventHandler, getQuery } from 'h3';
import { userRepository } from '../../../../repositories/user.repo';
import { requireRole } from '../../../../utils/permissions';
import { UserRole } from '../../../../../shared/types/enums/user-role.enum';
import { UserStatus } from '../../../../../shared/types/enums/user-status.enum';
import { createApiResponse, handleApiError } from '../../../../utils/errors';

export default defineEventHandler(async (event) => {
  try {
    requireRole(event, [UserRole.ADMIN]);
    const query = getQuery(event);

    const users = await userRepository.findMany({
      role: query.role ? (query.role as UserRole) : undefined,
      status: query.status ? (query.status as UserStatus) : undefined,
      search: query.search ? String(query.search) : undefined,
    });

    return createApiResponse({
      users,
      total: users.length,
    });
  } catch (error) {
    return handleApiError(event, error);
  }
});
