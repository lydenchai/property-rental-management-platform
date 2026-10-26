import type { LeaseStatus } from './enums/Lease-status.enum';

export interface LeaseDetail {
  id: string;
  unitId: string;
  tenantId: string;
  landlordId: string;
  applicationId?: string | null;
  startDate: string;
  endDate: string;
  rentAmount: number;
  depositAmount: number;
  paymentDueDay: number;
  status: LeaseStatus;
  tenantSignedAt?: string | null;
  landlordSignedAt?: string | null;
  termsAndConditions: string;
  createdAt: string;
}

export interface LeaseItem extends LeaseDetail {
  unit?: {
    id: string;
    unitNumber: string;
    bedrooms: number;
    bathrooms: number;
  };
  property?: {
    id: string;
    title: string;
    city: string;
    state: string;
  };
  tenant?: {
    id: string;
    fullName: string;
    email: string;
  };
  landlord?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface CreateLeaseInput {
  unitId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  depositAmount: number;
  paymentDueDay: number;
  termsAndConditions: string;
}

export interface SignLeaseInput {
  agreeToTerms: boolean;
}
