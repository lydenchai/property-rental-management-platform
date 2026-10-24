import type { UnitStatus } from './enums/unit-status.enum';

export interface PropertyListItem {
  id: string;
  landlordId: string;
  title: string;
  description: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  amenities: string[];
  unitsCount?: number;
  availableUnitsCount?: number;
  minRent?: number;
  maxRent?: number;
  createdAt: string;
}

export type PropertyItem = PropertyListItem;

export interface UnitDetail {
  id: string;
  propertyId: string;
  unitNumber: string;
  floor: number;
  sizeSqFt: number;
  bedrooms: number;
  bathrooms: number;
  rentAmount: number;
  depositAmount: number;
  status: UnitStatus;
  images?: string[];
  createdAt: string;
}

export type UnitItem = UnitDetail;

export interface PropertyDetail {
  id: string;
  landlordId?: string;
  title: string;
  description: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  amenities: string[];
  units: UnitItem[];
  unitsCount: number;
  availableUnitsCount: number;
  latitude?: number;
  longitude?: number;
}

export interface PropertyFilterParams {
  landlordId?: string;
  city?: string;
  state?: string;
  search?: string;
  minRent?: number;
  maxRent?: number;
}

export interface CreatePropertyInput {
  title: string;
  description?: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  amenities?: string[];
}

export interface UpdatePropertyInput {
  title?: string;
  description?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  amenities?: string[];
}

export interface CreateUnitInput {
  unitNumber: string;
  floor?: number;
  sizeSqFt?: number;
  bedrooms: number;
  bathrooms: number;
  rentAmount: number;
  depositAmount: number;
  status?: UnitStatus;
}

export interface UpdateUnitInput {
  unitNumber?: string;
  floor?: number;
  sizeSqFt?: number;
  bedrooms?: number;
  bathrooms?: number;
  rentAmount?: number;
  depositAmount?: number;
  status?: UnitStatus;
}
