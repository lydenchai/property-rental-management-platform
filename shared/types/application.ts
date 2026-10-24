import type { ApplicationStatus } from './enums/application-status.enum';

export interface ApplicationDetail {
  id: string;
  unitId: string;
  tenantId: string;
  status: ApplicationStatus;
  desiredMoveInDate: string;
  proposedRent: number;
  employmentDetails: string;
  notes?: string | null;
  reviewedById?: string | null;
  reviewedAt?: string | null;
  reviewReason?: string | null;
  createdAt: string;
}

export interface ApplicationItem extends ApplicationDetail {
  unit?: {
    id: string;
    unitNumber: string;
    rentAmount: number;
    bedrooms: number;
    bathrooms: number;
    property?: {
      id: string;
      title: string;
      city: string;
      state: string;
    };
  };
  tenant?: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
  };
  property?: {
    id: string;
    title: string;
    city: string;
    state: string;
  };
}

export interface ReviewApplicationInput {
  status: 'APPROVED' | 'REJECTED';
  reason?: string;
}
