import { propertyRepository } from '../repositories/property.repo';
import { unitRepository } from '../repositories/unit.repo';
import { leaseRepository } from '../repositories/lease.repo';
import { invoiceRepository } from '../repositories/invoice.repo';
import { maintenanceRepository } from '../repositories/maintenance.repo';
import { applicationRepository } from '../repositories/application.repo';
import { userRepository } from '../repositories/user.repo';
import { auditLogRepository } from '../repositories/audit-log.repo';
import { UnitStatus } from '../../shared/types/enums/unit-status.enum';
import { InvoiceStatus } from '../../shared/types/enums/invoice-status.enum';
import { MaintenanceStatus } from '../../shared/types/enums/maintenance-status.enum';
import { LeaseStatus } from '../../shared/types/enums/lease-status.enum';

export class ReportService {
  async getOccupancyReport(user: { id: string; role: string }) {
    let properties = [];
    if (user.role === 'LANDLORD') {
      properties = await propertyRepository.findMany({ landlordId: user.id });
    } else {
      properties = await propertyRepository.findMany();
    }

    let totalUnits = 0;
    let occupiedUnits = 0;
    let reservedUnits = 0;
    let availableUnits = 0;
    let maintenanceUnits = 0;

    const propertyBreakdown = [];

    for (const prop of properties) {
      const units = await unitRepository.findByPropertyId(prop.id);
      totalUnits += units.length;

      let pOccupied = 0;
      let pReserved = 0;
      let pAvailable = 0;
      let pMaint = 0;

      for (const u of units) {
        if (u.status === UnitStatus.OCCUPIED) {
          occupiedUnits++;
          pOccupied++;
        } else if (u.status === UnitStatus.RESERVED) {
          reservedUnits++;
          pReserved++;
        } else if (u.status === UnitStatus.MAINTENANCE) {
          maintenanceUnits++;
          pMaint++;
        } else {
          availableUnits++;
          pAvailable++;
        }
      }

      const pRate = units.length > 0 ? Number(((pOccupied / units.length) * 100).toFixed(1)) : 0;
      propertyBreakdown.push({
        id: prop.id,
        title: prop.title,
        city: prop.city,
        state: prop.state,
        totalUnits: units.length,
        occupiedUnits: pOccupied,
        reservedUnits: pReserved,
        availableUnits: pAvailable,
        maintenanceUnits: pMaint,
        occupancyRate: pRate,
      });
    }

    const overallRate = totalUnits > 0 ? Number(((occupiedUnits / totalUnits) * 100).toFixed(1)) : 0;

    return {
      totalProperties: properties.length,
      totalUnits,
      occupiedUnits,
      reservedUnits,
      availableUnits,
      maintenanceUnits,
      occupancyRate: overallRate,
      propertyBreakdown,
    };
  }

  async getFinancialReport(user: { id: string; role: string }) {
    let invoices = [];
    if (user.role === 'TENANT') {
      invoices = await invoiceRepository.findMany({ tenantId: user.id });
    } else if (user.role === 'LANDLORD') {
      const landlordLeases = await leaseRepository.findMany({ landlordId: user.id });
      const leaseIds = new Set(landlordLeases.map((l) => l.id));
      const allInvoices = await invoiceRepository.findMany();
      invoices = allInvoices.filter((i) => leaseIds.has(i.leaseId));
    } else {
      invoices = await invoiceRepository.findMany();
    }

    let totalInvoiced = 0;
    let totalCollected = 0;
    let paidCount = 0;
    let unpaidCount = 0;
    let overdueCount = 0;
    let overdueAmount = 0;

    for (const inv of invoices) {
      const due = Number(inv.amountDue);
      const paid = Number(inv.amountPaid);
      totalInvoiced += due;
      totalCollected += paid;

      if (inv.status === InvoiceStatus.PAID) {
        paidCount++;
      } else if (inv.status === InvoiceStatus.OVERDUE) {
        overdueCount++;
        overdueAmount += Math.max(0, due - paid);
      } else {
        unpaidCount++;
      }
    }

    const outstandingBalance = Math.max(0, totalInvoiced - totalCollected);
    const collectionRate = totalInvoiced > 0 ? Number(((totalCollected / totalInvoiced) * 100).toFixed(1)) : 0;

    return {
      totalInvoiced,
      totalCollected,
      outstandingBalance,
      collectionRate,
      totalInvoices: invoices.length,
      paidCount,
      unpaidCount,
      overdueCount,
      overdueAmount,
    };
  }

  async getDashboardMetrics(user: { id: string; role: string }) {
    const role = user.role;

    if (role === 'ADMIN') {
      const occ = await this.getOccupancyReport(user);
      const fin = await this.getFinancialReport(user);
      const users = await userRepository.findMany();
      const openMaint = await maintenanceRepository.findMany({ status: MaintenanceStatus.OPEN });
      const recentLogs = await auditLogRepository.findMany();

      return {
        role: 'ADMIN',
        propertiesCount: occ.totalProperties,
        unitsCount: occ.totalUnits,
        occupancyRate: occ.occupancyRate,
        totalRevenue: fin.totalCollected,
        outstandingBalance: fin.outstandingBalance,
        activeUsersCount: users.length,
        openMaintenanceCount: openMaint.length,
        totalAuditLogs: recentLogs.length,
      };
    }

    if (role === 'LANDLORD') {
      const occ = await this.getOccupancyReport(user);
      const fin = await this.getFinancialReport(user);
      const leases = await leaseRepository.findMany({ landlordId: user.id });
      const activeLeases = leases.filter((l) => l.status === LeaseStatus.ACTIVE);
      const apps = await applicationRepository.findMany({ status: 'PENDING' as any });

      // Count open maintenance on landlord's properties
      const props = await propertyRepository.findMany({ landlordId: user.id });
      const propIds = new Set(props.map((p) => p.id));
      const allMaint = await maintenanceRepository.findMany();
      let openMaintCount = 0;
      for (const m of allMaint) {
        const u = await unitRepository.findById(m.unitId);
        if (u && propIds.has(u.propertyId) && m.status !== MaintenanceStatus.CONFIRMED_CLOSED) {
          openMaintCount++;
        }
      }

      return {
        role: 'LANDLORD',
        managedProperties: occ.totalProperties,
        totalUnits: occ.totalUnits,
        occupiedUnits: occ.occupiedUnits,
        occupancyRate: occ.occupancyRate,
        monthlyCollected: fin.totalCollected,
        outstandingRent: fin.outstandingBalance,
        pendingApplications: apps.length,
        activeLeasesCount: activeLeases.length,
        openMaintenanceCount: openMaintCount,
      };
    }

    if (role === 'TENANT') {
      const leases = await leaseRepository.findMany({ tenantId: user.id, status: LeaseStatus.ACTIVE });
      const activeLease = leases[0] || null;
      let activeUnit = null;
      let activeProperty = null;
      if (activeLease) {
        activeUnit = await unitRepository.findById(activeLease.unitId);
        if (activeUnit) {
          activeProperty = await propertyRepository.findById(activeUnit.propertyId);
        }
      }

      const invoices = await invoiceRepository.findMany({ tenantId: user.id });
      const pendingInvoices = invoices.filter((i) => i.status !== InvoiceStatus.PAID && i.status !== InvoiceStatus.CANCELLED);
      const nextInvoice = pendingInvoices[0] || null;

      const tickets = await maintenanceRepository.findMany({ tenantId: user.id });
      const activeTickets = tickets.filter((t) => t.status !== MaintenanceStatus.CONFIRMED_CLOSED);

      const apps = await applicationRepository.findMany({ tenantId: user.id });

      return {
        role: 'TENANT',
        hasActiveLease: !!activeLease,
        leaseDetails: activeLease ? {
          unitNumber: activeUnit?.unitNumber || '101A',
          propertyTitle: activeProperty?.title || 'Skyline Heights',
          rentAmount: activeLease.rentAmount,
          endDate: activeLease.endDate,
        } : null,
        nextRentDue: nextInvoice ? {
          invoiceNumber: nextInvoice.invoiceNumber,
          amountDue: nextInvoice.amountDue,
          amountPaid: nextInvoice.amountPaid,
          dueDate: nextInvoice.dueDate,
          remaining: Math.max(0, Number(nextInvoice.amountDue) - Number(nextInvoice.amountPaid)),
        } : null,
        activeMaintenanceCount: activeTickets.length,
        applicationsCount: apps.length,
      };
    }

    if (role === 'TECHNICIAN') {
      const tickets = await maintenanceRepository.findMany({ technicianId: user.id });
      const assignedCount = tickets.filter((t) => t.status === MaintenanceStatus.ASSIGNED).length;
      const inProgressCount = tickets.filter((t) => t.status === MaintenanceStatus.IN_PROGRESS).length;
      const completedCount = tickets.filter((t) => t.status === MaintenanceStatus.RESOLVED || t.status === MaintenanceStatus.CONFIRMED_CLOSED).length;
      const emergencyCount = tickets.filter((t) => t.priority === 'HIGH' || t.priority === 'EMERGENCY').length;

      return {
        role: 'TECHNICIAN',
        assignedCount,
        inProgressCount,
        completedCount,
        emergencyCount,
        totalAssigned: tickets.length,
      };
    }

    return { role: 'UNKNOWN' };
  }
}

export const reportService = new ReportService();
