import { defineEventHandler } from 'h3';
import { notificationRepository } from '../../../../repositories/notification.repo';
import { requireAuth } from '../../../../utils/permissions';
import { createApiResponse, handleApiError, createValidationError } from '../../../../utils/errors';

export default defineEventHandler(async (event) => {
  try {
    const user = requireAuth(event);
    const id = event.context.params?.id;

    if (!id) {
      throw createValidationError('Notification ID is required');
    }

    const updated = await notificationRepository.markAsRead(id, user.id);

    return createApiResponse({
      notification: updated,
      message: 'Notification marked as read',
    });
  } catch (error) {
    return handleApiError(event, error);
  }
});
