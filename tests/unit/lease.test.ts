import { describe, it, expect } from 'vitest';
import {
  SubmitApplicationSchema,
  ReviewApplicationSchema,
  CreateLeaseSchema,
  SignLeaseSchema,
} from '../../shared/schemas/lease.schema';
import { leaseService } from '../../server/services/lease.service';
import { unitRepo } from '../../server/repositories/unit.repo';
import { UnitStatus } from '../../shared/types/enums/unit-status.enum';
import { LeaseStatus } from '../../shared/types/enums/lease-status.enum';
import { ApplicationStatus } from '../../shared/types/enums/application-status.enum';

describe('Phase 4: Rental Application Validation Schemas', () => {
  it('should accept valid rental application input', () => {
    const input = {
      unitId: 'unit-skyline-204b',
      desiredMoveInDate: '2026-11-01T00:00:00Z',
      proposedRent: 2400,
      employmentDetails: 'Lead Software Engineer at TechCorp, $120k salary',
      notes: 'No pets, non-smoker.',
    };
    const result = SubmitApplicationSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('should reject application with negative proposed rent', () => {
    const input = {
      unitId: 'unit-skyline-204b',
      desiredMoveInDate: '2026-11-01T00:00:00Z',
      proposedRent: -500,
      employmentDetails: 'Employed full-time',
    };
    const result = SubmitApplicationSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('should validate application review input', () => {
    const validApproval = {
      status: 'APPROVED',
      reason: 'Credit check and employment verified successfully.',
    };
    expect(ReviewApplicationSchema.safeParse(validApproval).success).toBe(true);

    const validRejection = {
      status: 'REJECTED',
      reason: 'Insufficient income for unit rent ratio.',
    };
    expect(ReviewApplicationSchema.safeParse(validRejection).success).toBe(true);

    const invalidStatus = {
      status: 'UNKNOWN_STATUS',
      reason: 'Any reason',
    };
    expect(ReviewApplicationSchema.safeParse(invalidStatus).success).toBe(false);
  });
});

describe('Phase 4: Lease Validation Schemas', () => {
  it('should accept valid lease creation input', () => {
    const lease = {
      unitId: 'unit-skyline-204b',
      tenantId: 'user-tenant-01',
      startDate: '2026-11-01T00:00:00Z',
      endDate: '2027-10-31T00:00:00Z',
      rentAmount: 2400,
      depositAmount: 2400,
      paymentDueDay: 1,
      termsAndConditions: 'Standard residential lease agreement terms for 12 months.',
    };
    const result = CreateLeaseSchema.safeParse(lease);
    expect(result.success).toBe(true);
  });

  it('should require agreement to terms for signature', () => {
    expect(SignLeaseSchema.safeParse({ agreeToTerms: true }).success).toBe(true);
    expect(SignLeaseSchema.safeParse({ agreeToTerms: false }).success).toBe(false);
  });
});

describe('Phase 4: Lease & Application State Transitions', () => {
  const landlordContext = {
    id: 'user-landlord-01',
    email: 'landlord@rentease.com',
    fullName: 'Marcus Sterling',
    role: 'LANDLORD' as any,
    status: 'ACTIVE',
  };

  const tenantContext = {
    id: 'user-tenant-01',
    email: 'tenant@rentease.com',
    fullName: 'Sarah Jenkins',
    role: 'TENANT' as any,
    status: 'ACTIVE',
  };

  it('should transition unit to RESERVED and draft lease when landlord approves application', async () => {
    // 1. Submit application for available unit
    const app = await leaseService.submitApplication(tenantContext, {
      unitId: 'unit-skyline-305c',
      desiredMoveInDate: '2026-12-01T00:00:00Z',
      proposedRent: 3100,
      employmentDetails: 'Lead Engineer, $150k annual salary, verified credit.',
      notes: 'Requesting 12-month lease.',
    });

    expect(app.id).toBeDefined();
    expect(app.status).toBe(ApplicationStatus.PENDING);

    // 2. Landlord approves
    const reviewResult = await leaseService.reviewApplication(app.id, landlordContext, {
      status: 'APPROVED',
      reason: 'Application approved. Credit and income verified.',
    });

    expect(reviewResult.application.status).toBe(ApplicationStatus.APPROVED);
    expect(reviewResult.lease).toBeDefined();
    expect(reviewResult.lease.status).toBe(LeaseStatus.PENDING_SIGNATURES);

    // 3. Verify unit state transitioned to RESERVED
    const unit = await unitRepo.findById('unit-skyline-305c');
    expect(unit?.status).toBe(UnitStatus.RESERVED);
  });

  it('should transition lease to ACTIVE and unit to OCCUPIED when both parties sign', async () => {
    // 1. Create a lease in PENDING_SIGNATURES state
    const createdLease = await leaseService.createLease(landlordContext, {
      unitId: 'unit-oakwood-12',
      tenantId: 'user-tenant-01',
      startDate: '2026-11-01T00:00:00Z',
      endDate: '2027-10-31T00:00:00Z',
      rentAmount: 1850,
      depositAmount: 1850,
      paymentDueDay: 1,
      termsAndConditions: 'Standard 12-month lease terms and conditions.',
    });

    expect(createdLease.status).toBe(LeaseStatus.PENDING_SIGNATURES);

    // 2. Tenant signs
    const tenantSignRes = await leaseService.signLease(createdLease.id, tenantContext);
    expect(tenantSignRes.isFullySigned).toBe(false);

    // 3. Landlord signs
    const landlordSignRes = await leaseService.signLease(createdLease.id, landlordContext);
    expect(landlordSignRes.isFullySigned).toBe(true);
    expect(landlordSignRes.lease?.status).toBe(LeaseStatus.ACTIVE);

    // 4. Verify unit state transitioned to OCCUPIED
    const unit = await unitRepo.findById('unit-oakwood-12');
    expect(unit?.status).toBe(UnitStatus.OCCUPIED);
  });

  it('should return unit to AVAILABLE when active lease is terminated', async () => {
    // Terminate the lease created on unit-oakwood-12
    const allLeases = await leaseService.listLeases(landlordContext);
    const activeLease = allLeases.find(
      (l) => l.unitId === 'unit-oakwood-12' && l.status === LeaseStatus.ACTIVE
    );
    expect(activeLease).toBeDefined();

    const terminateRes = await leaseService.terminateLease(activeLease!.id, landlordContext);
    expect(terminateRes.lease?.status).toBe(LeaseStatus.TERMINATED);

    // Verify unit state is back to AVAILABLE
    const unit = await unitRepo.findById('unit-oakwood-12');
    expect(unit?.status).toBe(UnitStatus.AVAILABLE);
  });
});
