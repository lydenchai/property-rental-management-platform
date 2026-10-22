import { defineEventHandler, readBody } from 'h3';
import { billingService } from '../../../services/billing.service';
import { requireRole } from '../../../utils/permissions';
import { UserRole } from '../../../../shared/types/enums/user-role.enum';
import { createApiResponse, handleApiError } from '../../../utils/errors';

export default defineEventHandler(async (event) => {
  try {
    const landlord = requireRole(event, [UserRole.LANDLORD, UserRole.ADMIN]);
    const body = await readBody(event);
    const invoice = await billingService.generateInvoice(landlord, body);

    return createApiResponse({
      invoice,
      message: 'Monthly rent invoice generated successfully',
    });
  } catch (error) {
    return handleApiError(event, error);
  }
});
