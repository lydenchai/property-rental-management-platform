import { defineEventHandler, getRouterParam } from 'h3';
import { propertyService } from '../../../../services/property.service';
import { createApiResponse, handleApiError, badRequestError } from '../../../../utils/errors';

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id');
    if (!id) throw badRequestError('Property ID is required');

    const property = await propertyService.getProperty(id);
    return createApiResponse({ property });
  } catch (error) {
    return handleApiError(event, error);
  }
});
