<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
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
  AlertCircle,
} from '@lucide/vue';
import { useAuth } from '../../../composables/useAuth';
import { useMaintenanceStore } from '../../../stores/maintenance.store';
import type {
  MaintenanceItem,
  CreateMaintenanceInput,
  AssignTechnicianInput,
  UpdateProgressInput,
  ConfirmResolutionInput,
  TableColumn,
} from '~~/shared/types';
import AppTableCard from '../../../components/common/AppTableCard.vue';
import AppDataTable from '../../../components/common/AppDataTable.vue';
import CreateMaintenanceModal, {
  type CreateMaintenanceFormData,
} from '../../../components/maintenance/CreateMaintenanceModal.vue';
import AssignTechnicianModal from '../../../components/maintenance/AssignTechnicianModal.vue';
import UpdateTicketModal from '../../../components/maintenance/UpdateTicketModal.vue';
import ConfirmResolutionModal from '../../../components/maintenance/ConfirmResolutionModal.vue';
import TicketDetailsModal from '../../../components/maintenance/TicketDetailsModal.vue';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  title: 'Maintenance Management',
});

const { t } = useI18n();
const { user, isLandlord, isTenant, isTechnician, isAdmin } = useAuth();

const maintenanceStore = useMaintenanceStore();
const {
  requests,
  isLoading,
  isSubmitting,
  isAssigning,
  isUpdating,
  isConfirming,
  errorMessage,
  totalCount,
  openCount,
  inProgressCount,
  awaitingConfirmCount,
  closedCount,
} = maintenanceStore;

const successMessage = ref<string | null>(null);

// Filters
const activeTab = ref<
  'ALL' | 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CONFIRMED_CLOSED'
>('ALL');
const searchQuery = ref('');

// Modals
const isCreateModalOpen = ref(false);
const ticketToAssign = ref<MaintenanceItem | null>(null);
const ticketToUpdate = ref<MaintenanceItem | null>(null);
const updateError = ref<string | null>(null);
const ticketToConfirm = ref<MaintenanceItem | null>(null);
const viewingTicket = ref<MaintenanceItem | null>(null);

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
    return (
      title.includes(q) ||
      desc.includes(q) ||
      unit.includes(q) ||
      prop.includes(q) ||
      tenant.includes(q) ||
      tech.includes(q)
    );
  });
});

// Pagination state
const currentPage = ref(1);
const pageSize = ref(5);

const paginatedRequests = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredRequests.value.slice(start, start + pageSize.value);
});

const columns = computed<TableColumn[]>(() => [
  {
    key: 'priority',
    label: t('maintenance.col_priority'),
    headerClass: 'whitespace-nowrap',
    class: 'whitespace-nowrap',
  },
  { key: 'ticket', label: t('maintenance.col_ticket') },
  { key: 'unit', label: t('maintenance.col_unit_property'), headerClass: 'whitespace-nowrap' },
  {
    key: 'requester',
    label: t('maintenance.col_requester'),
    headerClass: 'whitespace-nowrap',
    class: 'whitespace-nowrap',
  },
  {
    key: 'technician',
    label: t('maintenance.col_technician'),
    headerClass: 'whitespace-nowrap',
    class: 'whitespace-nowrap',
  },
  {
    key: 'status',
    label: t('maintenance.col_status'),
    headerClass: 'whitespace-nowrap',
    class: 'whitespace-nowrap',
  },
  {
    key: 'actions',
    label: t('maintenance.col_actions'),
    align: 'right',
    headerClass: 'whitespace-nowrap text-right',
    class: 'whitespace-nowrap text-right',
  },
]);

watch([activeTab, searchQuery], () => {
  currentPage.value = 1;
});

async function executeCreateTicket(formData: CreateMaintenanceFormData) {
  const res = (await maintenanceStore.createTicket(formData)) as any;
  if (res.success) {
    successMessage.value = res.message || 'Maintenance ticket created successfully';
    isCreateModalOpen.value = false;
    setTimeout(() => {
      successMessage.value = null;
    }, 4000);
  }
}

function openAssignModal(ticket: MaintenanceItem) {
  ticketToAssign.value = ticket;
}

async function executeAssign(payload: { technicianId: string; notes?: string }) {
  if (!ticketToAssign.value) return;
  const res = (await maintenanceStore.assignTechnician(ticketToAssign.value.id, payload)) as any;
  if (res.success) {
    successMessage.value = res.message || 'Technician assigned successfully';
    ticketToAssign.value = null;
    setTimeout(() => {
      successMessage.value = null;
    }, 4000);
  }
}

function openUpdateModal(ticket: MaintenanceItem) {
  ticketToUpdate.value = ticket;
  updateError.value = null;
}

async function executeUpdateProgress(payload: {
  status: 'IN_PROGRESS' | 'RESOLVED';
  resolutionNotes?: string;
}) {
  if (!ticketToUpdate.value) return;
  updateError.value = null;
  const res = (await maintenanceStore.updateProgress(ticketToUpdate.value.id, payload)) as any;
  if (res.success) {
    successMessage.value = res.message || 'Progress updated successfully';
    ticketToUpdate.value = null;
    setTimeout(() => {
      successMessage.value = null;
    }, 4000);
  } else {
    updateError.value = res.error || 'Failed to update progress';
  }
}

function openConfirmModal(ticket: MaintenanceItem) {
  ticketToConfirm.value = ticket;
}

async function executeConfirmResolution(ticketId: string) {
  const res = (await maintenanceStore.confirmResolution(ticketId, {
    confirmed: true,
    feedback: '',
  })) as any;
  if (res.success) {
    successMessage.value = res.message || 'Ticket closed and resolution confirmed';
    ticketToConfirm.value = null;
    setTimeout(() => {
      successMessage.value = null;
    }, 4000);
  }
}

onMounted(() => {
  maintenanceStore.fetchRequests();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Top Bar -->
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {{ t('maintenance.title') }}
        </h1>
        <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {{ t('maintenance.subtitle') }}
        </p>
      </div>
      <button
        v-if="isTenant || isAdmin"
        @click="isCreateModalOpen = true"
        class="shadow-xs inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
      >
        <Plus :size="16" />
        <span>{{ t('maintenance.new_request') }}</span>
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

    <!-- Workflow Stats Ribbon -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div
        class="shadow-xs flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:p-5"
      >
        <div class="flex items-center justify-between">
          <span
            class="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
            >{{ t('maintenance.open_tickets') }}</span
          >
          <div
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
          >
            <Clock :size="16" />
          </div>
        </div>
        <div class="mt-3">
          <div class="font-mono text-2xl font-bold text-neutral-900 dark:text-white">
            {{ openCount }}
          </div>
          <div class="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            {{ t('maintenance.filter_assigned') }}
          </div>
        </div>
      </div>

      <div
        class="shadow-xs flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:p-5"
      >
        <div class="flex items-center justify-between">
          <span
            class="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
            >{{ t('maintenance.in_progress') }}</span
          >
          <div
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
          >
            <Wrench :size="16" />
          </div>
        </div>
        <div class="mt-3">
          <div class="font-mono text-2xl font-bold text-neutral-900 dark:text-white">
            {{ inProgressCount }}
          </div>
          <div class="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            {{ t('dashboard.metrics.under_repair') }}
          </div>
        </div>
      </div>

      <div
        class="shadow-xs flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:p-5"
      >
        <div class="flex items-center justify-between">
          <span
            class="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
            >{{ t('maintenance.awaiting_confirmation') }}</span
          >
          <div
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400"
          >
            <AlertTriangle :size="16" />
          </div>
        </div>
        <div class="mt-3">
          <div
            :class="[
              'font-mono text-2xl font-bold',
              awaitingConfirmCount > 0
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-neutral-900 dark:text-white',
            ]"
          >
            {{ awaitingConfirmCount }}
          </div>
          <div class="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            {{ t('maintenance.filter_resolved') }}
          </div>
        </div>
      </div>

      <div
        class="shadow-xs flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:p-5"
      >
        <div class="flex items-center justify-between">
          <span
            class="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
            >{{ t('maintenance.closed_tickets') }}</span
          >
          <div
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
          >
            <CheckCheck :size="16" />
          </div>
        </div>
        <div class="mt-3">
          <div class="font-mono text-2xl font-bold text-neutral-900 dark:text-white">
            {{ closedCount }}
          </div>
          <div class="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            {{ t('dashboard.metrics.verified_resolution') }}
          </div>
        </div>
      </div>
    </div>

    <!-- Maintenance Tickets Table using shared AppTableCard -->
    <AppTableCard
      v-model:search="searchQuery"
      :search-placeholder="t('maintenance.search_placeholder')"
      :is-loading="isLoading"
      :is-empty="filteredRequests.length === 0"
      :empty-title="t('maintenance.no_requests')"
      :empty-description="t('maintenance.no_requests_desc')"
      :empty-icon="Wrench"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total-items="filteredRequests.length"
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
            <span>{{ t('maintenance.filter_all') }}</span>
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
            @click="activeTab = 'OPEN'"
            :class="[
              'inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
              activeTab === 'OPEN'
                ? 'shadow-xs border-primary-600 bg-primary-600 font-semibold text-white'
                : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700',
            ]"
          >
            <span>{{ t('maintenance.filter_open') }}</span>
            <span
              :class="[
                'rounded-full px-1.5 py-0.5 text-[10px]',
                activeTab === 'OPEN'
                  ? 'bg-primary-700 text-white'
                  : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300',
              ]"
              >{{ openCount }}</span
            >
          </button>
          <button
            type="button"
            @click="activeTab = 'ASSIGNED'"
            :class="[
              'inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
              activeTab === 'ASSIGNED'
                ? 'shadow-xs border-primary-600 bg-primary-600 font-semibold text-white'
                : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700',
            ]"
          >
            <span>{{ t('maintenance.filter_assigned') }}</span>
          </button>
          <button
            type="button"
            @click="activeTab = 'IN_PROGRESS'"
            :class="[
              'inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
              activeTab === 'IN_PROGRESS'
                ? 'shadow-xs border-primary-600 bg-primary-600 font-semibold text-white'
                : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700',
            ]"
          >
            <span>{{ t('maintenance.filter_in_progress') }}</span>
            <span
              :class="[
                'rounded-full px-1.5 py-0.5 text-[10px]',
                activeTab === 'IN_PROGRESS'
                  ? 'bg-primary-700 text-white'
                  : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300',
              ]"
              >{{ inProgressCount }}</span
            >
          </button>
          <button
            type="button"
            @click="activeTab = 'RESOLVED'"
            :class="[
              'inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
              activeTab === 'RESOLVED'
                ? 'shadow-xs border-primary-600 bg-primary-600 font-semibold text-white'
                : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700',
            ]"
          >
            <span>{{ t('maintenance.filter_resolved') }}</span>
            <span
              :class="[
                'rounded-full px-1.5 py-0.5 text-[10px]',
                activeTab === 'RESOLVED'
                  ? 'bg-primary-700 text-white'
                  : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300',
              ]"
              >{{ awaitingConfirmCount }}</span
            >
          </button>
          <button
            type="button"
            @click="activeTab = 'CONFIRMED_CLOSED'"
            :class="[
              'inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
              activeTab === 'CONFIRMED_CLOSED'
                ? 'shadow-xs border-primary-600 bg-primary-600 font-semibold text-white'
                : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700',
            ]"
          >
            <span>{{ t('maintenance.filter_closed') }}</span>
            <span
              :class="[
                'rounded-full px-1.5 py-0.5 text-[10px]',
                activeTab === 'CONFIRMED_CLOSED'
                  ? 'bg-primary-700 text-white'
                  : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300',
              ]"
              >{{ closedCount }}</span
            >
          </button>
        </div>
      </template>

      <AppDataTable
        :columns="columns"
        :items="paginatedRequests"
        :is-loading="isLoading"
        min-width="min-w-[1050px]"
      >
        <template #cell-priority="slotProps">
          <span
            :class="[
              'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium',
              slotProps?.item?.priority === 'EMERGENCY'
                ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-400'
                : slotProps?.item?.priority === 'HIGH'
                  ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                  : slotProps?.item?.priority === 'MEDIUM'
                    ? 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-400'
                    : 'border-neutral-200 bg-neutral-100 text-neutral-700',
            ]"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
            <span class="whitespace-nowrap">{{
              slotProps?.item?.priority === 'EMERGENCY'
                ? t('dashboard.metrics.emergency_priority')
                : slotProps?.item?.priority === 'HIGH'
                  ? t('maintenance.priority.high')
                  : slotProps?.item?.priority === 'MEDIUM'
                    ? t('maintenance.priority.medium')
                    : t('maintenance.priority.low')
            }}</span>
          </span>
        </template>

        <template #cell-ticket="slotProps">
          <div class="flex max-w-xs flex-col">
            <span class="truncate font-semibold text-neutral-900 dark:text-white">{{
              slotProps?.item?.title || '—'
            }}</span>
            <span class="line-clamp-1 text-xs text-neutral-500 dark:text-neutral-400">{{
              slotProps?.item?.description || ''
            }}</span>
            <span class="mt-0.5 text-[11px] text-neutral-400 dark:text-neutral-500"
              >{{ t('maintenance.col_reported') }}:
              {{
                slotProps?.item?.requestedAt
                  ? new Date(slotProps.item.requestedAt).toLocaleDateString()
                  : '—'
              }}</span
            >
          </div>
        </template>

        <template #cell-unit="slotProps">
          <div class="flex flex-col">
            <span class="font-semibold text-neutral-900 dark:text-white"
              >{{ t('dashboard.metrics.unit') }}
              {{ slotProps?.item?.unit?.unitNumber || '101A' }}</span
            >
            <span class="text-xs text-neutral-500 dark:text-neutral-400">{{
              slotProps?.item?.unit?.property?.title || 'Skyline Heights'
            }}</span>
          </div>
        </template>

        <template #cell-requester="slotProps">
          <div class="flex flex-col text-xs">
            <span class="font-medium text-neutral-900 dark:text-white">{{
              slotProps?.item?.tenant?.fullName || 'Sarah Jenkins'
            }}</span>
            <span class="text-neutral-500 dark:text-neutral-400">{{
              slotProps?.item?.tenant?.phone || 'tenant@example.com'
            }}</span>
          </div>
        </template>

        <template #cell-technician="slotProps">
          <div
            v-if="slotProps?.item?.assignments && slotProps.item.assignments.length > 0"
            class="flex flex-col text-xs"
          >
            <span class="font-medium text-neutral-900 dark:text-white">{{
              slotProps.item.assignments[0]!.technician?.fullName || 'Alex Rivers'
            }}</span>
            <span class="text-neutral-500 dark:text-neutral-400"
              >{{ t('maintenance.filter_assigned') }}
              {{ new Date(slotProps.item.assignments[0]!.assignedAt).toLocaleDateString() }}</span
            >
          </div>
          <div v-else class="text-xs italic text-neutral-400 dark:text-neutral-500">
            {{ t('common.not_available') }}
          </div>
        </template>

        <template #cell-status="slotProps">
          <span
            :class="[
              'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium',
              slotProps?.item?.status === 'RESOLVED'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                : slotProps?.item?.status === 'IN_PROGRESS'
                  ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                  : slotProps?.item?.status === 'OPEN'
                    ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400'
                    : slotProps?.item?.status === 'ASSIGNED'
                      ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-400'
                      : 'border-neutral-200 bg-neutral-100 text-neutral-700',
            ]"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
            <span class="whitespace-nowrap">{{
              slotProps?.item?.status === 'CONFIRMED_CLOSED'
                ? t('maintenance.status.confirmed_closed')
                : slotProps?.item?.status === 'IN_PROGRESS'
                  ? t('maintenance.status.in_progress')
                  : slotProps?.item?.status === 'OPEN'
                    ? t('maintenance.status.open')
                    : slotProps?.item?.status === 'ASSIGNED'
                      ? t('maintenance.status.assigned')
                      : t('maintenance.status.resolved')
            }}</span>
          </span>
        </template>

        <template #cell-actions="slotProps">
          <div class="inline-flex items-center justify-end gap-1.5 whitespace-nowrap">
            <!-- Landlord / Admin: Assign Technician -->
            <button
              v-if="
                slotProps?.item &&
                (isLandlord || isAdmin) &&
                (slotProps.item.status === 'OPEN' || slotProps.item.status === 'ASSIGNED')
              "
              @click="openAssignModal(slotProps.item)"
              class="shadow-xs inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg bg-primary-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-primary-700"
              :title="t('maintenance.assign_technician')"
            >
              <UserCheck :size="13" />
              <span>{{ t('maintenance.assign_technician') }}</span>
            </button>

            <!-- Technician / Admin / Landlord: Update Progress -->
            <button
              v-if="
                slotProps?.item &&
                (isTechnician || isAdmin || isLandlord) &&
                (slotProps.item.status === 'ASSIGNED' || slotProps.item.status === 'IN_PROGRESS')
              "
              @click="openUpdateModal(slotProps.item)"
              class="shadow-xs inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg bg-amber-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-amber-700"
              :title="t('maintenance.update_progress')"
            >
              <Wrench :size="13" />
              <span>{{ t('maintenance.update_progress') }}</span>
            </button>

            <!-- Tenant / Admin: Confirm Completion -->
            <button
              v-if="
                slotProps?.item && (isTenant || isAdmin) && slotProps.item.status === 'RESOLVED'
              "
              @click="openConfirmModal(slotProps.item)"
              class="shadow-xs inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
              :title="t('maintenance.confirm_resolution')"
            >
              <CheckCheck :size="13" />
              <span>{{ t('maintenance.confirm_resolution') }}</span>
            </button>

            <!-- Details View -->
            <button
              v-if="slotProps?.item"
              @click="viewingTicket = slotProps.item"
              class="inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-neutral-300 bg-white px-3 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
              :title="t('properties.details')"
            >
              <FileText :size="13" />
              <span>{{ t('properties.details') }}</span>
            </button>
          </div>
        </template>
      </AppDataTable>
    </AppTableCard>

    <!-- Modals -->
    <CreateMaintenanceModal
      :is-open="isCreateModalOpen"
      :is-submitting="isSubmitting"
      @close="isCreateModalOpen = false"
      @submit="executeCreateTicket"
    />

    <AssignTechnicianModal
      :ticket="ticketToAssign"
      :is-assigning="isAssigning"
      @close="ticketToAssign = null"
      @submit="executeAssign"
    />

    <!-- Update Progress / Resolve Modal -->
    <UpdateTicketModal
      :ticket="ticketToUpdate"
      :is-updating="isUpdating"
      :error="updateError"
      @close="ticketToUpdate = null"
      @submit="executeUpdateProgress"
    />

    <!-- Confirm Resolution Modal -->
    <ConfirmResolutionModal
      :ticket="ticketToConfirm"
      :is-confirming="isConfirming"
      @close="ticketToConfirm = null"
      @confirm="executeConfirmResolution"
    />

    <!-- Ticket Details Modal -->
    <TicketDetailsModal :ticket="viewingTicket" @close="viewingTicket = null" />
  </div>
</template>
