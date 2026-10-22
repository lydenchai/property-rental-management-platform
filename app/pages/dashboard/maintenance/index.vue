<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  Search, 
  Plus, 
  Building, 
  FileText, 
  X, 
  CheckCheck, 
  ArrowRight,
  ShieldAlert,
  AlertCircle
} from '@lucide/vue';
import { useAuth } from '../../../composables/useAuth';
import type { ApiResponse } from '../../../../shared/types/api';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  title: 'Maintenance Management',
});

const { user, isLandlord, isTenant, isTechnician, isAdmin } = useAuth();

interface MaintenanceItem {
  id: string;
  unitId: string;
  tenantId: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  requestedAt: string;
  resolvedAt: string | null;
  confirmedAt: string | null;
  resolutionNotes: string | null;
  createdAt: string;
  unit?: {
    id: string;
    unitNumber: string;
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
  assignments?: Array<{
    id: string;
    technicianId: string;
    assignedAt: string;
    notes: string | null;
    technician?: {
      id: string;
      fullName: string;
      email: string;
    };
  }>;
}

const requests = ref<MaintenanceItem[]>([]);
const isLoading = ref(true);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);

// Filters
const activeTab = ref<'ALL' | 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CONFIRMED_CLOSED'>('ALL');
const searchQuery = ref('');

// Modals
const isCreateModalOpen = ref(false);
const isSubmitting = ref(false);
const createForm = ref({
  unitId: 'unit-skyline-101a',
  title: '',
  description: '',
  priority: 'MEDIUM',
});

const ticketToAssign = ref<MaintenanceItem | null>(null);
const isAssigning = ref(false);
const assignForm = ref({
  technicianId: 'user-tech-01',
  notes: '',
});

const ticketToUpdate = ref<MaintenanceItem | null>(null);
const isUpdating = ref(false);
const updateForm = ref({
  status: 'RESOLVED',
  resolutionNotes: '',
});

const ticketToConfirm = ref<MaintenanceItem | null>(null);
const isConfirming = ref(false);
const confirmForm = ref({
  confirmed: true,
  feedback: '',
});

const viewingTicket = ref<MaintenanceItem | null>(null);

async function loadRequests() {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    const res = await $fetch<ApiResponse<{ requests: MaintenanceItem[] }>>('/api/v1/maintenance');
    if (res.success && res.data) {
      requests.value = res.data.requests;
    } else {
      errorMessage.value = res.error?.message || 'Failed to load maintenance requests';
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.error?.message || err?.message || 'Error loading tickets';
  } finally {
    isLoading.value = false;
  }
}

// Metrics
const totalCount = computed(() => requests.value.length);
const openCount = computed(() => requests.value.filter((r) => r.status === 'OPEN' || r.status === 'ASSIGNED').length);
const inProgressCount = computed(() => requests.value.filter((r) => r.status === 'IN_PROGRESS').length);
const awaitingConfirmCount = computed(() => requests.value.filter((r) => r.status === 'RESOLVED').length);
const closedCount = computed(() => requests.value.filter((r) => r.status === 'CONFIRMED_CLOSED').length);

const filteredRequests = computed(() => {
  return requests.value.filter((r) => {
    if (activeTab.value !== 'ALL' && r.status !== activeTab.value) {
      return false;
    }
    if (!searchQuery.value.trim()) return true;

    const q = searchQuery.value.toLowerCase();
    const title = r.title.toLowerCase();
    const desc = r.description.toLowerCase();
    const unit = r.unit?.unitNumber?.toLowerCase() || '';
    const prop = r.unit?.property?.title?.toLowerCase() || '';
    const tenant = r.tenant?.fullName?.toLowerCase() || '';
    const tech = r.assignments?.[0]?.technician?.fullName?.toLowerCase() || '';
    return title.includes(q) || desc.includes(q) || unit.includes(q) || prop.includes(q) || tenant.includes(q) || tech.includes(q);
  });
});

async function executeCreateTicket() {
  isSubmitting.value = true;
  errorMessage.value = null;
  try {
    const res = await $fetch<ApiResponse<{ request: MaintenanceItem; message: string }>>('/api/v1/maintenance', {
      method: 'POST',
      body: createForm.value,
    });

    if (res.success) {
      successMessage.value = res.data?.message || 'Maintenance ticket created successfully';
      isCreateModalOpen.value = false;
      createForm.value = {
        unitId: 'unit-skyline-101a',
        title: '',
        description: '',
        priority: 'MEDIUM',
      };
      await loadRequests();
      setTimeout(() => {
        successMessage.value = null;
      }, 4000);
    } else {
      errorMessage.value = res.error?.message || 'Failed to create maintenance ticket';
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.error?.message || err?.message || 'Error creating ticket';
  } finally {
    isSubmitting.value = false;
  }
}

function openAssignModal(ticket: MaintenanceItem) {
  ticketToAssign.value = ticket;
  assignForm.value = {
    technicianId: 'user-tech-01',
    notes: '',
  };
}

async function executeAssign() {
  if (!ticketToAssign.value) return;
  isAssigning.value = true;
  errorMessage.value = null;
  try {
    const res = await $fetch<ApiResponse<{ request: MaintenanceItem; message: string }>>(`/api/v1/maintenance/${ticketToAssign.value.id}/assign`, {
      method: 'POST',
      body: assignForm.value,
    });

    if (res.success) {
      successMessage.value = res.data?.message || 'Technician assigned successfully';
      ticketToAssign.value = null;
      await loadRequests();
      setTimeout(() => {
        successMessage.value = null;
      }, 4000);
    } else {
      errorMessage.value = res.error?.message || 'Failed to assign technician';
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.error?.message || err?.message || 'Error assigning technician';
  } finally {
    isAssigning.value = false;
  }
}

function openUpdateModal(ticket: MaintenanceItem) {
  ticketToUpdate.value = ticket;
  updateForm.value = {
    status: ticket.status === 'ASSIGNED' ? 'IN_PROGRESS' : 'RESOLVED',
    resolutionNotes: ticket.resolutionNotes || '',
  };
}

async function executeUpdateProgress() {
  if (!ticketToUpdate.value) return;
  isUpdating.value = true;
  errorMessage.value = null;
  try {
    const res = await $fetch<ApiResponse<{ request: MaintenanceItem; message: string }>>(`/api/v1/maintenance/${ticketToUpdate.value.id}/progress`, {
      method: 'POST',
      body: updateForm.value,
    });

    if (res.success) {
      successMessage.value = res.data?.message || 'Progress updated successfully';
      ticketToUpdate.value = null;
      await loadRequests();
      setTimeout(() => {
        successMessage.value = null;
      }, 4000);
    } else {
      errorMessage.value = res.error?.message || 'Failed to update progress';
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.error?.message || err?.message || 'Error updating progress';
  } finally {
    isUpdating.value = false;
  }
}

function openConfirmModal(ticket: MaintenanceItem) {
  ticketToConfirm.value = ticket;
  confirmForm.value = {
    confirmed: true,
    feedback: '',
  };
}

async function executeConfirmResolution() {
  if (!ticketToConfirm.value) return;
  isConfirming.value = true;
  errorMessage.value = null;
  try {
    const res = await $fetch<ApiResponse<{ request: MaintenanceItem; message: string }>>(`/api/v1/maintenance/${ticketToConfirm.value.id}/confirm`, {
      method: 'POST',
      body: confirmForm.value,
    });

    if (res.success) {
      successMessage.value = res.data?.message || 'Ticket closed and resolution confirmed';
      ticketToConfirm.value = null;
      await loadRequests();
      setTimeout(() => {
        successMessage.value = null;
      }, 4000);
    } else {
      errorMessage.value = res.error?.message || 'Failed to confirm resolution';
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.error?.message || err?.message || 'Error confirming closure';
  } finally {
    isConfirming.value = false;
  }
}

onMounted(() => {
  loadRequests();
});
</script>

<template>
  <div class="maintenance-page">
    <!-- Top Bar -->
    <div class="page-top-bar">
      <div>
        <h1>Maintenance Management</h1>
        <p class="subtitle">
          Track end-to-end repair tickets from initial tenant reporting to dispatch, technician resolution, and closure.
        </p>
      </div>
      <button
        v-if="isTenant || isAdmin"
        @click="isCreateModalOpen = true"
        class="btn-primary"
      >
        <Plus :size="15" />
        <span>Report Maintenance Issue</span>
      </button>
    </div>

    <!-- Alert Messages -->
    <div v-if="successMessage" class="alert-success">
      <CheckCircle2 :size="16" class="alert-icon" />
      <span>{{ successMessage }}</span>
    </div>

    <div v-if="errorMessage" class="alert-error">
      <AlertCircle :size="16" class="alert-icon" />
      <div class="alert-body">
        <span>{{ errorMessage }}</span>
        <NuxtLink
          v-if="errorMessage.toLowerCase().includes('logged in')"
          :to="{ path: '/login', query: { redirect: $route.fullPath } }"
          class="alert-action-btn"
        >
          Sign In
        </NuxtLink>
      </div>
    </div>

    <!-- Workflow Stats Ribbon -->
    <div class="stats-grid">
      <div class="stat-card card-flat">
        <div class="stat-header">
          <span class="stat-label">Open / Dispatched</span>
          <div class="stat-icon-wrap open">
            <Clock :size="16" />
          </div>
        </div>
        <div class="stat-value font-mono">{{ openCount }}</div>
        <div class="stat-subtext">Awaiting or assigned to technician</div>
      </div>

      <div class="stat-card card-flat">
        <div class="stat-header">
          <span class="stat-label">In Progress</span>
          <div class="stat-icon-wrap in-progress">
            <Wrench :size="16" />
          </div>
        </div>
        <div class="stat-value font-mono">{{ inProgressCount }}</div>
        <div class="stat-subtext">Active diagnostics & repairs</div>
      </div>

      <div class="stat-card card-flat">
        <div class="stat-header">
          <span class="stat-label">Awaiting Confirmation</span>
          <div class="stat-icon-wrap awaiting">
            <AlertTriangle :size="16" />
          </div>
        </div>
        <div class="stat-value font-mono" :class="{ 'text-amber': awaitingConfirmCount > 0 }">
          {{ awaitingConfirmCount }}
        </div>
        <div class="stat-subtext">Repairs completed, pending tenant sign-off</div>
      </div>

      <div class="stat-card card-flat">
        <div class="stat-header">
          <span class="stat-label">Confirmed Closed</span>
          <div class="stat-icon-wrap closed">
            <CheckCheck :size="16" />
          </div>
        </div>
        <div class="stat-value font-mono">{{ closedCount }}</div>
        <div class="stat-subtext">Successfully settled tickets</div>
      </div>
    </div>

    <!-- Table Shell -->
    <div class="table-shell card-flat">
      <div class="table-top-actions">
        <!-- Status Tabs -->
        <div class="status-tabs">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'ALL' }"
            @click="activeTab = 'ALL'"
          >
            All Tickets ({{ totalCount }})
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'OPEN' }"
            @click="activeTab = 'OPEN'"
          >
            Open
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'ASSIGNED' }"
            @click="activeTab = 'ASSIGNED'"
          >
            Assigned
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'IN_PROGRESS' }"
            @click="activeTab = 'IN_PROGRESS'"
          >
            In Progress
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'RESOLVED' }"
            @click="activeTab = 'RESOLVED'"
          >
            Resolved
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'CONFIRMED_CLOSED' }"
            @click="activeTab = 'CONFIRMED_CLOSED'"
          >
            Closed
          </button>
        </div>

        <!-- Search Bar -->
        <div class="search-wrap">
          <Search :size="14" class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search tickets, units, or technicians..."
            class="table-search-input"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading maintenance requests...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredRequests.length === 0" class="empty-state">
        <Wrench :size="32" class="empty-icon" />
        <h4>No maintenance tickets found</h4>
        <p>Tickets submitted by tenants will appear here along with their workflow progress.</p>
      </div>

      <!-- Tickets Table -->
      <div v-else class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Priority</th>
              <th>Issue Title & Details</th>
              <th>Unit & Property</th>
              <th>Tenant</th>
              <th>Assigned Technician</th>
              <th>Status</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ticket in filteredRequests" :key="ticket.id">
              <td>
                <span
                  class="priority-badge"
                  :class="{
                    'p-emergency': ticket.priority === 'EMERGENCY',
                    'p-high': ticket.priority === 'HIGH',
                    'p-medium': ticket.priority === 'MEDIUM',
                    'p-low': ticket.priority === 'LOW',
                  }"
                >
                  {{ ticket.priority }}
                </span>
              </td>
              <td>
                <div class="ticket-title-cell">
                  <span class="font-semibold">{{ ticket.title }}</span>
                  <span class="text-dim text-xs desc-snippet">{{ ticket.description }}</span>
                  <span class="text-dim text-xs">Reported: {{ new Date(ticket.requestedAt).toLocaleDateString() }}</span>
                </div>
              </td>
              <td>
                <div class="unit-cell">
                  <span class="font-semibold">Unit {{ ticket.unit?.unitNumber || '101A' }}</span>
                  <span class="text-dim text-xs">{{ ticket.unit?.property?.title || 'Skyline Heights' }}</span>
                </div>
              </td>
              <td>
                <div class="tenant-cell">
                  <span>{{ ticket.tenant?.fullName || 'Sarah Jenkins' }}</span>
                  <span class="text-dim text-xs">{{ ticket.tenant?.phone || 'tenant@example.com' }}</span>
                </div>
              </td>
              <td>
                <div v-if="ticket.assignments && ticket.assignments.length > 0" class="tech-cell">
                  <span class="font-semibold">{{ ticket.assignments[0].technician?.fullName || 'Alex Rivers' }}</span>
                  <span class="text-dim text-xs">Assigned {{ new Date(ticket.assignments[0].assignedAt).toLocaleDateString() }}</span>
                </div>
                <div v-else class="text-dim text-xs italic">
                  Unassigned
                </div>
              </td>
              <td>
                <span
                  class="badge"
                  :class="{
                    'badge-info': ticket.status === 'OPEN',
                    'badge-primary': ticket.status === 'ASSIGNED',
                    'badge-warning': ticket.status === 'IN_PROGRESS',
                    'badge-success': ticket.status === 'RESOLVED',
                    'badge-muted': ticket.status === 'CONFIRMED_CLOSED',
                  }"
                >
                  {{ ticket.status.replace('_', ' ') }}
                </span>
              </td>
              <td class="text-right">
                <div class="action-btn-group">
                  <!-- Landlord / Admin: Assign Technician -->
                  <button
                    v-if="(isLandlord || isAdmin) && (ticket.status === 'OPEN' || ticket.status === 'ASSIGNED')"
                    @click="openAssignModal(ticket)"
                    class="btn-primary btn-sm"
                    title="Assign Technician"
                  >
                    <UserCheck :size="13" />
                    <span>{{ ticket.status === 'ASSIGNED' ? 'Reassign' : 'Assign' }}</span>
                  </button>

                  <!-- Technician / Admin: Update Progress -->
                  <button
                    v-if="(isTechnician || isAdmin) && (ticket.status === 'ASSIGNED' || ticket.status === 'IN_PROGRESS')"
                    @click="openUpdateModal(ticket)"
                    class="btn-primary btn-sm"
                    title="Update Work Progress"
                  >
                    <Wrench :size="13" />
                    <span>Update</span>
                  </button>

                  <!-- Tenant / Admin: Confirm Completion -->
                  <button
                    v-if="(isTenant || isAdmin) && ticket.status === 'RESOLVED'"
                    @click="openConfirmModal(ticket)"
                    class="btn-primary btn-sm btn-confirm"
                    title="Confirm Resolution and Close"
                  >
                    <CheckCheck :size="13" />
                    <span>Confirm & Close</span>
                  </button>

                  <!-- Details View -->
                  <button
                    @click="viewingTicket = ticket"
                    class="btn-secondary btn-sm"
                    title="View Ticket Details"
                  >
                    <FileText :size="13" />
                    <span>Details</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Maintenance Request Modal -->
    <div v-if="isCreateModalOpen" class="modal-backdrop">
      <div class="modal-card card-flat" style="max-width: 580px;">
        <div class="modal-header">
          <h3>Report Maintenance Issue</h3>
          <button @click="isCreateModalOpen = false" class="modal-close">&times;</button>
        </div>

        <form @submit.prevent="executeCreateTicket" class="modal-body">
          <div class="grid-2-col">
            <div class="form-group">
              <label class="form-label">Unit Reference ID</label>
              <input
                v-model="createForm.unitId"
                type="text"
                required
                class="form-control"
                placeholder="e.g. unit-skyline-101a"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Urgency Priority</label>
              <select v-model="createForm.priority" class="form-control" required>
                <option value="LOW">Low (Routine maintenance)</option>
                <option value="MEDIUM">Medium (General repair)</option>
                <option value="HIGH">High (Essential service down)</option>
                <option value="EMERGENCY">Emergency (Leak, hazard, security)</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Issue Headline / Title</label>
            <input
              v-model="createForm.title"
              type="text"
              required
              class="form-control"
              placeholder="e.g. HVAC Air Conditioning Not Cooling"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Detailed Description of Defect or Problem</label>
            <textarea
              v-model="createForm.description"
              rows="4"
              required
              class="form-control"
              placeholder="Please provide precise details regarding where the issue is located, when it started, and any symptoms observed..."
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" @click="isCreateModalOpen = false" class="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="btn-primary"
            >
              <Plus :size="14" />
              <span>{{ isSubmitting ? 'Submitting...' : 'Submit Request' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Assign Technician Modal -->
    <div v-if="ticketToAssign" class="modal-backdrop">
      <div class="modal-card card-flat" style="max-width: 520px;">
        <div class="modal-header">
          <h3>Dispatch Technician</h3>
          <button @click="ticketToAssign = null" class="modal-close">&times;</button>
        </div>

        <form @submit.prevent="executeAssign" class="modal-body">
          <div class="contract-summary">
            <div><strong>Ticket:</strong> {{ ticketToAssign.title }}</div>
            <div><strong>Unit:</strong> Unit {{ ticketToAssign.unit?.unitNumber }} ({{ ticketToAssign.unit?.property?.title }})</div>
            <div><strong>Priority:</strong> {{ ticketToAssign.priority }}</div>
          </div>

          <div class="form-group">
            <label class="form-label">Select Technician</label>
            <select v-model="assignForm.technicianId" class="form-control" required>
              <option value="user-tech-01">Alex Rivers (Licensed HVAC & Plumbing Specialist)</option>
              <option value="user-technician-01">Dave Miller (General Building Maintenance)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Instructions / Diagnostic Notes</label>
            <textarea
              v-model="assignForm.notes"
              rows="3"
              class="form-control"
              placeholder="Optional notes, access instructions, or tools needed..."
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" @click="ticketToAssign = null" class="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isAssigning"
              class="btn-primary"
            >
              <UserCheck :size="14" />
              <span>{{ isAssigning ? 'Dispatching...' : 'Confirm Assignment' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Update Progress / Resolve Modal -->
    <div v-if="ticketToUpdate" class="modal-backdrop">
      <div class="modal-card card-flat" style="max-width: 540px;">
        <div class="modal-header">
          <h3>Update Work Order Progress</h3>
          <button @click="ticketToUpdate = null" class="modal-close">&times;</button>
        </div>

        <form @submit.prevent="executeUpdateProgress" class="modal-body">
          <div class="contract-summary">
            <div><strong>Ticket:</strong> {{ ticketToUpdate.title }}</div>
            <div><strong>Unit:</strong> Unit {{ ticketToUpdate.unit?.unitNumber }}</div>
          </div>

          <div class="form-group">
            <label class="form-label">Work Status</label>
            <select v-model="updateForm.status" class="form-control" required>
              <option value="IN_PROGRESS">In Progress (Diagnostics / Parts ordered)</option>
              <option value="RESOLVED">Resolved (Repairs completed, ready for tenant check)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Work Summary / Resolution Notes</label>
            <textarea
              v-model="updateForm.resolutionNotes"
              rows="4"
              required
              class="form-control"
              placeholder="Detail parts replaced, repairs performed, and tests conducted..."
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" @click="ticketToUpdate = null" class="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isUpdating"
              class="btn-primary"
            >
              <CheckCircle2 :size="14" />
              <span>{{ isUpdating ? 'Saving...' : 'Update Ticket' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Confirm Resolution Modal -->
    <div v-if="ticketToConfirm" class="modal-backdrop">
      <div class="modal-card card-flat" style="max-width: 520px;">
        <div class="modal-header">
          <h3>Confirm Repair Resolution</h3>
          <button @click="ticketToConfirm = null" class="modal-close">&times;</button>
        </div>

        <form @submit.prevent="executeConfirmResolution" class="modal-body">
          <div class="contract-summary">
            <div><strong>Ticket:</strong> {{ ticketToConfirm.title }}</div>
            <div><strong>Resolution Notes:</strong> {{ ticketToConfirm.resolutionNotes || 'Repairs completed.' }}</div>
          </div>

          <p class="text-sm text-dim">
            Please confirm that the maintenance technician resolved the reported defect to your satisfaction.
          </p>

          <div class="form-group">
            <label class="form-label">Feedback / Comments (Optional)</label>
            <input
              v-model="confirmForm.feedback"
              type="text"
              class="form-control"
              placeholder="e.g. Prompt and clean service, thank you!"
            />
          </div>

          <div class="modal-actions">
            <button type="button" @click="ticketToConfirm = null" class="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isConfirming"
              class="btn-primary btn-confirm"
            >
              <CheckCheck :size="14" />
              <span>{{ isConfirming ? 'Confirming...' : 'Confirm Satisfactory & Close' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Ticket Details Modal -->
    <div v-if="viewingTicket" class="modal-backdrop">
      <div class="modal-card card-flat" style="max-width: 580px;">
        <div class="modal-header">
          <h3>Maintenance Ticket Details</h3>
          <button @click="viewingTicket = null" class="modal-close">&times;</button>
        </div>

        <div class="modal-body">
          <div class="contract-summary">
            <div><strong>Title:</strong> {{ viewingTicket.title }}</div>
            <div><strong>Priority:</strong> <span class="priority-badge p-medium">{{ viewingTicket.priority }}</span></div>
            <div><strong>Status:</strong> <span class="badge badge-info">{{ viewingTicket.status }}</span></div>
            <div><strong>Property & Unit:</strong> Unit {{ viewingTicket.unit?.unitNumber }} ({{ viewingTicket.unit?.property?.title }})</div>
            <div><strong>Tenant:</strong> {{ viewingTicket.tenant?.fullName }} ({{ viewingTicket.tenant?.email }})</div>
            <div v-if="viewingTicket.assignments && viewingTicket.assignments.length > 0">
              <strong>Technician:</strong> {{ viewingTicket.assignments[0].technician?.fullName }}
            </div>
            <div><strong>Reported At:</strong> {{ new Date(viewingTicket.requestedAt).toLocaleString() }}</div>
            <div v-if="viewingTicket.resolvedAt">
              <strong>Resolved At:</strong> {{ new Date(viewingTicket.resolvedAt).toLocaleString() }}
            </div>
            <div v-if="viewingTicket.confirmedAt">
              <strong>Confirmed Closed:</strong> {{ new Date(viewingTicket.confirmedAt).toLocaleString() }}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Full Problem Description:</label>
            <div class="details-box">{{ viewingTicket.description }}</div>
          </div>

          <div v-if="viewingTicket.resolutionNotes" class="form-group">
            <label class="form-label">Technician Resolution Summary:</label>
            <div class="details-box text-success-box">{{ viewingTicket.resolutionNotes }}</div>
          </div>

          <div class="modal-actions">
            <button @click="viewingTicket = null" class="btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.maintenance-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-top-bar h1 {
  font-size: 1.6rem;
}

.subtitle {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin-top: 0.2rem;
}

/* Stats Cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.stat-card {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-dim);
  text-transform: uppercase;
}

.stat-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon-wrap.open {
  background: rgba(99, 102, 241, 0.12);
  color: var(--primary);
}

.stat-icon-wrap.in-progress {
  background: rgba(245, 158, 11, 0.12);
  color: #fbbf24;
}

.stat-icon-wrap.awaiting {
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
}

.stat-icon-wrap.closed {
  background: var(--accent-emerald-subtle);
  color: #34d399;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.stat-subtext {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Table Shell */
.table-shell {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.table-top-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.status-tabs {
  display: flex;
  background: var(--bg-canvas);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  padding: 0.2rem;
  gap: 0.2rem;
  flex-wrap: wrap;
}

.tab-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.15s ease;
}

.tab-btn:hover {
  color: var(--text-main);
}

.tab-btn.active {
  background: var(--bg-surface);
  color: var(--text-main);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.search-wrap {
  position: relative;
  width: 100%;
  max-width: 320px;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-dim);
}

.table-search-input {
  width: 100%;
  background: var(--bg-input);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  padding: 0.45rem 0.75rem 0.45rem 2.2rem;
  color: var(--text-main);
  font-size: 0.85rem;
}

.table-search-input:focus {
  outline: none;
  border-color: var(--border-focus);
}

.ticket-title-cell,
.unit-cell,
.tenant-cell,
.tech-cell {
  display: flex;
  flex-direction: column;
}

.desc-snippet {
  max-width: 260px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.priority-badge {
  display: inline-block;
  padding: 0.15rem 0.45rem;
  font-size: 0.7rem;
  font-weight: 700;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
}

.priority-badge.p-emergency {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.priority-badge.p-high {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.priority-badge.p-medium {
  background: rgba(99, 102, 241, 0.15);
  color: #818cf8;
}

.priority-badge.p-low {
  background: rgba(148, 163, 184, 0.1);
  color: var(--text-dim);
}

.badge-primary {
  background: rgba(99, 102, 241, 0.15);
  color: #818cf8;
}

.badge-muted {
  background: rgba(148, 163, 184, 0.1);
  color: var(--text-dim);
}

.btn-confirm {
  background-color: var(--accent-emerald);
}

.btn-confirm:hover {
  background-color: #059669;
}

.action-btn-group {
  display: inline-flex;
  gap: 0.4rem;
}

.btn-sm {
  padding: 0.35rem 0.65rem;
  font-size: 0.8rem;
  gap: 0.3rem;
}

.text-right {
  text-align: right;
}

.text-dim {
  color: var(--text-dim);
}

.text-xs {
  font-size: 0.75rem;
}

.text-sm {
  font-size: 0.825rem;
}

.text-amber {
  color: #fbbf24;
}

.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.font-semibold {
  font-weight: 600;
}

.italic {
  font-style: italic;
}

/* Modals */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1.5rem;
}

.modal-card {
  width: 100%;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 0.75rem;
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contract-summary {
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  padding: 0.85rem 1rem;
  font-size: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.grid-2-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-dim);
}

.form-control {
  background: var(--bg-input);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.75rem;
  color: var(--text-main);
  font-size: 0.85rem;
  width: 100%;
}

.form-control:focus {
  outline: none;
  border-color: var(--border-focus);
}

.details-box {
  background: var(--bg-input);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  padding: 0.85rem 1rem;
  font-size: 0.85rem;
  color: var(--text-main);
  line-height: 1.5;
}

.text-success-box {
  border-left: 3px solid #34d399;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

/* Loading & Empty States */
.empty-state {
  text-align: center;
  padding: 3.5rem 1rem;
  color: var(--text-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.empty-icon {
  color: var(--text-dim);
  margin-bottom: 0.5rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 1rem;
  color: var(--text-muted);
}

.loading-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--border-subtle);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .stats-grid,
  .grid-2-col {
    grid-template-columns: 1fr;
  }
}
</style>
