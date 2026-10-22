import { defineEventHandler } from 'h3';
import { notificationRepository } from '../../../repositories/notification.repo';
import { requireAuth } from '../../../utils/permissions';
import { createApiResponse, handleApiError } from '../../../utils/errors';

export default defineEventHandler(async (event) => {
  try {
    const user = requireAuth(event);
    const count = await notificationRepository.markAllAsRead(user.id);

    return createApiResponse({
      markedCount: count,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    return handleApiError(event, error);
  }
});
