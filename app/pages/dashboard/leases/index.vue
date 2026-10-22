<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  FileText, 
  FileSignature, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Building, 
  Calendar, 
  DollarSign, 
  X,
  Search,
  Slash,
  Plus
} from '@lucide/vue';
import { useAuth } from '../../../composables/useAuth';
import type { ApiResponse } from '../../../../shared/types/api';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  title: 'Lease Agreements',
});

const { user, isLandlord, isTenant, isAdmin } = useAuth();

interface LeaseItem {
  id: string;
  unitId: string;
  tenantId: string;
  landlordId: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  depositAmount: number;
  paymentDueDay: number;
  status: string;
  tenantSignedAt: string | null;
  landlordSignedAt: string | null;
  termsAndConditions: string;
  createdAt: string;
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

const leases = ref<LeaseItem[]>([]);
const isLoading = ref(true);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const searchQuery = ref('');

// Signing modal state
const leaseToSign = ref<LeaseItem | null>(null);
const agreeToTerms = ref(false);
const isSigning = ref(false);

// View terms modal state
const viewLeaseModal = ref<LeaseItem | null>(null);

// Terminate modal state
const leaseToTerminate = ref<LeaseItem | null>(null);
const isTerminating = ref(false);

// Create lease modal state
const isCreateLeaseOpen = ref(false);
const isCreatingLease = ref(false);
const createLeaseForm = ref({
  unitId: 'unit-skyline-204b',
  tenantId: 'user-tenant-01',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  rentAmount: 2400,
  depositAmount: 2400,
  paymentDueDay: 1,
  termsAndConditions: `Standard 12-Month Residential Lease Agreement.
1. Rent is due on the 1st of each calendar month.
2. Tenant agrees to observe all quiet hours and community guidelines.
3. Security deposit is refundable within 30 days after lease termination.`,
});

async function executeCreateLease() {
  isCreatingLease.value = true;
  errorMessage.value = null;
  try {
    const res = await $fetch<ApiResponse<{ lease: any; message: string }>>('/api/v1/leases', {
      method: 'POST',
      body: {
        ...createLeaseForm.value,
        startDate: new Date(createLeaseForm.value.startDate).toISOString(),
        endDate: new Date(createLeaseForm.value.endDate).toISOString(),
      },
    });

    if (res.success) {
      successMessage.value = res.data?.message || 'Lease agreement created successfully.';
      isCreateLeaseOpen.value = false;
      await loadLeases();
      setTimeout(() => {
        successMessage.value = null;
      }, 4000);
    } else {
      errorMessage.value = res.error?.message || 'Failed to create lease contract';
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.error?.message || err?.message || 'Error generating lease contract';
  } finally {
    isCreatingLease.value = false;
  }
}

async function loadLeases() {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    const res = await $fetch<ApiResponse<{ leases: LeaseItem[] }>>('/api/v1/leases');
    if (res.success && res.data) {
      leases.value = res.data.leases;
    } else {
      errorMessage.value = res.error?.message || 'Failed to load lease agreements';
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.error?.message || err?.message || 'Error loading leases';
  } finally {
    isLoading.value = false;
  }
}

const filteredLeases = computed(() => {
  if (!searchQuery.value.trim()) return leases.value;
  const q = searchQuery.value.toLowerCase();
  return leases.value.filter((l) => {
    const unit = l.unit?.unitNumber?.toLowerCase() || '';
    const prop = l.property?.title?.toLowerCase() || '';
    const tenant = l.tenant?.fullName?.toLowerCase() || '';
    return unit.includes(q) || prop.includes(q) || tenant.includes(q);
  });
});

function openSignModal(lease: LeaseItem) {
  leaseToSign.value = lease;
  agreeToTerms.value = false;
}

async function executeSign() {
  if (!leaseToSign.value || !agreeToTerms.value) return;
  isSigning.value = true;
  errorMessage.value = null;

  try {
    const res = await $fetch<ApiResponse<{ message: string }>>(`/api/v1/leases/${leaseToSign.value.id}/sign`, {
      method: 'POST',
      body: { agreeToTerms: true },
    });

    if (res.success) {
      successMessage.value = res.data?.message || 'Lease agreement signed successfully.';
      leaseToSign.value = null;
      await loadLeases();
      setTimeout(() => {
        successMessage.value = null;
      }, 4000);
    } else {
      errorMessage.value = res.error?.message || 'Failed to sign lease';
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.error?.message || err?.message || 'Error recording signature';
  } finally {
    isSigning.value = false;
  }
}

async function executeTerminate() {
  if (!leaseToTerminate.value) return;
  isTerminating.value = true;
  try {
    const res = await $fetch<ApiResponse<{ message: string }>>(`/api/v1/leases/${leaseToTerminate.value.id}/terminate`, {
      method: 'POST',
    });
    if (res.success) {
      successMessage.value = res.data?.message || 'Lease terminated successfully.';
      leaseToTerminate.value = null;
      await loadLeases();
      setTimeout(() => {
        successMessage.value = null;
      }, 4000);
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.error?.message || err?.message || 'Error terminating lease';
  } finally {
    isTerminating.value = false;
  }
}

function userNeedsToSign(lease: LeaseItem) {
  if (lease.status === 'ACTIVE' || lease.status === 'TERMINATED') return false;
  if (isTenant.value && !lease.tenantSignedAt) return true;
  if ((isLandlord.value || isAdmin.value) && !lease.landlordSignedAt) return true;
  return false;
}

onMounted(() => {
  loadLeases();
});
</script>

<template>
  <div class="leases-page">
    <div class="page-top-bar">
      <div>
        <h1>Lease Agreements</h1>
        <p class="subtitle">
          Manage digital contracts, binding terms, dual-party signatures, and lease life cycles.
        </p>
      </div>
      <button v-if="isLandlord || isAdmin" @click="isCreateLeaseOpen = true" class="btn-primary">
        <Plus :size="15" />
        <span>Create Lease Contract</span>
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

    <!-- Leases Table Shell -->
    <div class="table-shell card-flat">
      <div class="table-toolbar">
        <div class="search-wrap">
          <Search :size="14" class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search leases by unit or property..."
            class="table-search-input"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading lease agreements...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredLeases.length === 0" class="empty-state">
        <FileText :size="32" class="empty-icon" />
        <h4>No lease agreements found</h4>
        <p>Lease agreements are generated automatically when rental applications are approved by landlords.</p>
      </div>

      <!-- Leases Table -->
      <div v-else class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Property & Unit</th>
              <th>Tenant / Landlord</th>
              <th>Lease Term</th>
              <th>Monthly Rent</th>
              <th>Signatures Status</th>
              <th>Contract Status</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="lease in filteredLeases" :key="lease.id">
              <td>
                <div class="unit-cell">
                  <span class="font-semibold">Unit {{ lease.unit?.unitNumber || '101A' }}</span>
                  <span class="text-dim text-xs">{{ lease.property?.title || 'Skyline Heights' }}</span>
                </div>
              </td>
              <td>
                <div class="parties-cell">
                  <span><strong>Tenant:</strong> {{ lease.tenant?.fullName || 'Sarah Jenkins' }}</span>
                  <span class="text-dim text-xs"><strong>Owner:</strong> {{ lease.landlord?.fullName || 'Marcus Sterling' }}</span>
                </div>
              </td>
              <td>
                <div class="date-cell">
                  <Calendar :size="13" class="text-dim" />
                  <span>
                    {{ new Date(lease.startDate).toLocaleDateString() }} – {{ new Date(lease.endDate).toLocaleDateString() }}
                  </span>
                </div>
              </td>
              <td class="font-semibold">
                ${{ lease.rentAmount.toLocaleString() }} / mo
              </td>
              <td>
                <div class="sig-status-stack">
                  <div class="sig-row">
                    <span class="sig-label">Tenant:</span>
                    <span v-if="lease.tenantSignedAt" class="sig-badge signed">
                      <CheckCircle2 :size="11" />
                      <span>Signed</span>
                    </span>
                    <span v-else class="sig-badge pending">
                      <Clock :size="11" />
                      <span>Pending</span>
                    </span>
                  </div>
                  <div class="sig-row">
                    <span class="sig-label">Landlord:</span>
                    <span v-if="lease.landlordSignedAt" class="sig-badge signed">
                      <CheckCircle2 :size="11" />
                      <span>Signed</span>
                    </span>
                    <span v-else class="sig-badge pending">
                      <Clock :size="11" />
                      <span>Pending</span>
                    </span>
                  </div>
                </div>
              </td>
              <td>
                <span
                  :class="[
                    'badge',
                    lease.status === 'ACTIVE' ? 'badge-success' :
                    lease.status === 'PENDING_SIGNATURES' ? 'badge-warning' :
                    lease.status === 'TERMINATED' ? 'badge-danger' : 'badge-subtle'
                  ]"
                >
                  {{ lease.status }}
                </span>
              </td>
              <td class="text-right">
                <div class="action-btn-group">
                  <button
                    v-if="userNeedsToSign(lease)"
                    @click="openSignModal(lease)"
                    class="btn-primary btn-sm btn-sign"
                  >
                    <FileSignature :size="13" />
                    <span>Sign Lease</span>
                  </button>
                  <button
                    @click="viewLeaseModal = lease"
                    class="btn-secondary btn-sm"
                    title="View Full Contract Terms"
                  >
                    <FileText :size="13" />
                    <span>View Terms</span>
                  </button>
                  <button
                    v-if="(isLandlord || isAdmin) && lease.status === 'ACTIVE'"
                    @click="leaseToTerminate = lease"
                    class="btn-secondary btn-sm text-danger"
                    title="Terminate Lease"
                  >
                    <Slash :size="13" />
                    <span>Terminate</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Sign Lease Modal -->
    <div v-if="leaseToSign" class="modal-backdrop">
      <div class="modal-card card-flat">
        <div class="modal-header">
          <h3>Sign Lease Contract</h3>
          <button @click="leaseToSign = null" class="modal-close">&times;</button>
        </div>

        <form @submit.prevent="executeSign" class="modal-body">
          <div class="contract-summary">
            <div><strong>Unit:</strong> Unit {{ leaseToSign.unit?.unitNumber }} ({{ leaseToSign.property?.title }})</div>
            <div><strong>Monthly Rent:</strong> ${{ leaseToSign.rentAmount.toLocaleString() }} / month</div>
            <div><strong>Deposit:</strong> ${{ leaseToSign.depositAmount.toLocaleString() }}</div>
            <div><strong>Term:</strong> {{ new Date(leaseToSign.startDate).toLocaleDateString() }} to {{ new Date(leaseToSign.endDate).toLocaleDateString() }}</div>
          </div>

          <div class="terms-preview-box">
            <span class="terms-title">Contractual Terms & Conditions:</span>
            <pre class="terms-text">{{ leaseToSign.termsAndConditions }}</pre>
          </div>

          <label class="consent-checkbox">
            <input type="checkbox" v-model="agreeToTerms" required />
            <span>I have read, acknowledge, and legally agree to the terms and obligations set forth in this lease agreement.</span>
          </label>

          <div class="modal-actions">
            <button type="button" @click="leaseToSign = null" class="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              :disabled="!agreeToTerms || isSigning"
              class="btn-primary"
            >
              <FileSignature :size="14" />
              <span>{{ isSigning ? 'Recording Signature...' : 'Confirm Digital Signature' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- View Terms Modal -->
    <div v-if="viewLeaseModal" class="modal-backdrop">
      <div class="modal-card card-flat">
        <div class="modal-header">
          <h3>Lease Contract Details</h3>
          <button @click="viewLeaseModal = null" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="contract-summary">
            <div><strong>Unit:</strong> Unit {{ viewLeaseModal.unit?.unitNumber }}</div>
            <div><strong>Tenant:</strong> {{ viewLeaseModal.tenant?.fullName }}</div>
            <div><strong>Landlord:</strong> {{ viewLeaseModal.landlord?.fullName }}</div>
            <div><strong>Rent:</strong> ${{ viewLeaseModal.rentAmount }} / month (Due day: {{ viewLeaseModal.paymentDueDay }}st)</div>
            <div><strong>Status:</strong> <span class="badge badge-success">{{ viewLeaseModal.status }}</span></div>
          </div>

          <div class="terms-preview-box">
            <span class="terms-title">Full Terms:</span>
            <pre class="terms-text">{{ viewLeaseModal.termsAndConditions }}</pre>
          </div>

          <div class="modal-actions">
            <button @click="viewLeaseModal = null" class="btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Terminate Modal -->
    <div v-if="leaseToTerminate" class="modal-backdrop">
      <div class="modal-card card-flat">
        <div class="modal-header">
          <h3>Terminate Active Lease</h3>
          <button @click="leaseToTerminate = null" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <p>
            Are you sure you want to terminate the active lease for <strong>Unit {{ leaseToTerminate.unit?.unitNumber }}</strong>?
          </p>
          <p class="text-sm text-muted">
            Terminating this lease will set its status to TERMINATED and return the unit status to <strong>AVAILABLE</strong> for new prospective tenants.
          </p>
          <div class="modal-actions">
            <button
              @click="executeTerminate"
              :disabled="isTerminating"
              class="btn-primary btn-danger-action"
            >
              <span>{{ isTerminating ? 'Terminating...' : 'Confirm Termination' }}</span>
            </button>
            <button @click="leaseToTerminate = null" class="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Lease Modal -->
    <div v-if="isCreateLeaseOpen" class="modal-backdrop">
      <div class="modal-card card-flat" style="max-width: 620px;">
        <div class="modal-header">
          <h3>Create Lease Contract</h3>
          <button @click="isCreateLeaseOpen = false" class="modal-close">&times;</button>
        </div>

        <form @submit.prevent="executeCreateLease" class="modal-body">
          <div class="grid-2-col">
            <div class="form-group">
              <label class="form-label">Unit Reference ID</label>
              <input
                v-model="createLeaseForm.unitId"
                type="text"
                required
                class="form-control"
                placeholder="e.g. unit-skyline-204b"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Tenant User ID</label>
              <input
                v-model="createLeaseForm.tenantId"
                type="text"
                required
                class="form-control"
                placeholder="e.g. user-tenant-01"
              />
            </div>
          </div>

          <div class="grid-2-col">
            <div class="form-group">
              <label class="form-label">Start Date</label>
              <input
                v-model="createLeaseForm.startDate"
                type="date"
                required
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label class="form-label">End Date</label>
              <input
                v-model="createLeaseForm.endDate"
                type="date"
                required
                class="form-control"
              />
            </div>
          </div>

          <div class="grid-3-col">
            <div class="form-group">
              <label class="form-label">Monthly Rent ($)</label>
              <input
                v-model.number="createLeaseForm.rentAmount"
                type="number"
                min="0"
                step="1"
                required
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Deposit ($)</label>
              <input
                v-model.number="createLeaseForm.depositAmount"
                type="number"
                min="0"
                step="1"
                required
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Due Day (1-28)</label>
              <input
                v-model.number="createLeaseForm.paymentDueDay"
                type="number"
                min="1"
                max="28"
                required
                class="form-control"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Contractual Terms & Obligations</label>
            <textarea
              v-model="createLeaseForm.termsAndConditions"
              rows="4"
              required
              class="form-control"
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" @click="isCreateLeaseOpen = false" class="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isCreatingLease"
              class="btn-primary"
            >
              <Plus :size="14" />
              <span>{{ isCreatingLease ? 'Generating Contract...' : 'Create Contract' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.leases-page {
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

.table-shell {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.table-toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
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

.unit-cell,
.parties-cell {
  display: flex;
  flex-direction: column;
}

.date-cell {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
}

.sig-status-stack {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.sig-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
}

.sig-label {
  color: var(--text-dim);
  width: 50px;
}

.sig-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.1rem 0.4rem;
  border-radius: var(--radius-sm);
}

.sig-badge.signed {
  background: var(--accent-emerald-subtle);
  color: #34d399;
}

.sig-badge.pending {
  background: var(--accent-amber-subtle);
  color: #fbbf24;
}

.font-semibold {
  font-weight: 600;
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

.text-right {
  text-align: right;
}

.action-btn-group {
  display: inline-flex;
  gap: 0.35rem;
}

.btn-sm {
  padding: 0.35rem 0.65rem;
  font-size: 0.8rem;
  gap: 0.3rem;
}

.btn-sign {
  background-color: var(--primary);
}

.text-danger {
  color: #f87171;
}

.text-danger:hover {
  border-color: rgba(239, 68, 68, 0.4);
}

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

/* Modal */
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
  max-width: 540px;
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

.terms-preview-box {
  background: var(--bg-input);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.terms-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-dim);
}

.terms-text {
  font-family: inherit;
  font-size: 0.8rem;
  color: var(--text-muted);
  white-space: pre-wrap;
  line-height: 1.5;
}

.consent-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  font-size: 0.85rem;
  color: var(--text-main);
  cursor: pointer;
}

.consent-checkbox input {
  margin-top: 0.2rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.btn-danger-action {
  background-color: var(--accent-rose);
}

.btn-danger-action:hover {
  background-color: #dc2626;
}

.grid-2-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.grid-3-col {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
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

@media (max-width: 640px) {
  .grid-2-col,
  .grid-3-col {
    grid-template-columns: 1fr;
  }
}
</style>
