import { describe, it, expect, beforeEach } from 'vitest';
import { maintenanceService } from '../../server/services/maintenance.service';
import { notificationRepository } from '../../server/repositories/notification.repo';
import { MaintenanceStatus } from '../../shared/types/enums/maintenance-status.enum';
import { MaintenancePriority } from '../../shared/types/enums/maintenance-priority.enum';

describe('Phase 6: Maintenance Management & Notifications Lifecycle', () => {
  const tenantUser = { id: 'user-tenant-01', role: 'TENANT' };
  const landlordUser = { id: 'user-landlord-01', role: 'LANDLORD' };
  const technicianUser = { id: 'user-tech-01', role: 'TECHNICIAN' };
  const otherTenant = { id: 'user-tenant-02', role: 'TENANT' };

  it('1. should allow tenant to submit a maintenance request and trigger landlord notification', async () => {
    const request = await maintenanceService.createRequest(tenantUser, {
      unitId: 'unit-skyline-101a',
      title: 'Plumbing Leak in Bathroom Sink',
      description: 'Persistent water leaking underneath the primary bathroom cabinet faucet.',
      priority: 'HIGH',
    });

    expect(request).toBeDefined();
    expect(request.id).toBeDefined();
    expect(request.status).toBe(MaintenanceStatus.OPEN);
    expect(request.priority).toBe(MaintenancePriority.HIGH);
    expect(request.title).toBe('Plumbing Leak in Bathroom Sink');

    // Landlord should receive in-app notification
    const landlordNotifs = await notificationRepository.findByUserId(landlordUser.id);
    const leakNotif = landlordNotifs.find((n) => n.title.includes('Maintenance Request'));
    expect(leakNotif).toBeDefined();
  });

  it('2. should allow landlord to assign a technician and notify technician and tenant', async () => {
    const request = await maintenanceService.createRequest(tenantUser, {
      unitId: 'unit-skyline-101a',
      title: 'Broken Heating Radiator Thermostat',
      description: 'Thermostat dial is loose and heating will not activate.',
      priority: 'MEDIUM',
    });

    const assigned = await maintenanceService.assignTechnician(landlordUser, request.id, {
      technicianId: technicianUser.id,
      notes: 'Please bring replacement digital thermostat parts.',
    });

    expect(assigned.status).toBe(MaintenanceStatus.ASSIGNED);
    expect(assigned.assignments).toBeDefined();
    expect(assigned.assignments?.length).toBeGreaterThan(0);

    // Verify technician notification
    const techNotifs = await notificationRepository.findByUserId(technicianUser.id);
    const assignedNotif = techNotifs.find((n) => n.title.includes('Work Order Dispatched'));
    expect(assignedNotif).toBeDefined();

    // Verify tenant notification
    const tenantNotifs = await notificationRepository.findByUserId(tenantUser.id);
    const tenantNotif = tenantNotifs.find((n) => n.title.includes('Technician Assigned'));
    expect(tenantNotif).toBeDefined();
  });

  it('3. should allow technician to mark ticket IN_PROGRESS and then RESOLVED with notes', async () => {
    const request = await maintenanceService.createRequest(tenantUser, {
      unitId: 'unit-skyline-101a',
      title: 'Dishwasher Drainage Blockage',
      description: 'Water standing at the bottom of the dishwasher after standard cycle.',
      priority: 'LOW',
    });

    await maintenanceService.assignTechnician(landlordUser, request.id, {
      technicianId: technicianUser.id,
    });

    // 3a. In Progress
    const inProgress = await maintenanceService.updateProgress(technicianUser, request.id, {
      status: 'IN_PROGRESS',
    });
    expect(inProgress.status).toBe(MaintenanceStatus.IN_PROGRESS);

    // 3b. Resolved
    const resolved = await maintenanceService.updateProgress(technicianUser, request.id, {
      status: 'RESOLVED',
      resolutionNotes: 'Cleared drain pump impellers and verified successful drainage cycle.',
    });
    expect(resolved.status).toBe(MaintenanceStatus.RESOLVED);
    expect(resolved.resolvedAt).toBeDefined();
    expect(resolved.resolutionNotes).toBe('Cleared drain pump impellers and verified successful drainage cycle.');

    // Tenant notification for completed repair
    const tenantNotifs = await notificationRepository.findByUserId(tenantUser.id);
    const completedNotif = tenantNotifs.find((n) => n.title.includes('Repair Completed'));
    expect(completedNotif).toBeDefined();
  });

  it('4. should allow tenant to confirm resolution and close ticket', async () => {
    const request = await maintenanceService.createRequest(tenantUser, {
      unitId: 'unit-skyline-101a',
      title: 'Smoke Detector Battery Beep',
      description: 'Ceiling detector chirping every 60 seconds.',
      priority: 'LOW',
    });

    await maintenanceService.assignTechnician(landlordUser, request.id, {
      technicianId: technicianUser.id,
    });

    await maintenanceService.updateProgress(technicianUser, request.id, {
      status: 'RESOLVED',
      resolutionNotes: 'Replaced 9V lithium backup battery and tested alarm horn.',
    });

    // Confirmation by tenant
    const confirmed = await maintenanceService.confirmResolution(tenantUser, request.id, {
      confirmed: true,
      feedback: 'All working quietly, thank you!',
    });

    expect(confirmed.status).toBe(MaintenanceStatus.CONFIRMED_CLOSED);
    expect(confirmed.confirmedAt).toBeDefined();

    // Landlord notification for confirmed closure
    const landlordNotifs = await notificationRepository.findByUserId(landlordUser.id);
    const closedNotif = landlordNotifs.find((n) => n.title.includes('Ticket Confirmed Closed'));
    expect(closedNotif).toBeDefined();
  });

  it('5. should reject confirmation by an unrelated tenant', async () => {
    const request = await maintenanceService.createRequest(tenantUser, {
      unitId: 'unit-skyline-101a',
      title: 'Window Latch Stuck',
      description: 'Living room left window latch is jammed.',
      priority: 'LOW',
    });

    await maintenanceService.assignTechnician(landlordUser, request.id, {
      technicianId: technicianUser.id,
    });

    await maintenanceService.updateProgress(technicianUser, request.id, {
      status: 'RESOLVED',
      resolutionNotes: 'Lubricated tracks and realigned latch pin.',
    });

    await expect(
      maintenanceService.confirmResolution(otherTenant, request.id, {
        confirmed: true,
      })
    ).rejects.toThrow();
  });

  it('6. should manage notification reading and unread count', async () => {
    const notif = await notificationRepository.create({
      userId: tenantUser.id,
      title: 'System Notice',
      message: 'Scheduled building inspection next Tuesday.',
    });

    expect(notif.isRead).toBe(false);

    const marked = await notificationRepository.markAsRead(notif.id, tenantUser.id);
    expect(marked?.isRead).toBe(true);

    const allReadCount = await notificationRepository.markAllAsRead(tenantUser.id);
    expect(allReadCount).toBeGreaterThanOrEqual(0);

    const unreadCount = await notificationRepository.getUnreadCount(tenantUser.id);
    expect(unreadCount).toBe(0);
  });
});
