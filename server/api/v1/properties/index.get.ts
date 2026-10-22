import { defineEventHandler, getQuery } from 'h3';
import { propertyService } from '../../../services/property.service';
import { createApiResponse, handleApiError } from '../../../utils/errors';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const properties = await propertyService.listProperties({
      landlordId: query.landlordId ? String(query.landlordId) : undefined,
      city: query.city ? String(query.city) : undefined,
      state: query.state ? String(query.state) : undefined,
      search: query.search ? String(query.search) : undefined,
      minRent: query.minRent ? Number(query.minRent) : undefined,
      maxRent: query.maxRent ? Number(query.maxRent) : undefined,
      bedrooms: query.bedrooms !== undefined && query.bedrooms !== '' ? Number(query.bedrooms) : undefined,
    });

    return createApiResponse({
      properties,
      total: properties.length,
    });
  } catch (error) {
    return handleApiError(event, error);
  }
});
