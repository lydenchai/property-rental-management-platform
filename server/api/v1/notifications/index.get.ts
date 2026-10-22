import { defineEventHandler } from 'h3';
import { notificationRepository } from '../../../repositories/notification.repo';
import { requireAuth } from '../../../utils/permissions';
import { createApiResponse, handleApiError } from '../../../utils/errors';

export default defineEventHandler(async (event) => {
  try {
    const user = requireAuth(event);
    const notifications = await notificationRepository.findByUserId(user.id);
    const unreadCount = await notificationRepository.getUnreadCount(user.id);

    return createApiResponse({
      notifications,
      unreadCount,
    });
  } catch (error) {
    return handleApiError(event, error);
  }
});
