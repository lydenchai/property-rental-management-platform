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
  MessageSquare,
  X,
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

const { fetchApplications, loadApplications, reviewApplication } = applicationStore;

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
  reviewReason.value =
    decision === 'APPROVED'
      ? 'Application meets credit and income criteria. Lease agreement drafted.'
      : 'Unable to approve application at this time based on qualification criteria.';
}

async function submitReview() {
  if (!appToReview.value) return;
  const res = (await reviewApplication(appToReview.value.id, {
    status: reviewDecision.value,
    reason: reviewReason.value,
  })) as any;

  if (res.success) {
    successMessage.value =
      res.message || `Application ${reviewDecision.value.toLowerCase()} successfully.`;
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
              >{{ applications.length }}</span
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
              >{{ applications.filter((a) => a.status === 'PENDING').length }}</span
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
              >{{ applications.filter((a) => a.status === 'APPROVED').length }}</span
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
              >{{ applications.filter((a) => a.status === 'REJECTED').length }}</span
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
              <th class="px-4 py-3">{{ t('applications.col_property') }}</th>
              <th v-if="!isTenant" class="px-4 py-3">{{ t('applications.col_applicant') }}</th>
              <th class="px-4 py-3">{{ t('applications.col_move_in') }}</th>
              <th class="px-4 py-3">{{ t('leases.col_rent') }}</th>
              <th class="px-4 py-3">{{ t('applications.col_status') }}</th>
              <th class="px-4 py-3">{{ t('applications.col_submitted') }}</th>
              <th class="px-4 py-3 text-right">{{ t('applications.col_actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
            <tr
              v-for="app in paginatedApplications"
              :key="app.id"
              class="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
            >
              <td class="px-4 py-3.5">
                <div class="flex flex-col">
                  <span class="font-semibold text-neutral-900 dark:text-white"
                    >{{ t('dashboard.metrics.unit') }} {{ app.unit?.unitNumber || 'N/A' }}</span
                  >
                  <span class="text-xs text-neutral-500 dark:text-neutral-400">{{
                    app.property?.title || 'Skyline Complex'
                  }}</span>
                </div>
              </td>
              <td v-if="!isTenant" class="px-4 py-3.5">
                <div class="flex flex-col">
                  <span class="font-medium text-neutral-900 dark:text-white">{{
                    app.tenant?.fullName || 'Prospective Tenant'
                  }}</span>
                  <span class="text-xs text-neutral-500 dark:text-neutral-400">{{
                    app.tenant?.email
                  }}</span>
                </div>
              </td>
              <td class="px-4 py-3.5">
                <div
                  class="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300"
                >
                  <Calendar :size="14" class="shrink-0 text-neutral-400" />
                  <span>{{ new Date(app.desiredMoveInDate).toLocaleDateString() }}</span>
                </div>
              </td>
              <td class="px-4 py-3.5 font-semibold text-neutral-900 dark:text-white">
                ${{ app.proposedRent.toLocaleString() }}
                <span class="text-xs font-normal text-neutral-500">{{
                  t('properties.rent_per_month')
                }}</span>
              </td>
              <td class="px-4 py-3.5">
                <span
                  :class="[
                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                    app.status === 'APPROVED'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                      : app.status === 'PENDING'
                        ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                        : app.status === 'REJECTED'
                          ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-400'
                          : 'border-neutral-200 bg-neutral-100 text-neutral-700',
                  ]"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
                  <span>{{
                    app.status === 'PENDING'
                      ? t('applications.status.pending')
                      : app.status === 'APPROVED'
                        ? t('applications.status.approved')
                        : app.status === 'REJECTED'
                          ? t('applications.status.rejected')
                          : app.status
                  }}</span>
                </span>
              </td>
              <td class="px-4 py-3.5 text-xs text-neutral-500 dark:text-neutral-400">
                {{ new Date(app.createdAt).toLocaleDateString() }}
              </td>
              <td class="px-4 py-3.5 text-right">
                <!-- Tenant Actions -->
                <div v-if="isTenant">
                  <span
                    v-if="app.status === 'APPROVED'"
                    class="text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                  >
                    {{ t('applications.status.approved') }}
                  </span>
                  <span
                    v-else-if="app.status === 'PENDING'"
                    class="text-xs text-amber-600 dark:text-amber-400"
                  >
                    {{ t('applications.status.pending') }}
                  </span>
                  <span v-else class="text-xs text-neutral-500 dark:text-neutral-400">
                    {{ t('applications.status.rejected') }}
                  </span>
                </div>

                <!-- Landlord / Admin Review Actions -->
                <div v-else class="inline-flex items-center justify-end gap-1.5">
                  <template v-if="app.status === 'PENDING'">
                    <button
                      @click="openReviewModal(app, 'APPROVED')"
                      class="shadow-xs inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-emerald-700"
                      :title="t('applications.approve')"
                    >
                      <CheckCircle2 :size="13" />
                      <span>{{ t('applications.approve') }}</span>
                    </button>
                    <button
                      @click="openReviewModal(app, 'REJECTED')"
                      class="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/30"
                      :title="t('applications.reject')"
                    >
                      <XCircle :size="13" />
                      <span>{{ t('applications.reject') }}</span>
                    </button>
                  </template>
                  <span
                    v-else-if="app.status === 'APPROVED'"
                    class="text-xs font-medium text-emerald-600 dark:text-emerald-400"
                  >
                    Lease Drafted
                  </span>
                  <span v-else class="text-xs text-neutral-400 dark:text-neutral-500">
                    Rejected
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </AppTableCard>

    <!-- Review Decision Modal -->
    <Teleport to="body">
      <div
        v-if="appToReview"
        class="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      >
        <div
          class="w-full max-w-lg overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800"
          >
            <h3 class="text-base font-semibold text-neutral-900 dark:text-white">
              {{
                reviewDecision === 'APPROVED'
                  ? t('applications.approve_modal_title')
                  : t('applications.reject_modal_title')
              }}
            </h3>
            <button
              type="button"
              @click="appToReview = null"
              class="cursor-pointer text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X :size="18" />
            </button>
          </div>

          <form @submit.prevent="submitReview" class="space-y-4 p-6">
            <div
              class="space-y-1.5 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-300"
            >
              <div>
                <strong class="text-neutral-900 dark:text-white"
                  >{{ t('applications.applicant_label') }}:</strong
                >
                {{ appToReview.tenant?.fullName || 'Tenant' }} ({{ appToReview.tenant?.email }})
              </div>
              <div>
                <strong class="text-neutral-900 dark:text-white"
                  >{{ t('applications.unit_label') }}:</strong
                >
                Unit {{ appToReview.unit?.unitNumber }} ({{ appToReview.property?.title }})
              </div>
              <div>
                <strong class="text-neutral-900 dark:text-white"
                  >{{ t('applications.desired_move_in_label') }}:</strong
                >
                {{ new Date(appToReview.desiredMoveInDate).toLocaleDateString() }}
              </div>
              <div>
                <strong class="text-neutral-900 dark:text-white"
                  >{{ t('applications.proposed_rent_label') }}:</strong
                >
                ${{ appToReview.proposedRent }}/month
              </div>
              <div class="mt-2 border-t border-neutral-200 pt-2 dark:border-neutral-700">
                <span
                  class="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                  >{{ t('applications.credentials_label') }}:</span
                >
                <p class="text-neutral-800 dark:text-neutral-200">
                  {{ appToReview.employmentDetails }}
                </p>
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                {{ t('applications.review_notes_label') }}
              </label>
              <textarea
                v-model="reviewReason"
                rows="3"
                required
                class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                :placeholder="t('applications.review_notes_placeholder')"
              ></textarea>
            </div>

            <p
              v-if="reviewDecision === 'APPROVED'"
              class="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400"
            >
              {{
                t('applications.approval_auto_note', { unit: appToReview.unit?.unitNumber || '' })
              }}
            </p>

            <div class="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                @click="appToReview = null"
                class="cursor-pointer rounded-lg border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                type="submit"
                :disabled="isSubmittingReview"
                :class="[
                  'shadow-xs cursor-pointer rounded-lg px-4 py-2 text-xs font-medium text-white transition-colors disabled:opacity-50',
                  reviewDecision === 'REJECTED'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-primary-600 hover:bg-primary-700',
                ]"
              >
                <span>{{
                  isSubmittingReview
                    ? t('applications.processing_btn')
                    : reviewDecision === 'APPROVED'
                      ? t('applications.confirm_approval_btn')
                      : t('applications.confirm_rejection_btn')
                }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
