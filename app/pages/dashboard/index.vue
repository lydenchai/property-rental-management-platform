<script setup lang="ts">
import {
  Building,
  Key,
  CreditCard,
  Wrench,
  FileText,
  ClipboardList,
  CheckCircle2,
  Plus,
  ArrowRight,
  ShieldCheck,
  Users,
  BarChart3,
  Clock,
  AlertTriangle,
  RefreshCw,
} from '@lucide/vue';
import { useAuth } from '../../composables/useAuth';
import { useDashboardStore } from '../../stores/dashboard.store';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  title: 'Dashboard Overview',
});

const { t } = useI18n();
const { isAdmin, isLandlord, isTenant, isTechnician } = useAuth();
const dashboardStore = useDashboardStore();
const { metrics, isLoading } = dashboardStore;
const { fetchMetrics } = dashboardStore;

onMounted(() => {
  fetchMetrics();
});
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Overview Header -->
    <div
      class="shadow-xs flex flex-col items-start justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 md:flex-row md:items-center"
    >
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {{ t('dashboard.overview') }}
        </h1>
        <p class="mt-1 max-w-xl text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm">
          <template v-if="isAdmin">
            {{ t('dashboard.desc_admin') }}
          </template>
          <template v-else-if="isLandlord">
            {{ t('dashboard.desc_landlord') }}
          </template>
          <template v-else-if="isTenant">
            {{ t('dashboard.desc_tenant') }}
          </template>
          <template v-else-if="isTechnician">
            {{ t('dashboard.desc_technician') }}
          </template>
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2.5">
        <button @click="fetchMetrics" class="btn-secondary" :title="t('dashboard.refresh')">
          <RefreshCw :size="14" :class="{ 'animate-spin': isLoading }" />
          <span>{{ t('dashboard.refresh') }}</span>
        </button>
        <NuxtLink v-if="isLandlord || isAdmin" to="/dashboard/properties" class="btn-primary">
          <Plus :size="15" />
          <span>{{ t('dashboard.add_property') }}</span>
        </NuxtLink>
        <NuxtLink v-if="isTenant" to="/dashboard/maintenance" class="btn-primary">
          <Wrench :size="15" />
          <span>{{ t('dashboard.request_repair') }}</span>
        </NuxtLink>
        <NuxtLink v-if="isTechnician" to="/dashboard/maintenance" class="btn-primary">
          <ClipboardList :size="15" />
          <span>{{ t('dashboard.view_assigned_tasks') }}</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Metrics Cards Grid -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
      <!-- Admin Metrics -->
      <template v-if="isAdmin">
        <div
          class="shadow-xs flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-200/70 bg-blue-50 text-blue-600 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-400"
          >
            <Building :size="20" />
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              {{ t('dashboard.metrics.properties_units') }}
            </span>
            <div class="my-0.5 text-xl font-extrabold text-neutral-900 dark:text-white sm:text-2xl">
              <span v-if="isLoading" class="text-neutral-400">--</span>
              <span v-else
                >{{ metrics?.propertiesCount ?? 0 }} / {{ metrics?.unitsCount ?? 0 }}</span
              >
            </div>
            <span class="text-[11px] text-neutral-500 dark:text-neutral-400">{{
              t('dashboard.metrics.platform_listings')
            }}</span>
          </div>
        </div>

        <div
          class="shadow-xs flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-200/70 bg-emerald-50 text-emerald-600 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-400"
          >
            <Key :size="20" />
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{{
              t('dashboard.metrics.occupancy_rate')
            }}</span>
            <div class="my-0.5 text-xl font-extrabold text-neutral-900 dark:text-white sm:text-2xl">
              <span v-if="isLoading" class="text-neutral-400">--</span>
              <span v-else>{{ metrics?.occupancyRate ?? 0 }}%</span>
            </div>
            <span class="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">{{
              t('dashboard.metrics.system_average')
            }}</span>
          </div>
        </div>

        <div
          class="shadow-xs flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-200/70 bg-emerald-50 text-emerald-600 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-400"
          >
            <CreditCard :size="20" />
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{{
              t('dashboard.metrics.total_revenue')
            }}</span>
            <div class="my-0.5 text-xl font-extrabold text-neutral-900 dark:text-white sm:text-2xl">
              <span v-if="isLoading" class="text-neutral-400">--</span>
              <span v-else>{{
                typeof metrics?.totalRevenue === 'number'
                  ? '$' + metrics.totalRevenue.toLocaleString()
                  : (metrics?.totalRevenue ?? '$0.00')
              }}</span>
            </div>
            <span class="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">{{
              t('dashboard.metrics.platform_collections')
            }}</span>
          </div>
        </div>

        <div
          class="shadow-xs flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-200/70 bg-blue-50 text-blue-600 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-400"
          >
            <Users :size="20" />
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{{
              t('dashboard.metrics.active_users')
            }}</span>
            <div class="my-0.5 text-xl font-extrabold text-neutral-900 dark:text-white sm:text-2xl">
              <span v-if="isLoading" class="text-neutral-400">--</span>
              <span v-else>{{ metrics?.activeUsersCount ?? 0 }}</span>
            </div>
            <span class="text-[11px] text-neutral-500 dark:text-neutral-400">{{
              t('dashboard.metrics.across_roles')
            }}</span>
          </div>
        </div>

        <div
          class="shadow-xs flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-200/70 bg-amber-50 text-amber-600 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-400"
          >
            <Wrench :size="20" />
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{{
              t('dashboard.metrics.open_maintenance')
            }}</span>
            <div class="my-0.5 text-xl font-extrabold text-neutral-900 dark:text-white sm:text-2xl">
              <span v-if="isLoading" class="text-neutral-400">--</span>
              <span v-else>{{ metrics?.openMaintenanceCount ?? 0 }}</span>
            </div>
            <span class="text-[11px] font-medium text-amber-600 dark:text-amber-400">{{
              t('dashboard.metrics.active_tickets')
            }}</span>
          </div>
        </div>

        <div
          class="shadow-xs flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-indigo-200/70 bg-indigo-50 text-indigo-600 dark:border-indigo-900/40 dark:bg-indigo-950/40 dark:text-indigo-400"
          >
            <ShieldCheck :size="20" />
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{{
              t('dashboard.metrics.audit_events')
            }}</span>
            <div class="my-0.5 text-xl font-extrabold text-neutral-900 dark:text-white sm:text-2xl">
              <span v-if="isLoading" class="text-neutral-400">--</span>
              <span v-else>{{ metrics?.totalAuditLogs ?? 0 }}</span>
            </div>
            <span class="text-[11px] text-neutral-500 dark:text-neutral-400">{{
              t('dashboard.metrics.recorded_logs')
            }}</span>
          </div>
        </div>
      </template>

      <!-- Landlord Metrics -->
      <template v-else-if="isLandlord">
        <div
          class="shadow-xs flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-200/70 bg-blue-50 text-blue-600 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-400"
          >
            <Building :size="20" />
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{{
              t('dashboard.metrics.managed_properties')
            }}</span>
            <div class="my-0.5 text-xl font-extrabold text-neutral-900 dark:text-white sm:text-2xl">
              <span v-if="isLoading" class="text-neutral-400">--</span>
              <span v-else>{{ metrics?.managedProperties ?? 0 }}</span>
            </div>
            <span class="text-[11px] text-neutral-500 dark:text-neutral-400"
              >{{ metrics?.managedUnits ?? 0 }} {{ t('dashboard.metrics.total_units') }}</span
            >
          </div>
        </div>

        <div
          class="shadow-xs flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-200/70 bg-emerald-50 text-emerald-600 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-400"
          >
            <Key :size="20" />
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{{
              t('dashboard.metrics.occupancy_rate')
            }}</span>
            <div class="my-0.5 text-xl font-extrabold text-neutral-900 dark:text-white sm:text-2xl">
              <span v-if="isLoading" class="text-neutral-400">--</span>
              <span v-else>{{ metrics?.occupancyRate ?? 0 }}%</span>
            </div>
            <span class="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">{{
              t('dashboard.metrics.portfolio_average')
            }}</span>
          </div>
        </div>

        <div
          class="shadow-xs flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-200/70 bg-emerald-50 text-emerald-600 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-400"
          >
            <CreditCard :size="20" />
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{{
              t('dashboard.metrics.revenue_collected')
            }}</span>
            <div class="my-0.5 text-xl font-extrabold text-neutral-900 dark:text-white sm:text-2xl">
              <span v-if="isLoading" class="text-neutral-400">--</span>
              <span v-else>{{
                typeof metrics?.monthlyCollected === 'number'
                  ? '$' + metrics.monthlyCollected.toLocaleString()
                  : (metrics?.monthlyCollected ?? '$0.00')
              }}</span>
            </div>
            <span class="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">{{
              t('dashboard.metrics.completed_payments')
            }}</span>
          </div>
        </div>

        <div
          class="shadow-xs flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-rose-200/70 bg-rose-50 text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400"
          >
            <CreditCard :size="20" />
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{{
              t('dashboard.metrics.outstanding_balance')
            }}</span>
            <div class="my-0.5 text-xl font-extrabold text-neutral-900 dark:text-white sm:text-2xl">
              <span v-if="isLoading" class="text-neutral-400">--</span>
              <span v-else>{{
                typeof metrics?.outstandingRent === 'number'
                  ? '$' + metrics.outstandingRent.toLocaleString()
                  : (metrics?.outstandingRent ?? '$0.00')
              }}</span>
            </div>
            <span class="text-[11px] font-medium text-rose-600 dark:text-rose-400">{{
              t('dashboard.metrics.pending_overdue')
            }}</span>
          </div>
        </div>

        <div
          class="shadow-xs flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-200/70 bg-amber-50 text-amber-600 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-400"
          >
            <Wrench :size="20" />
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{{
              t('dashboard.metrics.open_maintenance')
            }}</span>
            <div class="my-0.5 text-xl font-extrabold text-neutral-900 dark:text-white sm:text-2xl">
              <span v-if="isLoading" class="text-neutral-400">--</span>
              <span v-else>{{ metrics?.openMaintenanceCount ?? 0 }}</span>
            </div>
            <span class="text-[11px] font-medium text-amber-600 dark:text-amber-400">{{
              t('dashboard.metrics.tickets_in_progress')
            }}</span>
          </div>
        </div>
      </template>

      <!-- Tenant Metrics -->
      <template v-else-if="isTenant">
        <div
          class="shadow-xs flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-200/70 bg-blue-50 text-blue-600 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-400"
          >
            <FileText :size="20" />
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{{
              t('dashboard.metrics.active_lease')
            }}</span>
            <div class="my-0.5 text-xl font-extrabold text-neutral-900 dark:text-white sm:text-2xl">
              <span v-if="isLoading" class="text-neutral-400">--</span>
              <span v-else-if="metrics?.hasActiveLease"
                >{{ t('dashboard.metrics.unit') }} {{ metrics.leaseDetails?.unitNumber }}</span
              >
              <span v-else class="text-base">{{ t('dashboard.metrics.no_active_lease') }}</span>
            </div>
            <span
              class="text-[11px] font-medium text-blue-600 dark:text-blue-400"
              v-if="metrics?.hasActiveLease"
            >
              ${{ metrics.leaseDetails?.rentAmount }}{{ t('properties.rent_per_month') }}
            </span>
            <span class="text-[11px] text-neutral-500 dark:text-neutral-400" v-else>{{
              t('dashboard.metrics.browse_available_units')
            }}</span>
          </div>
        </div>

        <div
          class="shadow-xs flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-200/70 bg-emerald-50 text-emerald-600 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-400"
          >
            <CreditCard :size="20" />
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{{
              t('dashboard.metrics.next_rent_due')
            }}</span>
            <div class="my-0.5 text-xl font-extrabold text-neutral-900 dark:text-white sm:text-2xl">
              <span v-if="isLoading" class="text-neutral-400">--</span>
              <span v-else-if="metrics?.nextRentDue"
                >${{ metrics.nextRentDue.remaining?.toFixed(2) ?? '0.00' }}</span
              >
              <span v-else>$0.00</span>
            </div>
            <span
              class="text-[11px] font-medium text-amber-600 dark:text-amber-400"
              v-if="metrics?.nextRentDue"
            >
              {{ t('dashboard.metrics.due') }}
              {{ new Date(metrics.nextRentDue.dueDate).toLocaleDateString() }}
            </span>
            <span class="text-[11px] font-medium text-emerald-600 dark:text-emerald-400" v-else>{{
              t('dashboard.metrics.all_settled')
            }}</span>
          </div>
        </div>

        <div
          class="shadow-xs flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-200/70 bg-amber-50 text-amber-600 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-400"
          >
            <Wrench :size="20" />
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{{
              t('dashboard.metrics.maintenance_tickets')
            }}</span>
            <div class="my-0.5 text-xl font-extrabold text-neutral-900 dark:text-white sm:text-2xl">
              <span v-if="isLoading" class="text-neutral-400">--</span>
              <span v-else
                >{{ metrics?.activeMaintenanceCount ?? 0 }}
                {{ t('dashboard.metrics.active') }}</span
              >
            </div>
            <span class="text-[11px] font-medium text-amber-600 dark:text-amber-400">{{
              t('dashboard.metrics.track_repair_updates')
            }}</span>
          </div>
        </div>

        <div
          class="shadow-xs flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-indigo-200/70 bg-indigo-50 text-indigo-600 dark:border-indigo-900/40 dark:bg-indigo-950/40 dark:text-indigo-400"
          >
            <ClipboardList :size="20" />
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{{
              t('dashboard.metrics.applications')
            }}</span>
            <div class="my-0.5 text-xl font-extrabold text-neutral-900 dark:text-white sm:text-2xl">
              <span v-if="isLoading" class="text-neutral-400">--</span>
              <span v-else>{{ metrics?.applicationsCount ?? 0 }}</span>
            </div>
            <span class="text-[11px] text-neutral-500 dark:text-neutral-400">{{
              t('dashboard.metrics.submitted_applications')
            }}</span>
          </div>
        </div>
      </template>

      <!-- Technician Metrics -->
      <template v-else-if="isTechnician">
        <div
          class="shadow-xs flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-200/70 bg-amber-50 text-amber-600 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-400"
          >
            <Wrench :size="20" />
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{{
              t('dashboard.metrics.assigned_orders')
            }}</span>
            <div class="my-0.5 text-xl font-extrabold text-neutral-900 dark:text-white sm:text-2xl">
              <span v-if="isLoading" class="text-neutral-400">--</span>
              <span v-else
                >{{ metrics?.assignedCount ?? 0 }} {{ t('dashboard.metrics.pending') }}</span
              >
            </div>
            <span class="text-[11px] font-medium text-amber-600 dark:text-amber-400">{{
              t('dashboard.metrics.ready_for_dispatch')
            }}</span>
          </div>
        </div>

        <div
          class="shadow-xs flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-200/70 bg-blue-50 text-blue-600 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-400"
          >
            <Clock :size="20" />
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{{
              t('dashboard.metrics.in_progress')
            }}</span>
            <div class="my-0.5 text-xl font-extrabold text-neutral-900 dark:text-white sm:text-2xl">
              <span v-if="isLoading" class="text-neutral-400">--</span>
              <span v-else
                >{{ metrics?.inProgressCount ?? 0 }} {{ t('dashboard.metrics.active') }}</span
              >
            </div>
            <span class="text-[11px] font-medium text-blue-600 dark:text-blue-400">{{
              t('dashboard.metrics.under_repair')
            }}</span>
          </div>
        </div>

        <div
          class="shadow-xs flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-200/70 bg-emerald-50 text-emerald-600 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-400"
          >
            <CheckCircle2 :size="20" />
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{{
              t('dashboard.metrics.completed_repairs')
            }}</span>
            <div class="my-0.5 text-xl font-extrabold text-neutral-900 dark:text-white sm:text-2xl">
              <span v-if="isLoading" class="text-neutral-400">--</span>
              <span v-else
                >{{ metrics?.completedCount ?? 0 }} {{ t('dashboard.metrics.closed') }}</span
              >
            </div>
            <span class="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">{{
              t('dashboard.metrics.verified_resolution')
            }}</span>
          </div>
        </div>

        <div
          class="shadow-xs flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-rose-200/70 bg-rose-50 text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400"
          >
            <AlertTriangle :size="20" />
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{{
              t('dashboard.metrics.emergency_priority')
            }}</span>
            <div class="my-0.5 text-xl font-extrabold text-neutral-900 dark:text-white sm:text-2xl">
              <span v-if="isLoading" class="text-neutral-400">--</span>
              <span v-else>{{ metrics?.emergencyCount ?? 0 }}</span>
            </div>
            <span class="text-[11px] font-medium text-rose-600 dark:text-rose-400">{{
              t('dashboard.metrics.urgent_attention')
            }}</span>
          </div>
        </div>
      </template>
    </div>

    <!-- Quick Navigation Workflow Links -->
    <div class="mt-2 flex flex-col gap-3">
      <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
        {{ t('dashboard.workflows.title') }}
      </h3>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-if="isLandlord || isAdmin"
          to="/dashboard/properties"
          class="shadow-xs group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
        >
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-200/70 bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-400 dark:group-hover:bg-blue-900/40"
          >
            <Building :size="20" />
          </div>
          <div class="flex min-w-0 flex-1 flex-col">
            <h4
              class="text-sm font-bold text-neutral-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400"
            >
              {{ t('dashboard.workflows.property_title') }}
            </h4>
            <p class="truncate text-xs text-neutral-500 dark:text-neutral-400">
              {{ t('dashboard.workflows.property_desc') }}
            </p>
          </div>
          <ArrowRight
            :size="16"
            class="shrink-0 text-neutral-400 transition-all group-hover:translate-x-0.5 group-hover:text-neutral-900 dark:group-hover:text-white"
          />
        </NuxtLink>

        <NuxtLink
          v-if="isLandlord || isAdmin"
          to="/dashboard/reports"
          class="shadow-xs group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
        >
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-200/70 bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-400 dark:group-hover:bg-emerald-900/40"
          >
            <BarChart3 :size="20" />
          </div>
          <div class="flex min-w-0 flex-1 flex-col">
            <h4
              class="text-sm font-bold text-neutral-900 transition-colors group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400"
            >
              {{ t('dashboard.workflows.analytics_title') }}
            </h4>
            <p class="truncate text-xs text-neutral-500 dark:text-neutral-400">
              {{ t('dashboard.workflows.analytics_desc') }}
            </p>
          </div>
          <ArrowRight
            :size="16"
            class="shrink-0 text-neutral-400 transition-all group-hover:translate-x-0.5 group-hover:text-neutral-900 dark:group-hover:text-white"
          />
        </NuxtLink>

        <NuxtLink
          v-if="isLandlord || isAdmin || isTenant"
          to="/dashboard/applications"
          class="shadow-xs group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
        >
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-200/70 bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-400 dark:group-hover:bg-blue-900/40"
          >
            <ClipboardList :size="20" />
          </div>
          <div class="flex min-w-0 flex-1 flex-col">
            <h4
              class="text-sm font-bold text-neutral-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400"
            >
              {{ t('dashboard.workflows.applications_title') }}
            </h4>
            <p class="truncate text-xs text-neutral-500 dark:text-neutral-400">
              {{ t('dashboard.workflows.applications_desc') }}
            </p>
          </div>
          <ArrowRight
            :size="16"
            class="shrink-0 text-neutral-400 transition-all group-hover:translate-x-0.5 group-hover:text-neutral-900 dark:group-hover:text-white"
          />
        </NuxtLink>

        <NuxtLink
          v-if="!isTechnician"
          to="/dashboard/invoices"
          class="shadow-xs group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
        >
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-200/70 bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-400 dark:group-hover:bg-emerald-900/40"
          >
            <CreditCard :size="20" />
          </div>
          <div class="flex min-w-0 flex-1 flex-col">
            <h4
              class="text-sm font-bold text-neutral-900 transition-colors group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400"
            >
              {{ t('dashboard.workflows.invoices_title') }}
            </h4>
            <p class="truncate text-xs text-neutral-500 dark:text-neutral-400">
              {{ t('dashboard.workflows.invoices_desc') }}
            </p>
          </div>
          <ArrowRight
            :size="16"
            class="shrink-0 text-neutral-400 transition-all group-hover:translate-x-0.5 group-hover:text-neutral-900 dark:group-hover:text-white"
          />
        </NuxtLink>

        <NuxtLink
          to="/dashboard/maintenance"
          class="shadow-xs group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
        >
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-200/70 bg-amber-50 text-amber-600 transition-colors group-hover:bg-amber-100 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-400 dark:group-hover:bg-amber-900/40"
          >
            <Wrench :size="20" />
          </div>
          <div class="flex min-w-0 flex-1 flex-col">
            <h4
              class="text-sm font-bold text-neutral-900 transition-colors group-hover:text-amber-600 dark:text-white dark:group-hover:text-amber-400"
            >
              {{ t('dashboard.workflows.maintenance_title') }}
            </h4>
            <p class="truncate text-xs text-neutral-500 dark:text-neutral-400">
              {{ t('dashboard.workflows.maintenance_desc') }}
            </p>
          </div>
          <ArrowRight
            :size="16"
            class="shrink-0 text-neutral-400 transition-all group-hover:translate-x-0.5 group-hover:text-neutral-900 dark:group-hover:text-white"
          />
        </NuxtLink>

        <NuxtLink
          v-if="isAdmin"
          to="/dashboard/audit-logs"
          class="shadow-xs group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
        >
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-indigo-200/70 bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100 dark:border-indigo-900/40 dark:bg-indigo-950/40 dark:text-indigo-400 dark:group-hover:bg-indigo-900/40"
          >
            <ShieldCheck :size="20" />
          </div>
          <div class="flex min-w-0 flex-1 flex-col">
            <h4
              class="text-sm font-bold text-neutral-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400"
            >
              {{ t('dashboard.workflows.audit_title') }}
            </h4>
            <p class="truncate text-xs text-neutral-500 dark:text-neutral-400">
              {{ t('dashboard.workflows.audit_desc') }}
            </p>
          </div>
          <ArrowRight
            :size="16"
            class="shrink-0 text-neutral-400 transition-all group-hover:translate-x-0.5 group-hover:text-neutral-900 dark:group-hover:text-white"
          />
        </NuxtLink>

        <NuxtLink
          v-if="isAdmin"
          to="/dashboard/users"
          class="shadow-xs group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
        >
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-200/70 bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-400 dark:group-hover:bg-blue-900/40"
          >
            <Users :size="20" />
          </div>
          <div class="flex min-w-0 flex-1 flex-col">
            <h4
              class="text-sm font-bold text-neutral-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400"
            >
              {{ t('dashboard.workflows.users_title') }}
            </h4>
            <p class="truncate text-xs text-neutral-500 dark:text-neutral-400">
              {{ t('dashboard.workflows.users_desc') }}
            </p>
          </div>
          <ArrowRight
            :size="16"
            class="shrink-0 text-neutral-400 transition-all group-hover:translate-x-0.5 group-hover:text-neutral-900 dark:group-hover:text-white"
          />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
