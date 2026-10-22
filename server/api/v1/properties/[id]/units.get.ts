import { defineEventHandler, getRouterParam } from 'h3';
import { propertyService } from '../../../../services/property.service';
import { createApiResponse, handleApiError, badRequestError } from '../../../../utils/errors';

export default defineEventHandler(async (event) => {
  try {
    const propertyId = getRouterParam(event, 'id');
    if (!propertyId) throw badRequestError('Property ID is required');

    const units = await propertyService.listUnits(propertyId);
    return createApiResponse({
      units,
      total: units.length,
    });
  } catch (error) {
    return handleApiError(event, error);
  }
});
