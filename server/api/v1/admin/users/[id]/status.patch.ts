import { defineEventHandler, readBody } from 'h3';
import { userRepository } from '../../../../../repositories/user.repo';
import { auditLogRepository } from '../../../../../repositories/audit-log.repo';
import { requireRole } from '../../../../../utils/permissions';
import { UserRole } from '../../../../../../shared/types/enums/user-role.enum';
import { UserStatus } from '../../../../../../shared/types/enums/user-status.enum';
import {
  createApiResponse,
  handleApiError,
  createValidationError,
  createNotFoundError,
} from '../../../../../utils/errors';

export default defineEventHandler(async (event) => {
  try {
    const admin = requireRole(event, [UserRole.ADMIN]);
    const id = event.context.params?.id;

    if (!id) {
      throw createValidationError('User ID is required');
    }

    const body = await readBody(event);
    if (!body.status || !Object.values(UserStatus).includes(body.status)) {
      throw createValidationError('Valid status (ACTIVE or SUSPENDED) is required');
    }

    const user = await userRepository.findById(id);
    if (!user) {
      throw createNotFoundError('User not found');
    }

    const updated = await userRepository.updateStatus(id, body.status as UserStatus);

    await auditLogRepository.log({
      userId: admin.id,
      action: 'USER_STATUS_CHANGE',
      entityType: 'User',
      entityId: id,
      oldValues: { status: user.status },
      newValues: { status: body.status },
    });

    return createApiResponse({
      user: updated,
      message: `User status updated to ${body.status}`,
    });
  } catch (error) {
    return handleApiError(event, error);
  }
});
