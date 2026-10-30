import { defineEventHandler } from 'h3';
import { notificationRepository } from '../../../repositories/notification.repo';
import { requireAuth } from '../../../utils/permissions';
import { createApiResponse, handleApiError } from '../../../utils/errors';

export default defineEventHandler(async (event) => {
  try {
    const user = requireAuth(event);
    const isAdmin = user.role === 'ADMIN';
    const notifications = await notificationRepository.findByUserId(user.id, isAdmin);
    const unreadCount = await notificationRepository.getUnreadCount(user.id, isAdmin);

    return createApiResponse({
      notifications,
      unreadCount,
    });
  } catch (error) {
    return handleApiError(event, error);
  }
});
