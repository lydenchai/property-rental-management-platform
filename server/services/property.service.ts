import { propertyRepo } from '../repositories/property.repo';
import { unitRepo } from '../repositories/unit.repo';
import {
  CreatePropertyInput,
  UpdatePropertyInput,
  CreateUnitInput,
  UpdateUnitInput,
  CreatePropertySchema,
  CreateUnitSchema,
} from '../../shared/schemas/property.schema';
import { notFoundError, forbiddenError, badRequestError } from '../utils/errors';
import type { AuthContext } from '../utils/permissions';
import { UnitStatus } from '../../shared/types/enums/unit-status.enum';

export class PropertyService {
  async listProperties(
    filter: {
      landlordId?: string;
      city?: string;
      state?: string;
      search?: string;
      minRent?: number;
      maxRent?: number;
      bedrooms?: number;
    } = {}
  ) {
    const properties = await propertyRepo.findAll({
      landlordId: filter.landlordId,
      city: filter.city,
      state: filter.state,
      search: filter.search,
    });

    // Enhance each property with its units metadata
    const enhanced = await Promise.all(
      properties.map(async (property) => {
        const units = await unitRepo.findByPropertyId(property.id);
        const availableUnits = units.filter((u) => u.status === UnitStatus.AVAILABLE);

        let minRent = 0;
        let maxRent = 0;
        if (units.length > 0) {
          const rents = units.map((u) => u.rentAmount);
          minRent = Math.min(...rents);
          maxRent = Math.max(...rents);
        }

        return {
          ...property,
          units,
          unitsCount: units.length,
          availableUnitsCount: availableUnits.length,
          minRent,
          maxRent,
        };
      })
    );

    // Apply unit-level filters if requested (for tenant search)
    if (
      filter.bedrooms !== undefined ||
      filter.minRent !== undefined ||
      filter.maxRent !== undefined
    ) {
      return enhanced.filter((prop) => {
        if (filter.minRent && prop.maxRent < filter.minRent) return false;
        if (filter.maxRent && prop.minRent > filter.maxRent) return false;
        if (filter.bedrooms !== undefined) {
          const hasMatchingBedrooms = (prop.units || []).some(
            (u: any) => u.bedrooms >= filter.bedrooms!
          );
          if (!hasMatchingBedrooms) return false;
        }
        return true;
      });
    }

    return enhanced;
  }

  async getProperty(id: string) {
    const property = await propertyRepo.findById(id);
    if (!property) {
      throw notFoundError('Property not found');
    }

    const units = await unitRepo.findByPropertyId(id);
    const availableUnitsCount = units.filter((u) => u.status === UnitStatus.AVAILABLE).length;

    return {
      ...property,
      units,
      unitsCount: units.length,
      availableUnitsCount,
    };
  }

  async createProperty(user: AuthContext, input: CreatePropertyInput) {
    const validated = CreatePropertySchema.parse(input);
    return propertyRepo.create(user.id, validated);
  }

  async updateProperty(propertyId: string, user: AuthContext, input: UpdatePropertyInput) {
    const property = await propertyRepo.findById(propertyId);
    if (!property) {
      throw notFoundError('Property not found');
    }

    if (user.role !== 'ADMIN' && property.landlordId !== user.id) {
      throw forbiddenError('You can only update properties that you own');
    }

    const updated = await propertyRepo.update(propertyId, input);
    if (!updated) {
      throw notFoundError('Property not found');
    }
    return updated;
  }

  async deleteProperty(propertyId: string, user: AuthContext) {
    const property = await propertyRepo.findById(propertyId);
    if (!property) {
      throw notFoundError('Property not found');
    }

    if (user.role !== 'ADMIN' && property.landlordId !== user.id) {
      throw forbiddenError('You can only delete properties that you own');
    }

    // Cascade soft-delete all units for this property
    const units = await unitRepo.findByPropertyId(propertyId);
    await Promise.all(units.map((u) => unitRepo.delete(u.id)));

    return propertyRepo.delete(propertyId);
  }

  // --- Unit Operations ---

  async listUnits(propertyId: string) {
    const property = await propertyRepo.findById(propertyId);
    if (!property) {
      throw notFoundError('Property not found');
    }
    return unitRepo.findByPropertyId(propertyId);
  }

  async getUnit(unitId: string) {
    const unit = await unitRepo.findById(unitId);
    if (!unit) {
      throw notFoundError('Unit not found');
    }
    return unit;
  }

  async addUnit(propertyId: string, user: AuthContext, input: CreateUnitInput) {
    const property = await propertyRepo.findById(propertyId);
    if (!property) {
      throw notFoundError('Property not found');
    }

    if (user.role !== 'ADMIN' && property.landlordId !== user.id) {
      throw forbiddenError('You can only add units to properties that you own');
    }

    const validated = CreateUnitSchema.parse(input);

    const existingUnits = await unitRepo.findByPropertyId(propertyId);
    const isDuplicate = existingUnits.some(
      (u) => u.unitNumber.toLowerCase() === validated.unitNumber.toLowerCase()
    );
    if (isDuplicate) {
      throw badRequestError(
        `A unit with number "${validated.unitNumber}" already exists in this property`
      );
    }

    return unitRepo.create(propertyId, validated);
  }

  async updateUnit(unitId: string, user: AuthContext, input: UpdateUnitInput) {
    const unit = await unitRepo.findById(unitId);
    if (!unit) {
      throw notFoundError('Unit not found');
    }

    const property = await propertyRepo.findById(unit.propertyId);
    if (!property) {
      throw notFoundError('Associated property not found');
    }

    if (user.role !== 'ADMIN' && property.landlordId !== user.id) {
      throw forbiddenError('You can only update units in properties that you own');
    }

    if (input.unitNumber && input.unitNumber.toLowerCase() !== unit.unitNumber.toLowerCase()) {
      const existingUnits = await unitRepo.findByPropertyId(unit.propertyId);
      const isDuplicate = existingUnits.some(
        (u) => u.id !== unitId && u.unitNumber.toLowerCase() === input.unitNumber!.toLowerCase()
      );
      if (isDuplicate) {
        throw badRequestError(
          `A unit with number "${input.unitNumber}" already exists in this property`
        );
      }
    }

    const updated = await unitRepo.update(unitId, input);
    if (!updated) {
      throw notFoundError('Unit not found');
    }
    return updated;
  }

  async deleteUnit(unitId: string, user: AuthContext) {
    const unit = await unitRepo.findById(unitId);
    if (!unit) {
      throw notFoundError('Unit not found');
    }

    const property = await propertyRepo.findById(unit.propertyId);
    if (!property) {
      throw notFoundError('Associated property not found');
    }

    if (user.role !== 'ADMIN' && property.landlordId !== user.id) {
      throw forbiddenError('You can only delete units in properties that you own');
    }

    return unitRepo.delete(unitId);
  }
}

export const propertyService = new PropertyService();
