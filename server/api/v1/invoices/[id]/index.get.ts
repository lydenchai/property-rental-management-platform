import { defineEventHandler } from 'h3';
import { billingService } from '../../../../services/billing.service';
import { requireAuth } from '../../../../utils/permissions';
import { createApiResponse, handleApiError, createValidationError } from '../../../../utils/errors';

export default defineEventHandler(async (event) => {
  try {
    const user = requireAuth(event);
    const id = event.context.params?.id;

    if (!id) {
      throw createValidationError('Invoice ID is required');
    }

    const invoice = await billingService.getInvoiceById(user, id);

    return createApiResponse({
      invoice,
    });
  } catch (error) {
    return handleApiError(event, error);
  }
});
