<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import {
  FileText,
  FileSignature,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  X,
  Slash,
  Plus,
} from '@lucide/vue';
import { useAuth } from '../../../composables/useAuth';
import { useLeaseStore } from '../../../stores/lease.store';
import type { LeaseItem, TableColumn } from '~~/shared/types';
import AppTableCard from '../../../components/common/AppTableCard.vue';
import AppDataTable from '../../../components/common/AppDataTable.vue';
import CreateLeaseModal from '../../../components/leases/CreateLeaseModal.vue';
import SignLeaseModal from '../../../components/leases/SignLeaseModal.vue';
import ViewLeaseModal from '../../../components/leases/ViewLeaseModal.vue';
import TerminateLeaseModal from '../../../components/leases/TerminateLeaseModal.vue';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  title: 'Lease Agreements',
});

const { t } = useI18n();
const { user, isLandlord, isTenant, isAdmin } = useAuth();
const leaseStore = useLeaseStore();

const {
  leases,
  isLoading,
  isCreatingLease,
  isSigning,
  isTerminating,
  errorMessage,
  totalLeases,
  activeLeases,
  pendingLeases,
  terminatedLeases,
} = leaseStore;

const { fetchLeases, loadLeases, createLease, signLease, terminateLease } = leaseStore;

const successMessage = ref<string | null>(null);
const searchQuery = ref('');

// Modal states
const leaseToSign = ref<LeaseItem | null>(null);
const viewLeaseModal = ref<LeaseItem | null>(null);
const leaseToTerminate = ref<LeaseItem | null>(null);
const isCreateLeaseOpen = ref(false);

const toast = useToast();

async function handleCreateLease(formData: any) {
  try {
    const res = (await createLease(formData)) as any;
    if (res.success) {
      toast.success(res.message || 'Lease agreement created successfully.');
      isCreateLeaseOpen.value = false;
    } else {
      toast.error(res.error || 'Failed to create lease agreement.');
    }
  } catch (err: any) {
    toast.error(err?.message || 'Failed to create lease agreement.');
  }
}

const activeTab = ref<'ALL' | 'ACTIVE' | 'PENDING' | 'TERMINATED'>('ALL');

const filteredLeases = computed(() => {
  return leases.value.filter((l) => {
    if (activeTab.value !== 'ALL' && l.status !== activeTab.value) {
      return false;
    }
    if (!searchQuery.value.trim()) return true;
    const q = searchQuery.value.toLowerCase();
    const unit = l.unit?.unitNumber?.toLowerCase() || '';
    const prop = l.property?.title?.toLowerCase() || '';
    const tenant = l.tenant?.fullName?.toLowerCase() || '';
    return unit.includes(q) || prop.includes(q) || tenant.includes(q);
  });
});

// Pagination state
const currentPage = ref(1);
const pageSize = ref(5);

const paginatedLeases = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredLeases.value.slice(start, start + pageSize.value);
});

const columns = computed<TableColumn[]>(() => [
  { key: 'unit', label: t('leases.col_unit_property') },
  { key: 'parties', label: t('leases.col_tenant') },
  { key: 'period', label: t('leases.col_period') },
  { key: 'rent', label: t('leases.col_rent') },
  { key: 'signatures', label: t('leases.col_signatures') },
  { key: 'status', label: t('leases.col_status') },
  { key: 'actions', label: t('leases.col_actions'), align: 'right' },
]);

watch([activeTab, searchQuery], () => {
  currentPage.value = 1;
});

function openSignModal(lease: LeaseItem) {
  leaseToSign.value = lease;
}

async function handleSignLease(leaseId: string) {
  try {
    const res = (await signLease(leaseId)) as any;
    if (res.success) {
      toast.success(res.message || 'Lease agreement signed successfully.');
      leaseToSign.value = null;
    } else {
      toast.error(res.error || 'Failed to sign lease agreement.');
    }
  } catch (err: any) {
    toast.error(err?.message || 'Failed to sign lease agreement.');
  }
}

async function handleTerminateLease(leaseId: string) {
  try {
    const res = (await terminateLease(leaseId)) as any;
    if (res.success) {
      toast.success(res.message || 'Lease terminated successfully.');
      leaseToTerminate.value = null;
    } else {
      toast.error(res.error || 'Failed to terminate lease.');
    }
  } catch (err: any) {
    toast.error(err?.message || 'Failed to terminate lease.');
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
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {{ t('leases.title') }}
        </h1>
        <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {{ t('leases.subtitle') }}
        </p>
      </div>
      <button
        v-if="isLandlord || isAdmin"
        @click="openCreateLeaseModal"
        class="shadow-xs inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
      >
        <Plus :size="16" />
        <span>{{ t('leases.new_lease') }}</span>
      </button>
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

    <!-- Leases Table using shared AppTableCard -->
    <AppTableCard
      v-model:search="searchQuery"
      :search-placeholder="t('leases.title')"
      :is-loading="isLoading"
      :is-empty="filteredLeases.length === 0"
      :empty-title="t('leases.no_leases')"
      :empty-description="t('leases.no_leases_desc')"
      :empty-icon="FileText"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total-items="filteredLeases.length"
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
            <span>{{ t('leases.filter_all') }}</span>
            <span
              :class="[
                'rounded-full px-1.5 py-0.5 text-[10px]',
                activeTab === 'ALL'
                  ? 'bg-primary-700 text-white'
                  : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300',
              ]"
              >{{ totalLeases }}</span
            >
          </button>
          <button
            type="button"
            @click="activeTab = 'ACTIVE'"
            :class="[
              'inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
              activeTab === 'ACTIVE'
                ? 'shadow-xs border-primary-600 bg-primary-600 font-semibold text-white'
                : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700',
            ]"
          >
            <span>{{ t('leases.filter_active') }}</span>
            <span
              :class="[
                'rounded-full px-1.5 py-0.5 text-[10px]',
                activeTab === 'ACTIVE'
                  ? 'bg-primary-700 text-white'
                  : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300',
              ]"
              >{{ activeLeases }}</span
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
            <span>{{ t('leases.filter_pending') }}</span>
            <span
              :class="[
                'rounded-full px-1.5 py-0.5 text-[10px]',
                activeTab === 'PENDING'
                  ? 'bg-primary-700 text-white'
                  : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300',
              ]"
              >{{ pendingLeases }}</span
            >
          </button>
          <button
            type="button"
            @click="activeTab = 'TERMINATED'"
            :class="[
              'inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
              activeTab === 'TERMINATED'
                ? 'shadow-xs border-primary-600 bg-primary-600 font-semibold text-white'
                : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700',
            ]"
          >
            <span>{{ t('leases.filter_terminated') }}</span>
            <span
              :class="[
                'rounded-full px-1.5 py-0.5 text-[10px]',
                activeTab === 'TERMINATED'
                  ? 'bg-primary-700 text-white'
                  : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300',
              ]"
              >{{ terminatedLeases }}</span
            >
          </button>
        </div>
      </template>

      <AppDataTable
        :columns="columns"
        :items="paginatedLeases"
        :is-loading="isLoading"
        min-width="min-w-[750px]"
      >
        <template #cell-unit="slotProps">
          <div class="flex flex-col">
            <span class="font-semibold text-neutral-900 dark:text-white"
              >{{ t('dashboard.metrics.unit') }}
              {{ slotProps?.item?.unit?.unitNumber || '101A' }}</span
            >
            <span class="text-xs text-neutral-500 dark:text-neutral-400">{{
              slotProps?.item?.property?.title || 'Skyline Heights'
            }}</span>
          </div>
        </template>

        <template #cell-parties="slotProps">
          <div class="flex flex-col text-xs">
            <span class="text-neutral-900 dark:text-white"
              ><strong>{{ t('users.roles.tenant') }}:</strong>
              {{ slotProps?.item?.tenant?.fullName || 'Sarah Jenkins' }}</span
            >
            <span class="text-neutral-500 dark:text-neutral-400"
              ><strong>{{ t('users.roles.landlord') }}:</strong>
              {{ slotProps?.item?.landlord?.fullName || 'Marcus Sterling' }}</span
            >
          </div>
        </template>

        <template #cell-period="slotProps">
          <div class="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300">
            <Calendar :size="14" class="shrink-0 text-neutral-400" />
            <span>
              {{
                slotProps?.item?.startDate
                  ? new Date(slotProps.item.startDate).toLocaleDateString()
                  : '—'
              }}
              –
              {{
                slotProps?.item?.endDate
                  ? new Date(slotProps.item.endDate).toLocaleDateString()
                  : '—'
              }}
            </span>
          </div>
        </template>

        <template #cell-rent="slotProps">
          <div class="font-semibold text-neutral-900 dark:text-white">
            ${{ slotProps?.item?.rentAmount ? slotProps.item.rentAmount.toLocaleString() : '0' }}
            <span class="text-xs font-normal text-neutral-500">{{
              t('properties.rent_per_month')
            }}</span>
          </div>
        </template>

        <template #cell-signatures="slotProps">
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-1.5 text-xs">
              <span class="w-12 text-[11px] text-neutral-500 dark:text-neutral-400"
                >{{ t('users.roles.tenant') }}:</span
              >
              <span
                v-if="slotProps?.item?.tenantSignedAt"
                class="inline-flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
              >
                <CheckCircle2 :size="11" />
                <span>{{ t('leases.status.active') }}</span>
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1 rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
              >
                <Clock :size="11" />
                <span>{{ t('leases.status.pending') }}</span>
              </span>
            </div>
            <div class="flex items-center gap-1.5 text-xs">
              <span class="w-12 text-[11px] text-neutral-500 dark:text-neutral-400"
                >{{ t('users.roles.landlord') }}:</span
              >
              <span
                v-if="slotProps?.item?.landlordSignedAt"
                class="inline-flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
              >
                <CheckCircle2 :size="11" />
                <span>{{ t('leases.status.active') }}</span>
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1 rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
              >
                <Clock :size="11" />
                <span>{{ t('leases.status.pending') }}</span>
              </span>
            </div>
          </div>
        </template>

        <template #cell-status="slotProps">
          <span
            :class="[
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
              slotProps?.item?.status === 'ACTIVE'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                : slotProps?.item?.status === 'PENDING_SIGNATURES'
                  ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                  : slotProps?.item?.status === 'TERMINATED'
                    ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-400'
                    : 'border-neutral-200 bg-neutral-100 text-neutral-700',
            ]"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
            <span>{{
              slotProps?.item?.status === 'ACTIVE'
                ? t('leases.status.active')
                : slotProps?.item?.status === 'PENDING_SIGNATURES'
                  ? t('leases.status.pending')
                  : slotProps?.item?.status === 'TERMINATED'
                    ? t('leases.status.terminated')
                    : slotProps?.item?.status || '—'
            }}</span>
          </span>
        </template>

        <template #cell-actions="slotProps">
          <div class="inline-flex items-center justify-end gap-1.5">
            <button
              v-if="slotProps?.item && userNeedsToSign(slotProps.item)"
              @click="slotProps?.item && openSignModal(slotProps.item)"
              class="shadow-xs inline-flex items-center gap-1 rounded-lg bg-primary-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-primary-700"
            >
              <FileSignature :size="13" />
              <span>{{ t('leases.sign_agreement') }}</span>
            </button>
            <button
              v-if="slotProps?.item"
              @click="viewLeaseModal = slotProps.item"
              class="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-2.5 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
              :title="t('leases.view_terms')"
            >
              <FileText :size="13" />
              <span>{{ t('leases.view_terms') }}</span>
            </button>
            <button
              v-if="
                slotProps?.item && (isLandlord || isAdmin) && slotProps.item.status === 'ACTIVE'
              "
              @click="leaseToTerminate = slotProps.item"
              class="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/30"
              :title="t('leases.terminate')"
            >
              <Slash :size="13" />
              <span>{{ t('leases.terminate') }}</span>
            </button>
          </div>
        </template>
      </AppDataTable>
    </AppTableCard>

    <!-- Modals -->
    <CreateLeaseModal
      :is-open="isCreateLeaseOpen"
      :is-creating="isCreatingLease"
      @close="isCreateLeaseOpen = false"
      @submit="handleCreateLease"
    />

    <SignLeaseModal
      :lease="leaseToSign"
      :is-signing="isSigning"
      @close="leaseToSign = null"
      @sign="handleSignLease"
    />

    <ViewLeaseModal :lease="viewLeaseModal" @close="viewLeaseModal = null" />

    <TerminateLeaseModal
      :lease="leaseToTerminate"
      :is-terminating="isTerminating"
      @close="leaseToTerminate = null"
      @confirm="handleTerminateLease"
    />
  </div>
</template>
