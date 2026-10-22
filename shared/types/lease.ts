import { ApplicationStatus } from "./enums/application-status.enum";
import { LeaseStatus } from "./enums/Lease-status.enum";

export interface ApplicationDetail {
  id: string;
  unitId: string;
  tenantId: string;
  status: ApplicationStatus;
  desiredMoveInDate: string;
  proposedRent: number;
  employmentDetails: string;
  notes?: string | null;
  reviewedAt?: string | null;
  reviewReason?: string | null;
  createdAt: string;
}

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
