import { defineEventHandler, getQuery } from 'h3';
import { billingService } from '../../../services/billing.service';
import { requireAuth } from '../../../utils/permissions';
import { createApiResponse, handleApiError } from '../../../utils/errors';
import { InvoiceStatus } from '../../../../shared/types/enums/invoice-status.enum';

export default defineEventHandler(async (event) => {
  try {
    const user = requireAuth(event);
    const query = getQuery(event);

    const invoices = await billingService.listInvoices(user, {
      leaseId: query.leaseId ? String(query.leaseId) : undefined,
      tenantId: query.tenantId ? String(query.tenantId) : undefined,
      status: query.status ? (query.status as InvoiceStatus) : undefined,
    });

    return createApiResponse({
      invoices,
      total: invoices.length,
    });
  } catch (error) {
    return handleApiError(event, error);
  }
});
