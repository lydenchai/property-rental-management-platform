<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
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
import { useApplicationStore } from '../../../stores/application.store';
import type { ApplicationItem } from '~~/shared/types';
import AppTableCard from '../../../components/common/AppTableCard.vue';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  title: 'Rental Applications',
});

const { t } = useI18n();
const { user, isLandlord, isTenant, isAdmin } = useAuth();
const applicationStore = useApplicationStore();

const {
  applications,
  isLoading,
  isSubmittingReview,
  errorMessage,
  totalCount,
  pendingCount,
  approvedCount,
  rejectedCount,
} = applicationStore;

const {
  fetchApplications,
  loadApplications,
  reviewApplication,
} = applicationStore;

const successMessage = ref<string | null>(null);
const activeTab = ref<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
const searchQuery = ref('');

// Review modal state
const appToReview = ref<ApplicationItem | null>(null);
const reviewDecision = ref<'APPROVED' | 'REJECTED'>('APPROVED');
const reviewReason = ref('');

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

// Pagination state
const currentPage = ref(1);
const pageSize = ref(5);

const paginatedApplications = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredApplications.value.slice(start, start + pageSize.value);
});

watch([activeTab, searchQuery], () => {
  currentPage.value = 1;
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
  const res = await reviewApplication(appToReview.value.id, {
    status: reviewDecision.value,
    reason: reviewReason.value,
  }) as any;

  if (res.success) {
    successMessage.value = res.message || `Application ${reviewDecision.value.toLowerCase()} successfully.`;
    appToReview.value = null;
    setTimeout(() => {
      successMessage.value = null;
    }, 4000);
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
        <h1>{{ t('applications.title') }}</h1>
        <p class="subtitle">
          <template v-if="isTenant">
            {{ t('applications.tenant_subtitle') }}
          </template>
          <template v-else>
            {{ t('applications.subtitle') }}
          </template>
        </p>
      </div>

      <NuxtLink v-if="isTenant" to="/properties" class="btn-primary">
        <Building :size="15" />
        <span>{{ t('dashboard.metrics.browse_available_units') }}</span>
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
        <NuxtLink v-if="errorMessage.toLowerCase().includes('logged in')"
          :to="{ path: '/login', query: { redirect: $route.fullPath } }" class="alert-action-btn">
          {{ t('nav.sign_in') }}
        </NuxtLink>
      </div>
    </div>

    <!-- Applications Table using shared AppTableCard -->
    <AppTableCard v-model:search="searchQuery" :search-placeholder="t('applications.title')"
      :is-loading="isLoading" :is-empty="filteredApplications.length === 0" :empty-title="t('applications.no_applications')"
      :empty-description="t('applications.no_applications_desc')"
      :empty-icon="ClipboardList" v-model:current-page="currentPage" v-model:page-size="pageSize"
      :total-items="filteredApplications.length" :item-name="t('common.records')">
      <template #toolbar-start>
        <div class="filter-btn-group tab-pill-group">
          <button type="button" @click="activeTab = 'ALL'" :class="['filter-btn tab-pill', { active: activeTab === 'ALL' }]">
            <span>{{ t('applications.filter_all') }}</span>
            <span class="filter-count">{{ applications.length }}</span>
          </button>
          <button type="button" @click="activeTab = 'PENDING'" :class="['filter-btn tab-pill', { active: activeTab === 'PENDING' }]">
            <span>{{ t('applications.filter_pending') }}</span>
            <span class="filter-count">{{ applications.filter(a => a.status === 'PENDING').length }}</span>
          </button>
          <button type="button" @click="activeTab = 'APPROVED'" :class="['filter-btn tab-pill', { active: activeTab === 'APPROVED' }]">
            <span>{{ t('applications.filter_approved') }}</span>
            <span class="filter-count">{{ applications.filter(a => a.status === 'APPROVED').length }}</span>
          </button>
          <button type="button" @click="activeTab = 'REJECTED'" :class="['filter-btn tab-pill', { active: activeTab === 'REJECTED' }]">
            <span>{{ t('applications.filter_rejected') }}</span>
            <span class="filter-count">{{ applications.filter(a => a.status === 'REJECTED').length }}</span>
          </button>
        </div>
      </template>

      <table class="data-table">
        <thead>
          <tr>
            <th>{{ t('applications.col_property') }}</th>
            <th v-if="!isTenant">{{ t('applications.col_applicant') }}</th>
            <th>{{ t('applications.col_move_in') }}</th>
            <th>{{ t('leases.col_rent') }}</th>
            <th>{{ t('applications.col_status') }}</th>
            <th>{{ t('applications.col_submitted') }}</th>
            <th class="text-right">{{ t('applications.col_actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="app in paginatedApplications" :key="app.id">
            <td>
              <div class="unit-cell">
                <span class="font-semibold">{{ t('dashboard.metrics.unit') }} {{ app.unit?.unitNumber || 'N/A' }}</span>
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
              ${{ app.proposedRent.toLocaleString() }} {{ t('properties.rent_per_month') }}
            </td>
            <td>
              <span :class="[
                'badge badge-pill',
                app.status === 'APPROVED' ? 'badge-success' :
                  app.status === 'PENDING' ? 'badge-warning' :
                    app.status === 'REJECTED' ? 'badge-danger' : 'badge-subtle'
              ]">
                <span class="badge-dot"></span>
                <span>{{ app.status === 'PENDING' ? t('applications.status.pending') : app.status === 'APPROVED' ? t('applications.status.approved') : app.status === 'REJECTED' ? t('applications.status.rejected') : app.status }}</span>
              </span>
            </td>
            <td class="text-muted text-sm">
              {{ new Date(app.createdAt).toLocaleDateString() }}
            </td>
            <td class="text-right">
              <!-- Tenant Actions -->
              <div v-if="isTenant">
                <span v-if="app.status === 'APPROVED'" class="text-emerald text-sm font-semibold">
                  {{ t('applications.status.approved') }}
                </span>
                <span v-else-if="app.status === 'PENDING'" class="text-amber text-sm">
                  {{ t('applications.status.pending') }}
                </span>
                <span v-else class="text-dim text-sm">
                  {{ t('applications.status.rejected') }}
                </span>
              </div>

              <!-- Landlord / Admin Review Actions -->
              <div v-else class="action-btn-group">
                <template v-if="app.status === 'PENDING'">
                  <button @click="openReviewModal(app, 'APPROVED')" class="btn-primary btn-sm btn-approve"
                    :title="t('applications.approve')">
                    <CheckCircle2 :size="13" />
                    <span>{{ t('applications.approve') }}</span>
                  </button>
                  <button @click="openReviewModal(app, 'REJECTED')" class="btn-secondary btn-sm text-danger"
                    :title="t('applications.reject')">
                    <XCircle :size="13" />
                    <span>{{ t('applications.reject') }}</span>
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
    </AppTableCard>

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
            <div><strong>Applicant:</strong> {{ appToReview.tenant?.fullName || 'Tenant' }} ({{
              appToReview.tenant?.email
              }})</div>
            <div><strong>Unit:</strong> Unit {{ appToReview.unit?.unitNumber }} ({{ appToReview.property?.title }})
            </div>
            <div><strong>Desired Move-in:</strong> {{ new Date(appToReview.desiredMoveInDate).toLocaleDateString() }}
            </div>
            <div><strong>Proposed Rent:</strong> ${{ appToReview.proposedRent }}/month</div>
            <div class="employment-box mt-2">
              <span class="box-label">Employment & Income Credentials:</span>
              <p>{{ appToReview.employmentDetails }}</p>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Review Decision Notes / Message to Tenant *</label>
            <textarea v-model="reviewReason" rows="3" required class="input-field"
              placeholder="Provide confirmation notes or reason for rejection..."></textarea>
          </div>

          <p v-if="reviewDecision === 'APPROVED'" class="approval-notice text-sm text-muted">
            Approving this application will automatically mark Unit {{ appToReview.unit?.unitNumber }} as
            <strong>RESERVED</strong> and generate a digital lease agreement ready for signature.
          </p>

          <div class="modal-actions">
            <button type="button" @click="appToReview = null" class="btn-secondary">
              Cancel
            </button>
            <button type="submit" :disabled="isSubmittingReview"
              :class="['btn-primary', reviewDecision === 'REJECTED' ? 'btn-danger-action' : '']">
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

.filter-btn-group,
.tab-pill-group {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  flex-wrap: wrap;
}

.filter-btn,
.tab-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.42rem 0.85rem;
  font-size: 0.825rem;
  font-weight: 500;
  line-height: 1.25;
  color: var(--text-muted);
  background-color: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.filter-btn:hover,
.tab-pill:hover {
  color: var(--text-main);
  background-color: var(--bg-surface-hover);
  border-color: var(--border-default);
}

.filter-btn.active,
.tab-pill.active {
  color: #ffffff !important;
  background-color: var(--primary) !important;
  border-color: var(--primary) !important;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(37, 99, 235, 0.2);
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
  color: var(--color-emerald-accent);
}

.text-amber {
  color: var(--color-amber-accent);
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
  to {
    transform: rotate(360deg);
  }
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
