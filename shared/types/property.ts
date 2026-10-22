import { UnitStatus } from "./enums/unit-status.enum";

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
  createdAt: string;
}

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
