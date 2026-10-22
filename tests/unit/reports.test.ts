import { describe, it, expect } from 'vitest';
import { reportService } from '../../server/services/report.service';
import { auditLogRepository } from '../../server/repositories/audit-log.repo';

describe('Phase 7: Dashboards, Reports, Audit Logs & Performance', () => {
  const adminUser = { id: 'user-admin-01', role: 'ADMIN' };
  const landlordUser = { id: 'user-landlord-01', role: 'LANDLORD' };
  const tenantUser = { id: 'user-tenant-01', role: 'TENANT' };
  const techUser = { id: 'user-tech-01', role: 'TECHNICIAN' };

  it('1. should calculate accurate occupancy metrics and property breakdown', async () => {
    const report = await reportService.getOccupancyReport(landlordUser);

    expect(report).toBeDefined();
    expect(report.totalProperties).toBeGreaterThan(0);
    expect(report.totalUnits).toBeGreaterThan(0);
    expect(typeof report.occupancyRate).toBe('number');
    expect(report.occupancyRate).toBeGreaterThanOrEqual(0);
    expect(report.occupancyRate).toBeLessThanOrEqual(100);

    expect(Array.isArray(report.propertyBreakdown)).toBe(true);
    expect(report.propertyBreakdown.length).toBeGreaterThan(0);
    const first = report.propertyBreakdown[0];
    expect(first.title).toBeDefined();
    expect(first.totalUnits).toBeGreaterThanOrEqual(first.occupiedUnits);
  });

  it('2. should calculate financial collections, outstanding balances, and rates', async () => {
    const report = await reportService.getFinancialReport(adminUser);

    expect(report).toBeDefined();
    expect(report.totalInvoiced).toBeGreaterThan(0);
    expect(report.totalCollected).toBeGreaterThan(0);
    expect(report.outstandingBalance).toBeGreaterThanOrEqual(0);
    expect(report.collectionRate).toBeGreaterThan(0);
    expect(report.collectionRate).toBeLessThanOrEqual(100);
    expect(report.totalInvoices).toBeGreaterThan(0);
  });

  it('3. should provide tailored dashboard metrics for all roles', async () => {
    // 3a. Admin
    const adminMetrics = await reportService.getDashboardMetrics(adminUser);
    expect(adminMetrics.role).toBe('ADMIN');
    expect(adminMetrics.propertiesCount).toBeDefined();
    expect(adminMetrics.activeUsersCount).toBeGreaterThan(0);

    // 3b. Landlord
    const landlordMetrics = await reportService.getDashboardMetrics(landlordUser);
    expect(landlordMetrics.role).toBe('LANDLORD');
    expect(landlordMetrics.managedProperties).toBeDefined();
    expect(landlordMetrics.occupancyRate).toBeDefined();

    // 3c. Tenant
    const tenantMetrics = await reportService.getDashboardMetrics(tenantUser);
    expect(tenantMetrics.role).toBe('TENANT');
    expect(tenantMetrics.hasActiveLease).toBeDefined();

    // 3d. Technician
    const techMetrics = await reportService.getDashboardMetrics(techUser);
    expect(techMetrics.role).toBe('TECHNICIAN');
    expect(techMetrics.totalAssigned).toBeDefined();
  });

  it('4. should log and filter system audit events', async () => {
    const entry = await auditLogRepository.log({
      userId: adminUser.id,
      action: 'SYSTEM_SETTINGS_UPDATE',
      entityType: 'SystemConfig',
      entityId: 'cfg-rate-limit',
      oldValues: { limit: 100 },
      newValues: { limit: 250 },
      ipAddress: '127.0.0.1',
    });

    expect(entry).toBeDefined();
    expect(entry.id).toBeDefined();
    expect(entry.action).toBe('SYSTEM_SETTINGS_UPDATE');

    const logs = await auditLogRepository.findMany({ action: 'SYSTEM_SETTINGS_UPDATE' });
    expect(logs.some((l) => l.id === entry.id)).toBe(true);

    const searchLogs = await auditLogRepository.findMany({ search: 'cfg-rate-limit' });
    expect(searchLogs.some((l) => l.id === entry.id)).toBe(true);
  });
});
