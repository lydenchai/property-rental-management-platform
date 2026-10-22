import { defineEventHandler, readBody } from 'h3';
import { billingService } from '../../../services/billing.service';
import { requireAuth } from '../../../utils/permissions';
import { createApiResponse, handleApiError } from '../../../utils/errors';

export default defineEventHandler(async (event) => {
  try {
    const user = requireAuth(event);
    const body = await readBody(event);
    const result = await billingService.recordPayment(user, body);

    return createApiResponse({
      payment: result.payment,
      invoice: result.invoice,
      receiptNumber: result.receiptNumber,
      message: 'Payment recorded and confirmed successfully',
    });
  } catch (error) {
    return handleApiError(event, error);
  }
});
