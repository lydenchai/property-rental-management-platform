import { describe, it, expect, beforeEach } from 'vitest';
import { PropertyRepository } from '../../server/repositories/property.repo';
import { UnitRepository } from '../../server/repositories/unit.repo';
import { ApplicationRepository } from '../../server/repositories/application.repo';
import { LeaseRepository } from '../../server/repositories/lease.repo';
import { InvoiceRepository } from '../../server/repositories/invoice.repo';
import { PaymentRepository } from '../../server/repositories/payment.repo';
import { MaintenanceRepository } from '../../server/repositories/maintenance.repo';
import { AuditLogRepository } from '../../server/repositories/audit-log.repo';
import { ReportService } from '../../server/services/report.service';

describe('Phase 8: Comprehensive End-to-End Platform Lifecycle Integration', () => {
  let propertyRepo: PropertyRepository;
  let unitRepo: UnitRepository;
  let appRepo: ApplicationRepository;
  let leaseRepo: LeaseRepository;
  let invoiceRepo: InvoiceRepository;
  let paymentRepo: PaymentRepository;
  let maintenanceRepo: MaintenanceRepository;
  let auditRepo: AuditLogRepository;
  let reportService: ReportService;

  beforeEach(() => {
    propertyRepo = new PropertyRepository();
    unitRepo = new UnitRepository();
    appRepo = new ApplicationRepository();
    leaseRepo = new LeaseRepository();
    invoiceRepo = new InvoiceRepository();
    paymentRepo = new PaymentRepository();
    maintenanceRepo = new MaintenanceRepository();
    auditRepo = new AuditLogRepository();
    reportService = new ReportService();
  });

  it('should successfully execute the complete real estate lifecycle end-to-end', async () => {
    const landlordId = 'landlord-lifecycle-101';
    const tenantId = 'tenant-lifecycle-202';
    const technicianId = 'tech-lifecycle-303';

    // 1. Landlord creates a new Property
    const property = await propertyRepo.create(landlordId, {
      title: 'Grand Horizon Heights',
      description: 'Luxury high-rise residential complex',
      addressLine1: '777 Skyline Boulevard',
      city: 'Metropolis',
      state: 'NY',
      postalCode: '10001',
      country: 'USA',
      amenities: ['Gym', 'Pool', 'Concierge', 'Underground Parking'],
    });

    expect(property).toBeDefined();
    expect(property.id).toBeDefined();
    expect(property.title).toBe('Grand Horizon Heights');

    // 2. Provision two Units: Unit 12A and Unit 12B
    const unitA = await unitRepo.create(property.id, {
      unitNumber: '12A',
      floor: 12,
      sizeSqFt: 1100,
      bedrooms: 2,
      bathrooms: 2,
      rentAmount: 3200,
      depositAmount: 3200,
      status: 'AVAILABLE',
    });

    const unitB = await unitRepo.create(property.id, {
      unitNumber: '12B',
      floor: 12,
      sizeSqFt: 850,
      bedrooms: 1,
      bathrooms: 1,
      rentAmount: 2400,
      depositAmount: 2400,
      status: 'AVAILABLE',
    });

    expect(unitA.status).toBe('AVAILABLE');
    expect(unitB.status).toBe('AVAILABLE');

    // 3. Tenant submits rental application for Unit 12A
    const application = await appRepo.create({
      tenantId,
      unitId: unitA.id,
      desiredMoveInDate: new Date(),
      proposedRent: unitA.rentAmount,
      employmentDetails: 'Full-time engineer, annual income $145,000',
      notes: 'Moving for new tech role, excellent credit history.',
    });

    expect(application.status).toBe('PENDING');

    // 4. Landlord reviews and approves application -> Unit becomes RESERVED
    const approvedApp = await appRepo.update(application.id, {
      status: 'APPROVED' as any,
      reviewedById: landlordId,
      reviewReason: 'Qualified applicant, verified salary.',
      reviewedAt: new Date(),
    });
    await unitRepo.updateStatus(unitA.id, 'RESERVED');

    expect(approvedApp?.status).toBe('APPROVED');
    const checkedUnitA = await unitRepo.findById(unitA.id);
    expect(checkedUnitA?.status).toBe('RESERVED');

    // 5. Generate Lease Agreement
    const now = new Date();
    const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    const lease = await leaseRepo.create({
      unitId: unitA.id,
      tenantId,
      landlordId,
      startDate: now,
      endDate: nextYear,
      rentAmount: unitA.rentAmount,
      depositAmount: unitA.depositAmount,
      paymentDueDay: 1,
      termsAndConditions: 'Standard 12-month residential lease agreement.',
      status: 'DRAFT',
    });

    expect(lease.status).toBe('DRAFT');

    // 6. Tenant and Landlord execute digital signatures -> Lease ACTIVE, Unit OCCUPIED
    const tenantSigned = await leaseRepo.update(lease.id, {
      tenantSignedAt: new Date(),
    });
    expect(tenantSigned?.tenantSignedAt).toBeDefined();

    const fullySigned = await leaseRepo.update(lease.id, {
      landlordSignedAt: new Date(),
      status: 'ACTIVE' as any,
    });
    expect(fullySigned?.landlordSignedAt).toBeDefined();
    expect(fullySigned?.status).toBe('ACTIVE');

    await unitRepo.updateStatus(unitA.id, 'OCCUPIED');
    const occupiedUnitA = await unitRepo.findById(unitA.id);
    expect(occupiedUnitA?.status).toBe('OCCUPIED');

    // 7. Generate monthly invoice
    const dueDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5);
    const invoice = await invoiceRepo.create({
      leaseId: lease.id,
      tenantId,
      invoiceNumber: `INV-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      amountDue: unitA.rentAmount,
      dueDate,
      status: 'UNPAID',
    });

    expect(invoice.status).toBe('UNPAID');
    expect(invoice.amountDue).toBe(3200);

    // 8. Tenant makes payment in two installments ($1200 partial, then $2000 full)
    const partialPayment = await paymentRepo.create({
      invoiceId: invoice.id,
      amount: 1200,
      method: 'CREDIT_CARD' as any,
      status: 'CONFIRMED' as any,
      recordedById: tenantId,
      notes: 'Initial installment',
    });

    const updatedInv1 = await invoiceRepo.update(invoice.id, {
      amountPaid: 1200,
      status: 'PARTIALLY_PAID' as any,
    });
    expect(updatedInv1?.status).toBe('PARTIALLY_PAID');

    const finalPayment = await paymentRepo.create({
      invoiceId: invoice.id,
      amount: 2000,
      method: 'BANK_TRANSFER' as any,
      status: 'CONFIRMED' as any,
      recordedById: tenantId,
      notes: 'Final settlement',
    });

    const updatedInv2 = await invoiceRepo.update(invoice.id, {
      amountPaid: 3200,
      status: 'PAID' as any,
    });
    expect(updatedInv2?.status).toBe('PAID');

    // 9. Tenant files a Maintenance Request for kitchen plumbing
    const maintenanceTicket = await maintenanceRepo.create({
      unitId: unitA.id,
      tenantId,
      title: 'Under-sink water filtration leak',
      description: 'Slow leak detected beneath the kitchen faucet fitting.',
      priority: 'MEDIUM' as any,
    });

    expect(maintenanceTicket.status).toBe('OPEN');

    // Landlord assigns technician
    const assignedTicket = await maintenanceRepo.assignTechnician({
      requestId: maintenanceTicket.id, 
      technicianId, 
      assignedById: landlordId,
      notes: 'Please inspect and replace the faulty brass compression valve.',
    });
    expect(assignedTicket?.status).toBe('ASSIGNED');

    // Technician marks in progress and logs work
    await maintenanceRepo.update(maintenanceTicket.id, { status: 'IN_PROGRESS' as any });
    
    // Technician resolves ticket
    const resolvedTicket = await maintenanceRepo.update(maintenanceTicket.id, {
      status: 'RESOLVED' as any,
      resolvedAt: new Date(),
      resolutionNotes: 'Replaced compression washer and pressure tested fitting. No leakage observed.',
    });
    expect(resolvedTicket?.status).toBe('RESOLVED');

    // Tenant confirms closure
    const closedTicket = await maintenanceRepo.update(maintenanceTicket.id, {
      status: 'CONFIRMED_CLOSED' as any,
      confirmedAt: new Date(),
    });
    expect(closedTicket?.status).toBe('CONFIRMED_CLOSED');

    // 10. Log an Audit Event
    const audit = await auditRepo.log({
      userId: tenantId,
      action: 'CLOSE',
      entityType: 'MAINTENANCE_REQUEST',
      entityId: maintenanceTicket.id,
      newValues: { resolutionRating: 5, status: 'CONFIRMED_CLOSED' },
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 Test Suite',
    });

    expect(audit).toBeDefined();
    expect(audit.id).toBeDefined();

    // 11. Verify Analytics Aggregations
    const occupancyReport = await reportService.getOccupancyReport({ id: landlordId, role: 'LANDLORD' });
    expect(occupancyReport.totalUnits).toBeGreaterThanOrEqual(2);
    expect(occupancyReport.occupiedUnits).toBeGreaterThanOrEqual(1);
    expect(occupancyReport.occupancyRate).toBeGreaterThan(0);

    const financialReport = await reportService.getFinancialReport({ id: landlordId, role: 'LANDLORD' });
    expect(financialReport.totalInvoices).toBeGreaterThanOrEqual(1);
  });
});
