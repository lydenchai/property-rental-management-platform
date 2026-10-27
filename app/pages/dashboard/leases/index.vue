<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
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
  Plus,
} from '@lucide/vue';
import { useAuth } from '../../../composables/useAuth';
import { useLeaseStore } from '../../../stores/lease.store';
import type { LeaseItem } from '~~/shared/types';
import AppTableCard from '../../../components/common/AppTableCard.vue';

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

// Signing modal state
const leaseToSign = ref<LeaseItem | null>(null);
const agreeToTerms = ref(false);

// View terms modal state
const viewLeaseModal = ref<LeaseItem | null>(null);

// Terminate modal state
const leaseToTerminate = ref<LeaseItem | null>(null);

// Create lease modal state
const isCreateLeaseOpen = ref(false);
const availableUnits = ref<
  Array<{
    id: string;
    unitNumber: string;
    rentAmount: number;
    depositAmount: number;
    propertyId: string;
    propertyTitle: string;
    city: string;
  }>
>([]);
const availableTenants = ref<
  Array<{
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
  }>
>([]);
const isManualTenant = ref(false);
const isLoadingOptions = ref(false);

const createLeaseForm = ref({
  unitId: '',
  tenantId: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  rentAmount: 1200,
  depositAmount: 1200,
  paymentDueDay: 1,
  termsAndConditions: `Standard 12-Month Residential Lease Agreement.
1. Rent is due on the 1st of each calendar month.
2. Tenant agrees to observe all quiet hours and community guidelines.
3. Security deposit is refundable within 30 days after lease termination.`,
}) as any;

const toast = useToast();

async function loadLeaseOptions() {
  isLoadingOptions.value = true;
  try {
    const { data } = await useFetch<any>('/api/v1/leases/options');
    if (data.value?.data) {
      availableUnits.value = data.value.data.units || [];
      availableTenants.value = data.value.data.tenants || [];
      if (availableUnits.value.length > 0 && !createLeaseForm.value.unitId) {
        onUnitSelect(availableUnits.value[0].id);
      }
      if (availableTenants.value.length > 0 && !createLeaseForm.value.tenantId) {
        createLeaseForm.value.tenantId = availableTenants.value[0].id;
      }
    }
  } catch {
    // Fall back gracefully to manual input
  } finally {
    isLoadingOptions.value = false;
  }
}

function onUnitSelect(unitId: string) {
  createLeaseForm.value.unitId = unitId;
  const unit = availableUnits.value.find((u) => u.id === unitId);
  if (unit) {
    createLeaseForm.value.rentAmount = unit.rentAmount;
    createLeaseForm.value.depositAmount = unit.depositAmount || unit.rentAmount;
  }
}

function openCreateLeaseModal() {
  isCreateLeaseOpen.value = true;
  loadLeaseOptions();
}

async function executeCreateLease() {
  if (!createLeaseForm.value.unitId || !createLeaseForm.value.tenantId) {
    toast.error('Please select an available unit and tenant.');
    return;
  }
  try {
    const res = (await createLease(createLeaseForm.value!)) as any;

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

watch([activeTab, searchQuery], () => {
  currentPage.value = 1;
});

function openSignModal(lease: LeaseItem) {
  leaseToSign.value = lease;
  agreeToTerms.value = false;
}

async function executeSign() {
  if (!leaseToSign.value || !agreeToTerms.value) return;
  try {
    const res = (await signLease(leaseToSign.value.id)) as any;

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

async function executeTerminate() {
  if (!leaseToTerminate.value) return;
  try {
    const res = (await terminateLease(leaseToTerminate.value.id)) as any;
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

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-neutral-700 dark:text-neutral-200">
          <thead
            class="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-400"
          >
            <tr>
              <th class="px-4 py-3">{{ t('leases.col_unit_property') }}</th>
              <th class="px-4 py-3">{{ t('leases.col_tenant') }}</th>
              <th class="px-4 py-3">{{ t('leases.col_period') }}</th>
              <th class="px-4 py-3">{{ t('leases.col_rent') }}</th>
              <th class="px-4 py-3">{{ t('leases.col_signatures') }}</th>
              <th class="px-4 py-3">{{ t('leases.col_status') }}</th>
              <th class="px-4 py-3 text-right">{{ t('leases.col_actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
            <tr
              v-for="lease in paginatedLeases"
              :key="lease.id"
              class="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
            >
              <td class="px-4 py-3.5">
                <div class="flex flex-col">
                  <span class="font-semibold text-neutral-900 dark:text-white"
                    >{{ t('dashboard.metrics.unit') }} {{ lease.unit?.unitNumber || '101A' }}</span
                  >
                  <span class="text-xs text-neutral-500 dark:text-neutral-400">{{
                    lease.property?.title || 'Skyline Heights'
                  }}</span>
                </div>
              </td>
              <td class="px-4 py-3.5">
                <div class="flex flex-col text-xs">
                  <span class="text-neutral-900 dark:text-white"
                    ><strong>{{ t('users.roles.tenant') }}:</strong>
                    {{ lease.tenant?.fullName || 'Sarah Jenkins' }}</span
                  >
                  <span class="text-neutral-500 dark:text-neutral-400"
                    ><strong>{{ t('users.roles.landlord') }}:</strong>
                    {{ lease.landlord?.fullName || 'Marcus Sterling' }}</span
                  >
                </div>
              </td>
              <td class="px-4 py-3.5">
                <div
                  class="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300"
                >
                  <Calendar :size="14" class="shrink-0 text-neutral-400" />
                  <span>
                    {{ new Date(lease.startDate).toLocaleDateString() }} –
                    {{ new Date(lease.endDate).toLocaleDateString() }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3.5 font-semibold text-neutral-900 dark:text-white">
                ${{ lease.rentAmount.toLocaleString() }}
                <span class="text-xs font-normal text-neutral-500">{{
                  t('properties.rent_per_month')
                }}</span>
              </td>
              <td class="px-4 py-3.5">
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-1.5 text-xs">
                    <span class="w-12 text-[11px] text-neutral-500 dark:text-neutral-400"
                      >{{ t('users.roles.tenant') }}:</span
                    >
                    <span
                      v-if="lease.tenantSignedAt"
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
                      v-if="lease.landlordSignedAt"
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
              </td>
              <td class="px-4 py-3.5">
                <span
                  :class="[
                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                    lease.status === 'ACTIVE'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                      : lease.status === 'PENDING_SIGNATURES'
                        ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                        : lease.status === 'TERMINATED'
                          ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-400'
                          : 'border-neutral-200 bg-neutral-100 text-neutral-700',
                  ]"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
                  <span>{{
                    lease.status === 'ACTIVE'
                      ? t('leases.status.active')
                      : lease.status === 'PENDING_SIGNATURES'
                        ? t('leases.status.pending')
                        : lease.status === 'TERMINATED'
                          ? t('leases.status.terminated')
                          : lease.status
                  }}</span>
                </span>
              </td>
              <td class="px-4 py-3.5 text-right">
                <div class="inline-flex items-center justify-end gap-1.5">
                  <button
                    v-if="userNeedsToSign(lease)"
                    @click="openSignModal(lease)"
                    class="shadow-xs inline-flex items-center gap-1 rounded-lg bg-primary-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-primary-700"
                  >
                    <FileSignature :size="13" />
                    <span>{{ t('leases.sign_agreement') }}</span>
                  </button>
                  <button
                    @click="viewLeaseModal = lease"
                    class="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-2.5 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                    :title="t('leases.view_terms')"
                  >
                    <FileText :size="13" />
                    <span>{{ t('leases.view_terms') }}</span>
                  </button>
                  <button
                    v-if="(isLandlord || isAdmin) && lease.status === 'ACTIVE'"
                    @click="leaseToTerminate = lease"
                    class="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/30"
                    :title="t('leases.terminate')"
                  >
                    <Slash :size="13" />
                    <span>{{ t('leases.terminate') }}</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </AppTableCard>

    <!-- Sign Lease Modal -->
    <Teleport to="body">
      <div
        v-if="leaseToSign"
        class="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      >
        <div
          class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800"
          >
            <h3 class="text-base font-semibold text-neutral-900 dark:text-white">
              {{ t('leases.sign_modal_title') }}
            </h3>
            <button
              type="button"
              @click="leaseToSign = null"
              class="cursor-pointer text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X :size="18" />
            </button>
          </div>

          <form @submit.prevent="executeSign" class="space-y-4 p-6">
            <div
              class="space-y-1.5 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-300"
            >
              <div>
                <strong class="text-neutral-900 dark:text-white"
                  >{{ t('leases.unit_label') }}:</strong
                >
                Unit {{ leaseToSign.unit?.unitNumber }} ({{ leaseToSign.property?.title }})
              </div>
              <div>
                <strong class="text-neutral-900 dark:text-white"
                  >{{ t('leases.monthly_rent') }}:</strong
                >
                ${{ leaseToSign.rentAmount.toLocaleString() }} / month
              </div>
              <div>
                <strong class="text-neutral-900 dark:text-white">{{ t('leases.deposit') }}:</strong>
                ${{ leaseToSign.depositAmount.toLocaleString() }}
              </div>
              <div>
                <strong class="text-neutral-900 dark:text-white"
                  >{{ t('leases.term_label') }}:</strong
                >
                {{ new Date(leaseToSign.startDate).toLocaleDateString() }} to
                {{ new Date(leaseToSign.endDate).toLocaleDateString() }}
              </div>
            </div>

            <div
              class="space-y-1.5 rounded-lg border border-neutral-200 bg-neutral-100 p-4 dark:border-neutral-700 dark:bg-neutral-800"
            >
              <span
                class="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                >{{ t('leases.terms_modal_title') }}:</span
              >
              <pre
                class="max-h-48 overflow-y-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-neutral-700 dark:text-neutral-300"
              >
            {{ leaseToSign.termsAndConditions }}</pre>
            </div>

            <label
              class="flex cursor-pointer items-start gap-3 text-xs text-neutral-700 dark:text-neutral-300"
            >
              <input
                type="checkbox"
                v-model="agreeToTerms"
                required
                class="mt-0.5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <span>{{ t('leases.agree_checkbox') }}</span>
            </label>

            <div class="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                @click="leaseToSign = null"
                class="cursor-pointer rounded-lg border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                type="submit"
                :disabled="!agreeToTerms || isSigning"
                class="shadow-xs inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
              >
                <FileSignature :size="14" />
                <span>{{
                  isSigning ? t('leases.recording_signature') : t('leases.confirm_signature')
                }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- View Terms Modal -->
    <Teleport to="body">
      <div
        v-if="viewLeaseModal"
        class="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      >
        <div
          class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800"
          >
            <h3 class="text-base font-semibold text-neutral-900 dark:text-white">
              {{ t('leases.contract_details_title') }}
            </h3>
            <button
              type="button"
              @click="viewLeaseModal = null"
              class="cursor-pointer text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X :size="18" />
            </button>
          </div>
          <div class="space-y-4 p-6">
            <div
              class="space-y-1.5 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-300"
            >
              <div>
                <strong class="text-neutral-900 dark:text-white"
                  >{{ t('leases.unit_label') }}:</strong
                >
                Unit {{ viewLeaseModal.unit?.unitNumber }}
              </div>
              <div>
                <strong class="text-neutral-900 dark:text-white"
                  >{{ t('leases.col_tenant') }}:</strong
                >
                {{ viewLeaseModal.tenant?.fullName }}
              </div>
              <div>
                <strong class="text-neutral-900 dark:text-white"
                  >{{ t('properties.col_property') }}:</strong
                >
                {{ viewLeaseModal.property?.title || viewLeaseModal.landlord?.fullName }}
              </div>
              <div>
                <strong class="text-neutral-900 dark:text-white"
                  >{{ t('leases.monthly_rent') }}:</strong
                >
                ${{ viewLeaseModal.rentAmount }} / month ({{ t('leases.payment_due_day_label') }}:
                {{ viewLeaseModal.paymentDueDay }})
              </div>
              <div class="flex items-center gap-2 pt-1">
                <strong class="text-neutral-900 dark:text-white"
                  >{{ t('leases.col_status') }}:</strong
                >
                <span
                  :class="[
                    'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium',
                    viewLeaseModal.status === 'ACTIVE'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                      : viewLeaseModal.status === 'PENDING_SIGNATURES'
                        ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                        : 'border-neutral-200 bg-neutral-100 text-neutral-700',
                  ]"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
                  <span>{{
                    viewLeaseModal.status === 'ACTIVE'
                      ? t('leases.status.active')
                      : viewLeaseModal.status === 'PENDING_SIGNATURES'
                        ? t('leases.status.pending')
                        : t('leases.status.terminated')
                  }}</span>
                </span>
              </div>
            </div>

            <div
              class="space-y-1.5 rounded-lg border border-neutral-200 bg-neutral-100 p-4 dark:border-neutral-700 dark:bg-neutral-800"
            >
              <span
                class="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                >{{ t('leases.terms_modal_title') }}:</span
              >
              <pre
                class="max-h-56 overflow-y-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-neutral-700 dark:text-neutral-300"
              >
            {{ viewLeaseModal.termsAndConditions }}</pre>
            </div>

            <div class="flex justify-end pt-2">
              <button
                type="button"
                @click="viewLeaseModal = null"
                class="cursor-pointer rounded-lg border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
              >
                {{ t('leases.close_btn') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Terminate Modal -->
    <Teleport to="body">
      <div
        v-if="leaseToTerminate"
        class="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      >
        <div
          class="w-full max-w-md overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800"
          >
            <h3 class="text-base font-semibold text-neutral-900 dark:text-white">
              {{ t('leases.terminate_modal_title') }}
            </h3>
            <button
              type="button"
              @click="leaseToTerminate = null"
              class="cursor-pointer text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X :size="18" />
            </button>
          </div>
          <div class="space-y-4 p-6 text-sm text-neutral-700 dark:text-neutral-300">
            <p>
              {{
                t('leases.terminate_confirm_question', {
                  unit: leaseToTerminate.unit?.unitNumber || '',
                })
              }}
            </p>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              {{ t('leases.terminate_status_note') }}
            </p>
            <div class="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                @click="leaseToTerminate = null"
                class="cursor-pointer rounded-lg border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                type="button"
                @click="executeTerminate"
                :disabled="isTerminating"
                class="shadow-xs cursor-pointer rounded-lg bg-rose-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
              >
                <span>{{
                  isTerminating ? t('leases.terminating_btn') : t('leases.confirm_termination_btn')
                }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Create Lease Modal -->
    <Teleport to="body">
      <div
        v-if="isCreateLeaseOpen"
        class="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      >
        <div
          class="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800"
          >
            <h3 class="text-base font-semibold text-neutral-900 dark:text-white">
              {{ t('leases.new_lease') }}
            </h3>
            <button
              type="button"
              @click="isCreateLeaseOpen = false"
              class="cursor-pointer text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X :size="18" />
            </button>
          </div>

          <form @submit.prevent="executeCreateLease" class="space-y-4 p-6">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <!-- Unit Selection -->
              <div class="space-y-1.5">
                <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {{ t('leases.unit_select_label') }} *
                </label>
                <select
                  v-if="availableUnits.length > 0"
                  :value="createLeaseForm.unitId"
                  @change="onUnitSelect(($event.target as HTMLSelectElement).value)"
                  required
                  class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                >
                  <option value="" disabled>{{ t('leases.select_unit_placeholder') }}</option>
                  <option v-for="u in availableUnits" :key="u.id" :value="u.id">
                    {{ u.propertyTitle }} — Unit {{ u.unitNumber }} (${{ u.rentAmount }}/mo)
                  </option>
                </select>
                <input
                  v-else
                  v-model="createLeaseForm.unitId"
                  type="text"
                  required
                  class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  :placeholder="t('leases.select_unit_placeholder')"
                />
              </div>

              <!-- Tenant Selection -->
              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    {{ t('leases.tenant_select_label') }} *
                  </label>
                  <button
                    type="button"
                    v-if="availableTenants.length > 0"
                    @click="isManualTenant = !isManualTenant"
                    class="cursor-pointer text-[11px] text-primary-600 hover:underline dark:text-primary-400"
                  >
                    {{
                      isManualTenant
                        ? t('leases.select_tenant_placeholder')
                        : t('leases.manual_tenant_input')
                    }}
                  </button>
                </div>

                <select
                  v-if="availableTenants.length > 0 && !isManualTenant"
                  v-model="createLeaseForm.tenantId"
                  required
                  class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                >
                  <option value="" disabled>{{ t('leases.select_tenant_placeholder') }}</option>
                  <option v-for="tn in availableTenants" :key="tn.id" :value="tn.id">
                    {{ tn.fullName }} ({{ tn.email }})
                  </option>
                </select>
                <input
                  v-else
                  v-model="createLeaseForm.tenantId"
                  type="text"
                  required
                  class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  :placeholder="t('leases.select_tenant_placeholder')"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="space-y-1.5">
                <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {{ t('leases.start_date') }} *
                </label>
                <input
                  v-model="createLeaseForm.startDate"
                  type="date"
                  required
                  class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
              <div class="space-y-1.5">
                <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {{ t('leases.end_date') }} *
                </label>
                <input
                  v-model="createLeaseForm.endDate"
                  type="date"
                  required
                  class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div class="space-y-1.5">
                <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {{ t('leases.monthly_rent') }} ($) *
                </label>
                <input
                  v-model.number="createLeaseForm.rentAmount"
                  type="number"
                  min="0"
                  step="1"
                  required
                  class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
              <div class="space-y-1.5">
                <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {{ t('leases.deposit') }} ($) *
                </label>
                <input
                  v-model.number="createLeaseForm.depositAmount"
                  type="number"
                  min="0"
                  step="1"
                  required
                  class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
              <div class="space-y-1.5">
                <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {{ t('leases.due_day') }} *
                </label>
                <input
                  v-model.number="createLeaseForm.paymentDueDay"
                  type="number"
                  min="1"
                  max="28"
                  required
                  class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                {{ t('leases.terms_obligations') }} *
              </label>
              <textarea
                v-model="createLeaseForm.termsAndConditions"
                rows="4"
                required
                class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              ></textarea>
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                @click="isCreateLeaseOpen = false"
                class="cursor-pointer rounded-lg border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                type="submit"
                :disabled="isCreatingLease"
                class="shadow-xs inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
              >
                <Plus :size="14" />
                <span>{{
                  isCreatingLease
                    ? t('leases.generating_contract')
                    : t('leases.create_contract_btn')
                }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
