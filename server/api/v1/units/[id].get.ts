import { defineEventHandler, getRouterParam } from 'h3';
import { propertyService } from '../../../services/property.service';
import { createApiResponse, handleApiError, badRequestError } from '../../../utils/errors';

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id');
    if (!id) throw badRequestError('Unit ID is required');

    const unit = await propertyService.getUnit(id);
    return createApiResponse({ unit });
  } catch (error) {
    return handleApiError(event, error);
  }
});
