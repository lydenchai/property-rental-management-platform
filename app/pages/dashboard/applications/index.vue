<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  ClipboardList, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Building, 
  User, 
  FileSignature, 
  FileText,
  DollarSign,
  Calendar,
  MessageSquare
} from '@lucide/vue';
import { useAuth } from '../../../composables/useAuth';
import type { ApiResponse } from '../../../../shared/types/api';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  title: 'Rental Applications',
});

const { user, isLandlord, isTenant, isAdmin } = useAuth();

interface ApplicationItem {
  id: string;
  unitId: string;
  tenantId: string;
  status: string;
  desiredMoveInDate: string;
  proposedRent: number;
  employmentDetails: string;
  notes: string | null;
  reviewedById: string | null;
  reviewedAt: string | null;
  reviewReason: string | null;
  createdAt: string;
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

const applications = ref<ApplicationItem[]>([]);
const isLoading = ref(true);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const activeTab = ref<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
const searchQuery = ref('');

// Review modal state
const appToReview = ref<ApplicationItem | null>(null);
const reviewDecision = ref<'APPROVED' | 'REJECTED'>('APPROVED');
const reviewReason = ref('');
const isSubmittingReview = ref(false);

async function loadApplications() {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    const res = await $fetch<ApiResponse<{ applications: ApplicationItem[] }>>('/api/v1/applications');
    if (res.success && res.data) {
      applications.value = res.data.applications;
    } else {
      errorMessage.value = res.error?.message || 'Failed to fetch applications';
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.error?.message || err?.message || 'Error loading applications';
  } finally {
    isLoading.value = false;
  }
}

const filteredApplications = computed(() => {
  return applications.value.filter((app) => {
    if (activeTab.value !== 'ALL' && app.status !== activeTab.value) return false;
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase();
      const unitNum = app.unit?.unitNumber?.toLowerCase() || '';
      const propTitle = app.property?.title?.toLowerCase() || '';
      const tenantName = app.tenant?.fullName?.toLowerCase() || '';
      if (!unitNum.includes(q) && !propTitle.includes(q) && !tenantName.includes(q)) return false;
    }
    return true;
  });
});

function openReviewModal(app: ApplicationItem, decision: 'APPROVED' | 'REJECTED') {
  appToReview.value = app;
  reviewDecision.value = decision;
  reviewReason.value = decision === 'APPROVED' 
    ? 'Application meets credit and income criteria. Lease agreement drafted.' 
    : 'Unable to approve application at this time based on qualification criteria.';
}

async function submitReview() {
  if (!appToReview.value) return;
  isSubmittingReview.value = true;
  errorMessage.value = null;

  try {
    const res = await $fetch<ApiResponse<any>>(`/api/v1/applications/${appToReview.value.id}/review`, {
      method: 'POST',
      body: {
        status: reviewDecision.value,
        reason: reviewReason.value,
      },
    });

    if (res.success) {
      successMessage.value = res.data?.message || `Application ${reviewDecision.value.toLowerCase()} successfully.`;
      appToReview.value = null;
      await loadApplications();
      setTimeout(() => {
        successMessage.value = null;
      }, 4000);
    } else {
      errorMessage.value = res.error?.message || 'Failed to review application';
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.error?.message || err?.message || 'Error processing review';
  } finally {
    isSubmittingReview.value = false;
  }
}

onMounted(() => {
  loadApplications();
});
</script>

<template>
  <div class="applications-page">
    <div class="page-top-bar">
      <div>
        <h1>Rental Applications</h1>
        <p class="subtitle">
          <template v-if="isTenant">
            Track the status of your submitted tenancy applications and review landlord decisions.
          </template>
          <template v-else>
            Review prospective tenant submissions, inspect employment credentials, and approve leases.
          </template>
        </p>
      </div>

      <NuxtLink v-if="isTenant" to="/properties" class="btn-primary">
        <Building :size="15" />
        <span>Browse Available Units</span>
      </NuxtLink>
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

    <!-- Filter & Table Shell -->
    <div class="table-shell card-flat">
      <div class="table-toolbar">
        <div class="tab-pill-group">
          <button
            @click="activeTab = 'ALL'"
            :class="['tab-pill', { active: activeTab === 'ALL' }]"
          >
            All ({{ applications.length }})
          </button>
          <button
            @click="activeTab = 'PENDING'"
            :class="['tab-pill', { active: activeTab === 'PENDING' }]"
          >
            Pending ({{ applications.filter(a => a.status === 'PENDING').length }})
          </button>
          <button
            @click="activeTab = 'APPROVED'"
            :class="['tab-pill', { active: activeTab === 'APPROVED' }]"
          >
            Approved ({{ applications.filter(a => a.status === 'APPROVED').length }})
          </button>
          <button
            @click="activeTab = 'REJECTED'"
            :class="['tab-pill', { active: activeTab === 'REJECTED' }]"
          >
            Rejected ({{ applications.filter(a => a.status === 'REJECTED').length }})
          </button>
        </div>

        <div class="search-wrap">
          <Search :size="14" class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by unit or property..."
            class="table-search-input"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading rental applications...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredApplications.length === 0" class="empty-state">
        <ClipboardList :size="32" class="empty-icon" />
        <h4>No applications found</h4>
        <p v-if="isTenant">You haven't submitted any rental applications yet. Browse properties to apply for a unit.</p>
        <p v-else>No applications match the selected filter criteria.</p>
      </div>

      <!-- Applications Table -->
      <div v-else class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Property & Unit</th>
              <th v-if="!isTenant">Applicant</th>
              <th>Move-in Date</th>
              <th>Proposed Rent</th>
              <th>Status</th>
              <th>Submitted</th>
              <th class="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="app in filteredApplications" :key="app.id">
              <td>
                <div class="unit-cell">
                  <span class="font-semibold">Unit {{ app.unit?.unitNumber || 'N/A' }}</span>
                  <span class="text-dim text-sm">{{ app.property?.title || 'Skyline Complex' }}</span>
                </div>
              </td>
              <td v-if="!isTenant">
                <div class="applicant-cell">
                  <span class="font-medium">{{ app.tenant?.fullName || 'Prospective Tenant' }}</span>
                  <span class="text-dim text-xs">{{ app.tenant?.email }}</span>
                </div>
              </td>
              <td>
                <div class="date-cell">
                  <Calendar :size="13" class="text-dim" />
                  <span>{{ new Date(app.desiredMoveInDate).toLocaleDateString() }}</span>
                </div>
              </td>
              <td class="font-semibold">
                ${{ app.proposedRent.toLocaleString() }} / mo
              </td>
              <td>
                <span
                  :class="[
                    'badge',
                    app.status === 'APPROVED' ? 'badge-success' :
                    app.status === 'PENDING' ? 'badge-warning' :
                    app.status === 'REJECTED' ? 'badge-danger' : 'badge-subtle'
                  ]"
                >
                  {{ app.status }}
                </span>
              </td>
              <td class="text-muted text-sm">
                {{ new Date(app.createdAt).toLocaleDateString() }}
              </td>
              <td class="text-right">
                <!-- Tenant Actions -->
                <div v-if="isTenant">
                  <span v-if="app.status === 'APPROVED'" class="text-emerald text-sm font-semibold">
                    Approved — Check Leases
                  </span>
                  <span v-else-if="app.status === 'PENDING'" class="text-amber text-sm">
                    In Landlord Review
                  </span>
                  <span v-else class="text-dim text-sm">
                    Resolved
                  </span>
                </div>

                <!-- Landlord / Admin Review Actions -->
                <div v-else class="action-btn-group">
                  <template v-if="app.status === 'PENDING'">
                    <button
                      @click="openReviewModal(app, 'APPROVED')"
                      class="btn-primary btn-sm btn-approve"
                      title="Approve Application & Generate Lease"
                    >
                      <CheckCircle2 :size="13" />
                      <span>Approve</span>
                    </button>
                    <button
                      @click="openReviewModal(app, 'REJECTED')"
                      class="btn-secondary btn-sm text-danger"
                      title="Reject Application"
                    >
                      <XCircle :size="13" />
                      <span>Reject</span>
                    </button>
                  </template>
                  <span v-else-if="app.status === 'APPROVED'" class="text-emerald text-xs font-semibold">
                    Lease Drafted
                  </span>
                  <span v-else class="text-dim text-xs">
                    Rejected
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Review Decision Modal -->
    <div v-if="appToReview" class="modal-backdrop">
      <div class="modal-card card-flat">
        <div class="modal-header">
          <h3>
            {{ reviewDecision === 'APPROVED' ? 'Approve Application & Draft Lease' : 'Reject Application' }}
          </h3>
          <button @click="appToReview = null" class="modal-close">&times;</button>
        </div>

        <form @submit.prevent="submitReview" class="modal-body">
          <div class="app-summary-card">
            <div><strong>Applicant:</strong> {{ appToReview.tenant?.fullName || 'Tenant' }} ({{ appToReview.tenant?.email }})</div>
            <div><strong>Unit:</strong> Unit {{ appToReview.unit?.unitNumber }} ({{ appToReview.property?.title }})</div>
            <div><strong>Desired Move-in:</strong> {{ new Date(appToReview.desiredMoveInDate).toLocaleDateString() }}</div>
            <div><strong>Proposed Rent:</strong> ${{ appToReview.proposedRent }}/month</div>
            <div class="employment-box mt-2">
              <span class="box-label">Employment & Income Credentials:</span>
              <p>{{ appToReview.employmentDetails }}</p>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Review Decision Notes / Message to Tenant *</label>
            <textarea
              v-model="reviewReason"
              rows="3"
              required
              class="input-field"
              placeholder="Provide confirmation notes or reason for rejection..."
            ></textarea>
          </div>

          <p v-if="reviewDecision === 'APPROVED'" class="approval-notice text-sm text-muted">
            Approving this application will automatically mark Unit {{ appToReview.unit?.unitNumber }} as <strong>RESERVED</strong> and generate a digital lease agreement ready for signature.
          </p>

          <div class="modal-actions">
            <button type="button" @click="appToReview = null" class="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmittingReview"
              :class="['btn-primary', reviewDecision === 'REJECTED' ? 'btn-danger-action' : '']"
            >
              <span>{{ isSubmittingReview ? 'Processing...' : (reviewDecision === 'APPROVED' ? 'Confirm Approval' : 'Confirm Rejection') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.applications-page {
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
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.tab-pill-group {
  display: flex;
  gap: 0.35rem;
}

.tab-pill {
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tab-pill:hover {
  background: var(--bg-surface-hover);
  color: var(--text-main);
}

.tab-pill.active {
  background: var(--primary-subtle);
  border-color: var(--primary);
  color: #818cf8;
  font-weight: 600;
}

.search-wrap {
  position: relative;
  width: 100%;
  max-width: 300px;
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
.applicant-cell {
  display: flex;
  flex-direction: column;
}

.date-cell {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
}

.font-semibold {
  font-weight: 600;
}

.font-medium {
  font-weight: 500;
}

.text-dim {
  color: var(--text-dim);
}

.text-sm {
  font-size: 0.825rem;
}

.text-xs {
  font-size: 0.75rem;
}

.text-right {
  text-align: right;
}

.text-emerald {
  color: #34d399;
}

.text-amber {
  color: #fbbf24;
}

.text-danger {
  color: #f87171;
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

.btn-approve {
  background-color: var(--accent-emerald);
}

.btn-approve:hover {
  background-color: #059669;
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
  max-width: 520px;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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

.app-summary-card {
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  padding: 0.85rem 1rem;
  font-size: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.employment-box {
  border-top: 1px solid var(--border-subtle);
  padding-top: 0.5rem;
}

.box-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-dim);
  text-transform: uppercase;
}

.employment-box p {
  color: var(--text-main);
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
</style>
