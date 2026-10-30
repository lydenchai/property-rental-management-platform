<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building,
  Calendar,
  X,
} from '@lucide/vue';
import { useAuth } from '../../../composables/useAuth';
import { useToast } from '../../../composables/useToast';
import { useApplicationStore } from '../../../stores/application.store';
import type { ApplicationItem, TableColumn } from '~~/shared/types';
import AppTableCard from '../../../components/common/AppTableCard.vue';
import AppDataTable from '../../../components/common/AppDataTable.vue';
import ApplicationReviewModal from '../../../components/applications/ApplicationReviewModal.vue';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  title: 'Rental Applications',
});

const { t } = useI18n();
const { isTenant, isLandlord, isAdmin } = useAuth();
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

const { loadApplications, reviewApplication } = applicationStore;

const successMessage = ref<string | null>(null);
const toast = useToast();
const activeTab = ref<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
const searchQuery = ref('');

// Review modal state
const appToReview = ref<ApplicationItem | null>(null);
const reviewDecision = ref<'APPROVED' | 'REJECTED'>('APPROVED');
const reviewError = ref<string | null>(null);

const filteredApplications = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  const tab = activeTab.value;

  return applications.value.filter((app) => {
    if (tab !== 'ALL' && app.status !== tab) return false;
    if (query) {
      const unitNum = app.unit?.unitNumber?.toLowerCase() || '';
      const propTitle = app.property?.title?.toLowerCase() || '';
      const tenantName = app.tenant?.fullName?.toLowerCase() || '';
      const tenantEmail = app.tenant?.email?.toLowerCase() || '';
      if (
        !unitNum.includes(query) &&
        !propTitle.includes(query) &&
        !tenantName.includes(query) &&
        !tenantEmail.includes(query)
      ) {
        return false;
      }
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

const columns = computed<TableColumn[]>(() => {
  const cols: TableColumn[] = [{ key: 'property', label: t('applications.col_property') }];
  if (!isTenant.value) {
    cols.push({ key: 'applicant', label: t('applications.col_applicant') });
  }
  cols.push(
    { key: 'moveIn', label: t('applications.col_move_in') },
    { key: 'rent', label: t('leases.col_rent') },
    { key: 'status', label: t('applications.col_status') },
    { key: 'submitted', label: t('applications.col_submitted') },
    { key: 'actions', label: t('applications.col_actions'), align: 'right' }
  );
  return cols;
});

watch([activeTab, searchQuery], () => {
  currentPage.value = 1;
});

function openReviewModal(app: ApplicationItem, decision: 'APPROVED' | 'REJECTED') {
  appToReview.value = app;
  reviewDecision.value = decision;
  reviewError.value = null;
}

async function handleSubmitReview(payload: { applicationId: string; reason: string }) {
  if (isSubmittingReview.value) return;

  reviewError.value = null;
  const res = (await reviewApplication(payload.applicationId, {
    status: reviewDecision.value,
    reason: payload.reason,
  })) as any;

  if (res.success) {
    const msg = res.message || `Application ${reviewDecision.value.toLowerCase()} successfully.`;
    successMessage.value = msg;
    toast.success(msg);
    appToReview.value = null;
    reviewError.value = null;
    setTimeout(() => {
      successMessage.value = null;
    }, 4000);
  } else {
    reviewError.value = res.error || 'Failed to review application. Please try again.';
  }
}

onMounted(() => {
  loadApplications();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {{ t('applications.title') }}
        </h1>
        <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          <template v-if="isTenant">
            {{ t('applications.tenant_subtitle') }}
          </template>
          <template v-else>
            {{ t('applications.subtitle') }}
          </template>
        </p>
      </div>

      <NuxtLink
        v-if="isTenant"
        to="/properties"
        class="shadow-xs inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
      >
        <Building :size="16" />
        <span>{{ t('dashboard.metrics.browse_available_units') }}</span>
      </NuxtLink>
    </div>

    <!-- Alert Messages -->
    <div
      v-if="successMessage"
      class="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300"
    >
      <CheckCircle2 :size="18" class="shrink-0 text-emerald-600 dark:text-emerald-400" />
      <span>{{ successMessage }}</span>
    </div>

    <div
      v-if="errorMessage"
      class="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300"
    >
      <AlertCircle :size="18" class="shrink-0 text-rose-600 dark:text-rose-400" />
      <div class="flex flex-1 flex-wrap items-center justify-between gap-2">
        <span>{{ errorMessage }}</span>
        <NuxtLink
          v-if="errorMessage.toLowerCase().includes('logged in')"
          :to="{ path: '/login', query: { redirect: $route.fullPath } }"
          class="font-semibold underline hover:text-rose-900 dark:hover:text-rose-200"
        >
          {{ t('nav.sign_in') }}
        </NuxtLink>
      </div>
    </div>

    <!-- Applications Table using shared AppTableCard -->
    <AppTableCard
      v-model:search="searchQuery"
      :search-placeholder="t('applications.title')"
      :is-loading="isLoading"
      :is-empty="filteredApplications.length === 0"
      :empty-title="t('applications.no_applications')"
      :empty-description="t('applications.no_applications_desc')"
      :empty-icon="ClipboardList"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total-items="filteredApplications.length"
      :item-name="t('common.records')"
    >
      <template #toolbar-start>
        <div class="inline-flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            @click="activeTab = 'ALL'"
            :class="[
              'inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
              activeTab === 'ALL'
                ? 'shadow-xs border-primary-600 bg-primary-600 font-semibold text-white'
                : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700',
            ]"
          >
            <span>{{ t('applications.filter_all') }}</span>
            <span
              :class="[
                'rounded-full px-1.5 py-0.5 text-[10px]',
                activeTab === 'ALL'
                  ? 'bg-primary-700 text-white'
                  : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300',
              ]"
              >{{ totalCount }}</span
            >
          </button>
          <button
            type="button"
            @click="activeTab = 'PENDING'"
            :class="[
              'inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
              activeTab === 'PENDING'
                ? 'shadow-xs border-primary-600 bg-primary-600 font-semibold text-white'
                : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700',
            ]"
          >
            <span>{{ t('applications.filter_pending') }}</span>
            <span
              :class="[
                'rounded-full px-1.5 py-0.5 text-[10px]',
                activeTab === 'PENDING'
                  ? 'bg-primary-700 text-white'
                  : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300',
              ]"
              >{{ pendingCount }}</span
            >
          </button>
          <button
            type="button"
            @click="activeTab = 'APPROVED'"
            :class="[
              'inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
              activeTab === 'APPROVED'
                ? 'shadow-xs border-primary-600 bg-primary-600 font-semibold text-white'
                : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700',
            ]"
          >
            <span>{{ t('applications.filter_approved') }}</span>
            <span
              :class="[
                'rounded-full px-1.5 py-0.5 text-[10px]',
                activeTab === 'APPROVED'
                  ? 'bg-primary-700 text-white'
                  : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300',
              ]"
              >{{ approvedCount }}</span
            >
          </button>
          <button
            type="button"
            @click="activeTab = 'REJECTED'"
            :class="[
              'inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
              activeTab === 'REJECTED'
                ? 'shadow-xs border-primary-600 bg-primary-600 font-semibold text-white'
                : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700',
            ]"
          >
            <span>{{ t('applications.filter_rejected') }}</span>
            <span
              :class="[
                'rounded-full px-1.5 py-0.5 text-[10px]',
                activeTab === 'REJECTED'
                  ? 'bg-primary-700 text-white'
                  : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300',
              ]"
              >{{ rejectedCount }}</span
            >
          </button>
        </div>
      </template>

      <AppDataTable
        :columns="columns"
        :items="paginatedApplications"
        :is-loading="isLoading"
        min-width="min-w-[750px]"
      >
        <template #cell-property="slotProps">
          <div class="flex flex-col">
            <span class="font-semibold text-neutral-900 dark:text-white"
              >{{ t('dashboard.metrics.unit') }}
              {{ slotProps?.item?.unit?.unitNumber || 'N/A' }}</span
            >
            <span class="text-xs text-neutral-500 dark:text-neutral-400">{{
              slotProps?.item?.property?.title || 'Skyline Complex'
            }}</span>
          </div>
        </template>

        <template #cell-applicant="slotProps">
          <div class="flex flex-col">
            <span class="font-medium text-neutral-900 dark:text-white">{{
              slotProps?.item?.tenant?.fullName || 'Prospective Tenant'
            }}</span>
            <span class="text-xs text-neutral-500 dark:text-neutral-400">{{
              slotProps?.item?.tenant?.email || 'N/A'
            }}</span>
          </div>
        </template>

        <template #cell-moveIn="slotProps">
          <div class="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300">
            <Calendar :size="14" class="shrink-0 text-neutral-400" />
            <span>{{
              slotProps?.item?.desiredMoveInDate
                ? new Date(slotProps.item.desiredMoveInDate).toLocaleDateString()
                : '—'
            }}</span>
          </div>
        </template>

        <template #cell-rent="slotProps">
          <div class="font-semibold text-neutral-900 dark:text-white">
            ${{
              slotProps?.item?.proposedRent ? slotProps.item.proposedRent.toLocaleString() : '0'
            }}
            <span class="text-xs font-normal text-neutral-500">{{
              t('properties.rent_per_month')
            }}</span>
          </div>
        </template>

        <template #cell-status="slotProps">
          <span
            :class="[
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
              slotProps?.item?.status === 'APPROVED'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                : slotProps?.item?.status === 'PENDING'
                  ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                  : slotProps?.item?.status === 'REJECTED'
                    ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-400'
                    : 'border-neutral-200 bg-neutral-100 text-neutral-700',
            ]"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
            <span>{{
              slotProps?.item?.status === 'PENDING'
                ? t('applications.status.pending')
                : slotProps?.item?.status === 'APPROVED'
                  ? t('applications.status.approved')
                  : slotProps?.item?.status === 'REJECTED'
                    ? t('applications.status.rejected')
                    : slotProps?.item?.status || '—'
            }}</span>
          </span>
        </template>

        <template #cell-submitted="slotProps">
          <span class="text-xs text-neutral-500 dark:text-neutral-400">
            {{
              slotProps?.item?.createdAt
                ? new Date(slotProps.item.createdAt).toLocaleDateString()
                : '—'
            }}
          </span>
        </template>

        <template #cell-actions="slotProps">
          <!-- Tenant Actions -->
          <div v-if="isTenant">
            <span
              v-if="slotProps?.item?.status === 'APPROVED'"
              class="text-xs font-semibold text-emerald-600 dark:text-emerald-400"
            >
              {{ t('applications.status.approved') }}
            </span>
            <span
              v-else-if="slotProps?.item?.status === 'PENDING'"
              class="text-xs text-amber-600 dark:text-amber-400"
            >
              {{ t('applications.status.pending') }}
            </span>
            <span v-else class="text-xs text-neutral-500 dark:text-neutral-400">
              {{ t('applications.status.rejected') }}
            </span>
          </div>

          <!-- Landlord / Admin Review Actions -->
          <div
            v-else-if="isLandlord || isAdmin"
            class="inline-flex items-center justify-end gap-1.5 whitespace-nowrap"
          >
            <template v-if="slotProps?.item?.status === 'PENDING'">
              <button
                @click="slotProps?.item && openReviewModal(slotProps.item, 'APPROVED')"
                class="shadow-xs inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
                :title="t('applications.approve')"
              >
                <CheckCircle2 :size="13" />
                <span>{{ t('applications.approve') }}</span>
              </button>
              <button
                @click="slotProps?.item && openReviewModal(slotProps.item, 'REJECTED')"
                class="inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-rose-200 px-3 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/30"
                :title="t('applications.reject')"
              >
                <XCircle :size="13" />
                <span>{{ t('applications.reject') }}</span>
              </button>
            </template>
            <span
              v-else-if="slotProps?.item?.status === 'APPROVED'"
              class="text-xs font-medium text-emerald-600 dark:text-emerald-400"
            >
              Lease Drafted
            </span>
            <span v-else class="text-xs text-neutral-400 dark:text-neutral-500"> Rejected </span>
          </div>
          <div v-else class="text-xs text-neutral-400 dark:text-neutral-500">
            {{ t('common.not_available') }}
          </div>
        </template>
      </AppDataTable>
    </AppTableCard>

    <!-- Review Decision Modal -->
    <ApplicationReviewModal
      :application="appToReview"
      :decision="reviewDecision"
      :is-submitting="isSubmittingReview"
      :error="reviewError"
      @close="appToReview = null"
      @submit="handleSubmitReview"
    />
  </div>
</template>
