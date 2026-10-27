import { applicationRepo } from '../repositories/application.repo';
import { leaseRepo } from '../repositories/lease.repo';
import { unitRepo } from '../repositories/unit.repo';
import { propertyRepo } from '../repositories/property.repo';
import {
  SubmitApplicationInput,
  ReviewApplicationInput,
  CreateLeaseInput,
  SubmitApplicationSchema,
  ReviewApplicationSchema,
  CreateLeaseSchema,
} from '../../shared/schemas/lease.schema';
import { notFoundError, forbiddenError, badRequestError } from '../utils/errors';
import type { AuthContext } from '../utils/permissions';
import { ApplicationStatus } from '../../shared/types/enums/application-status.enum';
import { LeaseStatus } from '../../shared/types/enums/lease-status.enum';
import { UnitStatus } from '../../shared/types/enums/unit-status.enum';

export class LeaseService {
  // --- Rental Applications ---

  async submitApplication(user: AuthContext, input: SubmitApplicationInput) {
    const validated = SubmitApplicationSchema.parse(input);

    const unit = await unitRepo.findById(validated.unitId);
    if (!unit) {
      throw notFoundError('Unit not found');
    }

    if (unit.status !== UnitStatus.AVAILABLE && unit.status !== UnitStatus.RESERVED) {
      throw badRequestError(
        `Unit ${unit.unitNumber} is not currently available for leasing (status: ${unit.status})`
      );
    }

    // Check if tenant already has an active application on this unit
    const existingApps = await applicationRepo.findAll({
      tenantId: user.id,
      unitId: validated.unitId,
    });
    const hasActiveApp = existingApps.some(
      (a) => a.status === ApplicationStatus.PENDING || a.status === ApplicationStatus.UNDER_REVIEW
    );
    if (hasActiveApp) {
      throw badRequestError('You already have an active pending application for this unit');
    }

    const application = await applicationRepo.create({
      unitId: validated.unitId,
      tenantId: user.id,
      desiredMoveInDate: new Date(validated.desiredMoveInDate),
      proposedRent: validated.proposedRent,
      employmentDetails: validated.employmentDetails,
      notes: validated.notes || null,
    });

    return application;
  }

  async listApplications(user: AuthContext, filter: { status?: ApplicationStatus } = {}) {
    if (user.role === 'TENANT') {
      const apps = await applicationRepo.findAll({
        tenantId: user.id,
        status: filter.status,
      });
      // Attach unit and property info
      return Promise.all(apps.map((a) => this.hydrateApplication(a)));
    }

    if (user.role === 'LANDLORD') {
      const allApps = await applicationRepo.findAll({ status: filter.status });
      const hydrated = await Promise.all(allApps.map((a) => this.hydrateApplication(a)));
      // Filter applications for properties owned by this landlord
      return hydrated.filter((a) => a.property?.landlordId === user.id);
    }

    // Admin sees all
    const apps = await applicationRepo.findAll({ status: filter.status });
    return Promise.all(apps.map((a) => this.hydrateApplication(a)));
  }

  async getApplication(id: string, user: AuthContext) {
    const app = await applicationRepo.findById(id);
    if (!app) {
      throw notFoundError('Application not found');
    }

    const hydrated = await this.hydrateApplication(app);

    // Authorization check
    if (user.role === 'TENANT' && hydrated.tenantId !== user.id) {
      throw forbiddenError('You can only view your own applications');
    }
    if (user.role === 'LANDLORD' && hydrated.property?.landlordId !== user.id) {
      throw forbiddenError('You can only view applications for your properties');
    }

    return hydrated;
  }

  async reviewApplication(
    applicationId: string,
    reviewer: AuthContext,
    input: ReviewApplicationInput
  ) {
    const validated = ReviewApplicationSchema.parse(input);
    const app = await applicationRepo.findById(applicationId);
    if (!app) {
      throw notFoundError('Application not found');
    }

    const hydrated = await this.hydrateApplication(app);
    if (reviewer.role !== 'ADMIN' && hydrated.property?.landlordId !== reviewer.id) {
      throw forbiddenError('Only the property owner can review applications for this unit');
    }

    if (app.status !== ApplicationStatus.PENDING && app.status !== ApplicationStatus.UNDER_REVIEW) {
      throw badRequestError(`Application has already been resolved with status: ${app.status}`);
    }

    if (validated.status === 'APPROVED') {
      // 1. Update application status
      const updatedApp = await applicationRepo.update(applicationId, {
        status: ApplicationStatus.APPROVED,
        reviewedById: reviewer.id,
        reviewedAt: new Date(),
        reviewReason: validated.reason,
      });

      // 2. Atomically transition unit status to RESERVED
      await unitRepo.update(app.unitId, {
        status: UnitStatus.RESERVED,
      });

      // 3. Automatically draft the Lease agreement
      const startDate = new Date(app.desiredMoveInDate);
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);

      const lease = await leaseRepo.create({
        unitId: app.unitId,
        tenantId: app.tenantId,
        landlordId: hydrated.property.landlordId,
        applicationId: app.id,
        startDate,
        endDate,
        rentAmount: app.proposedRent,
        depositAmount: app.proposedRent,
        paymentDueDay: 1,
        termsAndConditions: `Standard 12-Month Residential Lease Agreement.
1. Rent is due on the 1st of each calendar month.
2. Tenant agrees to observe all community quiet hours and maintenance guidelines.
3. Security deposit will be refunded within 30 days of lease expiration subject to property inspection.`,
        status: LeaseStatus.PENDING_SIGNATURES,
      });

      return {
        application: updatedApp,
        lease,
        message: 'Application approved, unit reserved, and lease agreement drafted.',
      };
    } else {
      // REJECTED
      const updatedApp = await applicationRepo.update(applicationId, {
        status: ApplicationStatus.REJECTED,
        reviewedById: reviewer.id,
        reviewedAt: new Date(),
        reviewReason: validated.reason,
      });

      return {
        application: updatedApp,
        message: 'Application has been rejected.',
      };
    }
  }

  // --- Lease Workflows ---

  async listLeases(user: AuthContext, filter: { status?: LeaseStatus } = {}) {
    let leases = [];
    if (user.role === 'TENANT') {
      leases = await leaseRepo.findAll({ tenantId: user.id, status: filter.status });
    } else if (user.role === 'LANDLORD') {
      leases = await leaseRepo.findAll({ landlordId: user.id, status: filter.status });
    } else {
      leases = await leaseRepo.findAll({ status: filter.status });
    }

    return Promise.all(leases.map((l) => this.hydrateLease(l)));
  }

  async getLease(id: string, user: AuthContext) {
    const lease = await leaseRepo.findById(id);
    if (!lease) {
      throw notFoundError('Lease agreement not found');
    }

    const hydrated = await this.hydrateLease(lease);

    if (user.role === 'TENANT' && hydrated.tenantId !== user.id) {
      throw forbiddenError('You can only view your own leases');
    }
    if (user.role === 'LANDLORD' && hydrated.landlordId !== user.id) {
      throw forbiddenError('You can only view leases for your properties');
    }

    return hydrated;
  }

  async createLease(landlord: AuthContext, input: CreateLeaseInput) {
    const validated = CreateLeaseSchema.parse(input);

    const unit = await unitRepo.findById(validated.unitId);
    if (!unit) {
      throw notFoundError('Unit not found');
    }

    const property = await propertyRepo.findById(unit.propertyId);
    if (!property || (landlord.role !== 'ADMIN' && property.landlordId !== landlord.id)) {
      throw forbiddenError('You can only create leases for properties you own');
    }

    const lease = await leaseRepo.create({
      unitId: validated.unitId,
      tenantId: validated.tenantId,
      landlordId: property.landlordId,
      applicationId: validated.applicationId || null,
      startDate: new Date(validated.startDate),
      endDate: new Date(validated.endDate),
      rentAmount: validated.rentAmount,
      depositAmount: validated.depositAmount,
      paymentDueDay: validated.paymentDueDay || 1,
      termsAndConditions: validated.termsAndConditions,
      status: LeaseStatus.PENDING_SIGNATURES,
    });

    await unitRepo.update(unit.id, { status: UnitStatus.RESERVED });

    return lease;
  }

  async signLease(leaseId: string, user: AuthContext) {
    const lease = await leaseRepo.findById(leaseId);
    if (!lease) {
      throw notFoundError('Lease not found');
    }

    if (lease.status === LeaseStatus.ACTIVE) {
      throw badRequestError('This lease is already active and fully signed');
    }
    if (lease.status === LeaseStatus.TERMINATED || lease.status === LeaseStatus.EXPIRED) {
      throw badRequestError(`Cannot sign a lease that has been ${lease.status.toLowerCase()}`);
    }

    const isTenantSigner = lease.tenantId === user.id;
    const isLandlordSigner = lease.landlordId === user.id || user.role === 'ADMIN';

    if (!isTenantSigner && !isLandlordSigner) {
      throw forbiddenError('You are not a designated party for signing this lease');
    }

    const updates: any = {};
    if (isTenantSigner) {
      updates.tenantSignedAt = new Date();
    }
    if (isLandlordSigner) {
      updates.landlordSignedAt = new Date();
    }

    // Check if both signatures will now be present
    const willBeTenantSigned = isTenantSigner || !!lease.tenantSignedAt;
    const willBeLandlordSigned = isLandlordSigner || !!lease.landlordSignedAt;

    if (willBeTenantSigned && willBeLandlordSigned) {
      updates.status = LeaseStatus.ACTIVE;
      // Atomically transition unit to OCCUPIED
      await unitRepo.update(lease.unitId, { status: UnitStatus.OCCUPIED });
    }

    const updated = await leaseRepo.update(leaseId, updates);
    return {
      lease: updated,
      isFullySigned: willBeTenantSigned && willBeLandlordSigned,
      message:
        willBeTenantSigned && willBeLandlordSigned
          ? 'Both parties have signed! The lease is now ACTIVE and the unit is marked OCCUPIED.'
          : 'Your signature has been recorded. Awaiting the counter-party signature.',
    };
  }

  async terminateLease(leaseId: string, user: AuthContext) {
    const lease = await leaseRepo.findById(leaseId);
    if (!lease) {
      throw notFoundError('Lease not found');
    }

    if (user.role !== 'ADMIN' && lease.landlordId !== user.id) {
      throw forbiddenError(
        'Only the landlord or system administrator can terminate an active lease'
      );
    }

    const updated = await leaseRepo.update(leaseId, {
      status: LeaseStatus.TERMINATED,
    });

    // Reset unit status back to AVAILABLE
    await unitRepo.update(lease.unitId, {
      status: UnitStatus.AVAILABLE,
    });

    return {
      lease: updated,
      message: 'Lease terminated. Unit has been returned to AVAILABLE status.',
    };
  }

  // Helper hydrators
  private async hydrateApplication(app: any) {
    if (app.unit && (app.property || app.unit?.property)) {
      return {
        ...app,
        property: app.property || app.unit.property,
      };
    }
    const unit = app.unit || (await unitRepo.findById(app.unitId));
    let property: any = app.property || unit?.property;
    if (!property && unit?.propertyId) {
      property = await propertyRepo.findById(unit.propertyId);
    }
    return {
      ...app,
      unit,
      property,
    };
  }

  private async hydrateLease(lease: any) {
    if (lease.unit && (lease.property || lease.unit?.property)) {
      return {
        ...lease,
        property: lease.property || lease.unit.property,
      };
    }
    const unit = lease.unit || (await unitRepo.findById(lease.unitId));
    let property: any = lease.property || unit?.property;
    if (!property && unit?.propertyId) {
      property = await propertyRepo.findById(unit.propertyId);
    }
    return {
      ...lease,
      unit,
      property,
    };
  }
}

export const leaseService = new LeaseService();
