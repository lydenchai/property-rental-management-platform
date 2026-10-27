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
} from '~~/shared/types';
import AppTableCard from '../../../components/common/AppTableCard.vue';

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
const createForm = ref<CreateMaintenanceInput>({
  unitId: 'unit-skyline-101a',
  title: '',
  description: '',
  priority: 'MEDIUM',
});

const ticketToAssign = ref<MaintenanceItem | null>(null);
const assignForm = ref<AssignTechnicianInput>({
  technicianId: 'user-tech-01',
  notes: '',
});

const ticketToUpdate = ref<MaintenanceItem | null>(null);
const updateError = ref<string | null>(null);
const updateForm = ref<UpdateProgressInput>({
  status: 'IN_PROGRESS',
  resolutionNotes: '',
});

const ticketToConfirm = ref<MaintenanceItem | null>(null);
const confirmForm = ref<ConfirmResolutionInput>({
  confirmed: true,
  feedback: '',
});

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

watch([activeTab, searchQuery], () => {
  currentPage.value = 1;
});

async function executeCreateTicket() {
  const res = (await maintenanceStore.createTicket(createForm.value)) as any;
  if (res.success) {
    successMessage.value = res.message || 'Maintenance ticket created successfully';
    isCreateModalOpen.value = false;
    createForm.value = {
      unitId: 'unit-skyline-101a',
      title: '',
      description: '',
      priority: 'MEDIUM',
    };
    setTimeout(() => {
      successMessage.value = null;
    }, 4000);
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
  const res = (await maintenanceStore.assignTechnician(
    ticketToAssign.value.id,
    assignForm.value
  )) as any;
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
  updateForm.value = {
    status: ticket.status === 'ASSIGNED' ? 'IN_PROGRESS' : 'RESOLVED',
    resolutionNotes: ticket.resolutionNotes || '',
  };
}

async function executeUpdateProgress() {
  if (!ticketToUpdate.value) return;
  updateError.value = null;
  const payload: UpdateProgressInput = {
    status: updateForm.value.status,
    ...(updateForm.value.resolutionNotes?.trim()
      ? { resolutionNotes: updateForm.value.resolutionNotes.trim() }
      : {}),
  };
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
  confirmForm.value = {
    confirmed: true,
    feedback: '',
  };
}

async function executeConfirmResolution() {
  if (!ticketToConfirm.value) return;
  const res = (await maintenanceStore.confirmResolution(
    ticketToConfirm.value.id,
    confirmForm.value
  )) as any;
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
        class="shadow-xs flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
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
        class="shadow-xs flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
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
        class="shadow-xs flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
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
        class="shadow-xs flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
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
      :search-placeholder="t('maintenance.title')"
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

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-neutral-700 dark:text-neutral-200">
          <thead
            class="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-400"
          >
            <tr>
              <th class="px-4 py-3">{{ t('maintenance.col_priority') }}</th>
              <th class="px-4 py-3">{{ t('maintenance.col_ticket') }}</th>
              <th class="px-4 py-3">{{ t('maintenance.col_unit_property') }}</th>
              <th class="px-4 py-3">{{ t('maintenance.col_requester') }}</th>
              <th class="px-4 py-3">{{ t('maintenance.col_technician') }}</th>
              <th class="px-4 py-3">{{ t('maintenance.col_status') }}</th>
              <th class="px-4 py-3 text-right">{{ t('maintenance.col_actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
            <tr
              v-for="ticket in paginatedRequests"
              :key="ticket.id"
              class="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
            >
              <td class="px-4 py-3.5">
                <span
                  :class="[
                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                    ticket.priority === 'EMERGENCY'
                      ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-400'
                      : ticket.priority === 'HIGH'
                        ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                        : ticket.priority === 'MEDIUM'
                          ? 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-400'
                          : 'border-neutral-200 bg-neutral-100 text-neutral-700',
                  ]"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
                  <span>{{
                    ticket.priority === 'EMERGENCY'
                      ? t('dashboard.metrics.emergency_priority')
                      : ticket.priority === 'HIGH'
                        ? t('maintenance.priority.high')
                        : ticket.priority === 'MEDIUM'
                          ? t('maintenance.priority.medium')
                          : t('maintenance.priority.low')
                  }}</span>
                </span>
              </td>
              <td class="px-4 py-3.5">
                <div class="flex max-w-xs flex-col">
                  <span class="truncate font-semibold text-neutral-900 dark:text-white">{{
                    ticket.title
                  }}</span>
                  <span class="line-clamp-1 text-xs text-neutral-500 dark:text-neutral-400">{{
                    ticket.description
                  }}</span>
                  <span class="mt-0.5 text-[11px] text-neutral-400 dark:text-neutral-500"
                    >{{ t('maintenance.col_reported') }}:
                    {{ new Date(ticket.requestedAt).toLocaleDateString() }}</span
                  >
                </div>
              </td>
              <td class="px-4 py-3.5">
                <div class="flex flex-col">
                  <span class="font-semibold text-neutral-900 dark:text-white"
                    >{{ t('dashboard.metrics.unit') }} {{ ticket.unit?.unitNumber || '101A' }}</span
                  >
                  <span class="text-xs text-neutral-500 dark:text-neutral-400">{{
                    ticket.unit?.property?.title || 'Skyline Heights'
                  }}</span>
                </div>
              </td>
              <td class="px-4 py-3.5">
                <div class="flex flex-col text-xs">
                  <span class="font-medium text-neutral-900 dark:text-white">{{
                    ticket.tenant?.fullName || 'Sarah Jenkins'
                  }}</span>
                  <span class="text-neutral-500 dark:text-neutral-400">{{
                    ticket.tenant?.phone || 'tenant@example.com'
                  }}</span>
                </div>
              </td>
              <td class="px-4 py-3.5">
                <div
                  v-if="ticket.assignments && ticket.assignments.length > 0"
                  class="flex flex-col text-xs"
                >
                  <span class="font-medium text-neutral-900 dark:text-white">{{
                    ticket.assignments[0]!.technician?.fullName || 'Alex Rivers'
                  }}</span>
                  <span class="text-neutral-500 dark:text-neutral-400"
                    >{{ t('maintenance.filter_assigned') }}
                    {{ new Date(ticket.assignments[0]!.assignedAt).toLocaleDateString() }}</span
                  >
                </div>
                <div v-else class="text-xs italic text-neutral-400 dark:text-neutral-500">
                  {{ t('common.not_available') }}
                </div>
              </td>
              <td class="px-4 py-3.5">
                <span
                  :class="[
                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                    ticket.status === 'RESOLVED'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                      : ticket.status === 'IN_PROGRESS'
                        ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                        : ticket.status === 'OPEN'
                          ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400'
                          : ticket.status === 'ASSIGNED'
                            ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-400'
                            : 'border-neutral-200 bg-neutral-100 text-neutral-700',
                  ]"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
                  <span>{{
                    ticket.status === 'CONFIRMED_CLOSED'
                      ? t('maintenance.status.confirmed_closed')
                      : ticket.status === 'IN_PROGRESS'
                        ? t('maintenance.status.in_progress')
                        : ticket.status === 'OPEN'
                          ? t('maintenance.status.open')
                          : ticket.status === 'ASSIGNED'
                            ? t('maintenance.status.assigned')
                            : t('maintenance.status.resolved')
                  }}</span>
                </span>
              </td>
              <td class="px-4 py-3.5 text-right">
                <div class="inline-flex items-center justify-end gap-1.5">
                  <!-- Landlord / Admin: Assign Technician -->
                  <button
                    v-if="
                      (isLandlord || isAdmin) &&
                      (ticket.status === 'OPEN' || ticket.status === 'ASSIGNED')
                    "
                    @click="openAssignModal(ticket)"
                    class="shadow-xs inline-flex cursor-pointer items-center gap-1 rounded-lg bg-primary-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-primary-700"
                    :title="t('maintenance.assign_technician')"
                  >
                    <UserCheck :size="13" />
                    <span>{{ t('maintenance.assign_technician') }}</span>
                  </button>

                  <!-- Technician / Admin / Landlord: Update Progress -->
                  <button
                    v-if="
                      (isTechnician || isAdmin || isLandlord) &&
                      (ticket.status === 'ASSIGNED' || ticket.status === 'IN_PROGRESS')
                    "
                    @click="openUpdateModal(ticket)"
                    class="shadow-xs inline-flex cursor-pointer items-center gap-1 rounded-lg bg-amber-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-amber-700"
                    :title="t('maintenance.update_progress')"
                  >
                    <Wrench :size="13" />
                    <span>{{ t('maintenance.update_progress') }}</span>
                  </button>

                  <!-- Tenant / Admin: Confirm Completion -->
                  <button
                    v-if="(isTenant || isAdmin) && ticket.status === 'RESOLVED'"
                    @click="openConfirmModal(ticket)"
                    class="shadow-xs inline-flex cursor-pointer items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-emerald-700"
                    :title="t('maintenance.confirm_resolution')"
                  >
                    <CheckCheck :size="13" />
                    <span>{{ t('maintenance.confirm_resolution') }}</span>
                  </button>

                  <!-- Details View -->
                  <button
                    @click="viewingTicket = ticket"
                    class="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-neutral-300 px-2.5 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                    :title="t('properties.details')"
                  >
                    <FileText :size="13" />
                    <span>{{ t('properties.details') }}</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </AppTableCard>

    <!-- Create Maintenance Request Modal -->
    <Teleport to="body">
      <div
        v-if="isCreateModalOpen"
        class="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      >
        <div
          class="w-full max-w-lg overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800"
          >
            <h3 class="text-base font-semibold text-neutral-900 dark:text-white">
              {{ t('maintenance.create_modal_title') }}
            </h3>
            <button
              @click="isCreateModalOpen = false"
              class="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X :size="18" />
            </button>
          </div>

          <form @submit.prevent="executeCreateTicket" class="space-y-4 p-6">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="space-y-1.5">
                <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">{{
                  t('maintenance.unit_select_label')
                }}</label>
                <input
                  v-model="createForm.unitId"
                  type="text"
                  required
                  class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  :placeholder="t('maintenance.unit_select_placeholder')"
                />
              </div>
              <div class="space-y-1.5">
                <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">{{
                  t('maintenance.select_priority')
                }}</label>
                <select
                  v-model="createForm.priority"
                  required
                  class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                >
                  <option value="LOW">{{ t('maintenance.priority_low_desc') }}</option>
                  <option value="MEDIUM">{{ t('maintenance.priority_medium_desc') }}</option>
                  <option value="HIGH">{{ t('maintenance.priority_high_desc') }}</option>
                  <option value="EMERGENCY">{{ t('maintenance.priority_emergency_desc') }}</option>
                </select>
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">{{
                t('maintenance.issue_title')
              }}</label>
              <input
                v-model="createForm.title"
                type="text"
                required
                class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                placeholder="e.g. HVAC Air Conditioning Not Cooling"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">{{
                t('maintenance.issue_desc')
              }}</label>
              <textarea
                v-model="createForm.description"
                rows="4"
                required
                class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                placeholder="Please provide precise details regarding where the issue is located, when it started, and any symptoms observed..."
              ></textarea>
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                @click="isCreateModalOpen = false"
                class="cursor-pointer rounded-lg border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="shadow-xs inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
              >
                <Plus :size="14" />
                <span>{{
                  isSubmitting ? t('maintenance.submitting_ticket') : t('maintenance.submit_ticket')
                }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Assign Technician Modal -->
    <Teleport to="body">
      <div
        v-if="ticketToAssign"
        class="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      >
        <div
          class="w-full max-w-lg overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800"
          >
            <h3 class="text-base font-semibold text-neutral-900 dark:text-white">
              {{ t('maintenance.assign_modal_title') }}
            </h3>
            <button
              @click="ticketToAssign = null"
              class="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X :size="18" />
            </button>
          </div>

          <form @submit.prevent="executeAssign" class="space-y-4 p-6">
            <div
              class="space-y-1.5 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-300"
            >
              <div>
                <strong class="text-neutral-900 dark:text-white"
                  >{{ t('maintenance.issue_title') }}:</strong
                >
                {{ ticketToAssign.title }}
              </div>
              <div>
                <strong class="text-neutral-900 dark:text-white">Unit:</strong> Unit
                {{ ticketToAssign.unit?.unitNumber }} ({{ ticketToAssign.unit?.property?.title }})
              </div>
              <div>
                <strong class="text-neutral-900 dark:text-white"
                  >{{ t('maintenance.col_priority') }}:</strong
                >
                {{ ticketToAssign.priority }}
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">{{
                t('maintenance.select_technician')
              }}</label>
              <select
                v-model="assignForm.technicianId"
                required
                class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              >
                <option value="user-tech-01">
                  Alex Rivers (Licensed HVAC & Plumbing Specialist)
                </option>
                <option value="user-technician-01">
                  Dave Miller (General Building Maintenance)
                </option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">{{
                t('maintenance.dispatch_notes')
              }}</label>
              <textarea
                v-model="assignForm.notes"
                rows="3"
                class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                placeholder="Optional notes, access instructions, or tools needed..."
              ></textarea>
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                @click="ticketToAssign = null"
                class="cursor-pointer rounded-lg border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                type="submit"
                :disabled="isAssigning"
                class="shadow-xs inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
              >
                <UserCheck :size="14" />
                <span>{{
                  isAssigning
                    ? t('maintenance.assigning_tech')
                    : t('maintenance.confirm_assignment')
                }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Update Progress / Resolve Modal -->
    <Teleport to="body">
      <div
        v-if="ticketToUpdate"
        class="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      >
        <div
          class="w-full max-w-lg overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800"
          >
            <h3 class="text-base font-semibold text-neutral-900 dark:text-white">
              {{ t('maintenance.update_modal_title') }}
            </h3>
            <button
              @click="ticketToUpdate = null"
              class="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X :size="18" />
            </button>
          </div>

          <form @submit.prevent="executeUpdateProgress" class="space-y-4 p-6">
            <div
              v-if="updateError"
              class="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400"
            >
              <AlertCircle :size="15" class="shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{{ updateError }}</span>
            </div>
            <div
              class="space-y-1.5 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-300"
            >
              <div>
                <strong class="text-neutral-900 dark:text-white"
                  >{{ t('maintenance.issue_title') }}:</strong
                >
                {{ ticketToUpdate.title }}
              </div>
              <div>
                <strong class="text-neutral-900 dark:text-white">Unit:</strong> Unit
                {{ ticketToUpdate.unit?.unitNumber }}
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">{{
                t('maintenance.progress_status')
              }}</label>
              <select
                v-model="updateForm.status"
                required
                class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              >
                <option value="IN_PROGRESS">In Progress (Diagnostics / Parts ordered)</option>
                <option value="RESOLVED">
                  Resolved (Repairs completed, ready for tenant check)
                </option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">{{
                t('maintenance.resolution_notes')
              }}</label>
              <textarea
                v-model="updateForm.resolutionNotes"
                rows="4"
                class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                placeholder="Detail parts replaced, repairs performed, and tests conducted..."
              ></textarea>
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                @click="ticketToUpdate = null"
                class="cursor-pointer rounded-lg border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                type="submit"
                :disabled="isUpdating"
                class="shadow-xs inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
              >
                <CheckCircle2 :size="14" />
                <span>{{
                  isUpdating ? t('maintenance.updating_progress') : t('maintenance.save_progress')
                }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Confirm Resolution Modal -->
    <Teleport to="body">
      <div
        v-if="ticketToConfirm"
        class="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      >
        <div
          class="w-full max-w-lg overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800"
          >
            <h3 class="text-base font-semibold text-neutral-900 dark:text-white">
              {{ t('maintenance.confirm_modal_title') }}
            </h3>
            <button
              @click="ticketToConfirm = null"
              class="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X :size="18" />
            </button>
          </div>

          <form @submit.prevent="executeConfirmResolution" class="space-y-4 p-6">
            <div
              class="space-y-1.5 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-300"
            >
              <div>
                <strong class="text-neutral-900 dark:text-white"
                  >{{ t('maintenance.issue_title') }}:</strong
                >
                {{ ticketToConfirm.title }}
              </div>
              <div>
                <strong class="text-neutral-900 dark:text-white"
                  >{{ t('maintenance.resolution_notes') }}:</strong
                >
                {{ ticketToConfirm.resolutionNotes || 'Repairs completed.' }}
              </div>
            </div>

            <p class="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
              {{ t('maintenance.confirm_checkbox') }}
            </p>

            <div class="space-y-1.5">
              <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">{{
                t('maintenance.feedback_notes')
              }}</label>
              <input
                v-model="confirmForm.feedback"
                type="text"
                class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                placeholder="e.g. Prompt and clean service, thank you!"
              />
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                @click="ticketToConfirm = null"
                class="cursor-pointer rounded-lg border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                type="submit"
                :disabled="isConfirming"
                class="shadow-xs inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
              >
                <CheckCheck :size="14" />
                <span>{{
                  isConfirming ? t('maintenance.closing_ticket') : t('maintenance.confirm_close')
                }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Ticket Details Modal -->
    <Teleport to="body">
      <div
        v-if="viewingTicket"
        class="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      >
        <div
          class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800"
          >
            <h3 class="text-base font-semibold text-neutral-900 dark:text-white">
              {{ t('maintenance.ticket_details_title') }}
            </h3>
            <button
              @click="viewingTicket = null"
              class="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X :size="18" />
            </button>
          </div>

          <div class="space-y-4 p-6">
            <div
              class="space-y-2 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-300"
            >
              <div>
                <strong class="text-neutral-900 dark:text-white"
                  >{{ t('maintenance.issue_title') }}:</strong
                >
                {{ viewingTicket.title }}
              </div>
              <div class="flex items-center gap-2">
                <strong class="text-neutral-900 dark:text-white"
                  >{{ t('maintenance.col_priority') }}:</strong
                >
                <span
                  :class="[
                    'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
                    viewingTicket.priority === 'EMERGENCY'
                      ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-400'
                      : viewingTicket.priority === 'HIGH'
                        ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                        : viewingTicket.priority === 'MEDIUM'
                          ? 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-400'
                          : 'border-neutral-200 bg-neutral-100 text-neutral-700',
                  ]"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
                  <span>{{
                    viewingTicket.priority === 'EMERGENCY'
                      ? t('maintenance.priority.urgent')
                      : viewingTicket.priority === 'HIGH'
                        ? t('maintenance.priority.high')
                        : viewingTicket.priority === 'MEDIUM'
                          ? t('maintenance.priority.medium')
                          : t('maintenance.priority.low')
                  }}</span>
                </span>
              </div>
              <div class="flex items-center gap-2">
                <strong class="text-neutral-900 dark:text-white"
                  >{{ t('maintenance.col_status') }}:</strong
                >
                <span
                  :class="[
                    'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
                    viewingTicket.status === 'RESOLVED'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                      : viewingTicket.status === 'IN_PROGRESS'
                        ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                        : viewingTicket.status === 'OPEN'
                          ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400'
                          : viewingTicket.status === 'ASSIGNED'
                            ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-400'
                            : 'border-neutral-200 bg-neutral-100 text-neutral-700',
                  ]"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
                  <span>{{
                    viewingTicket.status === 'CONFIRMED_CLOSED'
                      ? t('maintenance.status.confirmed_closed')
                      : viewingTicket.status === 'IN_PROGRESS'
                        ? t('maintenance.status.in_progress')
                        : viewingTicket.status === 'OPEN'
                          ? t('maintenance.status.open')
                          : viewingTicket.status === 'ASSIGNED'
                            ? t('maintenance.status.assigned')
                            : t('maintenance.status.resolved')
                  }}</span>
                </span>
              </div>
              <div>
                <strong class="text-neutral-900 dark:text-white"
                  >{{ t('maintenance.col_unit_property') }}:</strong
                >
                Unit {{ viewingTicket.unit?.unitNumber }} ({{
                  viewingTicket.unit?.property?.title
                }})
              </div>
              <div>
                <strong class="text-neutral-900 dark:text-white"
                  >{{ t('maintenance.col_requester') }}:</strong
                >
                {{ viewingTicket.tenant?.fullName }} ({{ viewingTicket.tenant?.email }})
              </div>
              <div v-if="viewingTicket.assignments && viewingTicket.assignments.length > 0">
                <strong class="text-neutral-900 dark:text-white"
                  >{{ t('maintenance.col_technician') }}:</strong
                >
                {{ viewingTicket.assignments[0]!.technician?.fullName }}
              </div>
              <div>
                <strong class="text-neutral-900 dark:text-white"
                  >{{ t('maintenance.col_reported') }}:</strong
                >
                {{ new Date(viewingTicket.requestedAt).toLocaleString() }}
              </div>
              <div v-if="viewingTicket.resolvedAt">
                <strong class="text-neutral-900 dark:text-white">Resolved At:</strong>
                {{ new Date(viewingTicket.resolvedAt).toLocaleString() }}
              </div>
              <div v-if="viewingTicket.confirmedAt">
                <strong class="text-neutral-900 dark:text-white">Confirmed Closed:</strong>
                {{ new Date(viewingTicket.confirmedAt).toLocaleString() }}
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                >{{ t('maintenance.issue_desc') }}:</label
              >
              <div
                class="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs leading-relaxed text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-200"
              >
                {{ viewingTicket.description }}
              </div>
            </div>

            <div v-if="viewingTicket.resolutionNotes" class="space-y-1.5">
              <label class="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                >{{ t('maintenance.resolution_notes') }}:</label
              >
              <div
                class="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300"
              >
                {{ viewingTicket.resolutionNotes }}
              </div>
            </div>

            <div class="flex justify-end pt-2">
              <button
                @click="viewingTicket = null"
                class="cursor-pointer rounded-lg border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
              >
                {{ t('maintenance.close_btn') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
