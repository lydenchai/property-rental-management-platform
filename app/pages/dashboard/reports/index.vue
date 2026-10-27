<script setup lang="ts">
import {
  Key,
  CreditCard,
  Building,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Download,
  Layers,
  ArrowUpRight,
} from '@lucide/vue';
import { useAuth } from '../../../composables/useAuth';
import { useReportStore } from '../../../stores/report.store';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  title: 'Reports & Analytics',
});

const { t } = useI18n();
const { isAdmin, isLandlord } = useAuth();
const router = useRouter();

// Restrict access to Landlord and Admin
onMounted(() => {
  if (!isAdmin.value && !isLandlord.value) {
    router.replace('/dashboard');
  }
});

const activeTab = ref<'occupancy' | 'financials'>('occupancy');
const reportStore = useReportStore();

const { occupancyData, financialData, isLoading, errorMessage } = reportStore;

const { loadReports, exportCSV: storeExportCSV } = reportStore;

onMounted(() => {
  loadReports();
});

const exportCSV = () => {
  storeExportCSV(activeTab.value);
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {{ t('reports.title') }}
        </h1>
        <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {{ t('reports.subtitle') }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="loadReports"
          :disabled="isLoading"
          class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
        >
          <RefreshCw :size="14" :class="{ 'animate-spin': isLoading }" />
          <span>{{ t('reports.refresh') }}</span>
        </button>
        <button
          @click="exportCSV"
          :disabled="isLoading"
          class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
        >
          <Download :size="14" />
          <span>{{ t('reports.export_csv') }}</span>
        </button>
      </div>
    </div>

    <!-- Error Banner -->
    <div
      v-if="errorMessage"
      class="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300"
    >
      <AlertTriangle :size="18" class="shrink-0 text-rose-600 dark:text-rose-400" />
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Tab Selector -->
    <div
      class="inline-flex items-center gap-1 rounded-xl border border-neutral-200 bg-neutral-100 p-1 dark:border-neutral-700 dark:bg-neutral-800"
    >
      <button
        @click="activeTab = 'occupancy'"
        :class="[
          'inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors',
          activeTab === 'occupancy'
            ? 'shadow-xs bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white'
            : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white',
        ]"
      >
        <Key :size="15" />
        <span>{{ t('reports.tab_occupancy') }}</span>
      </button>
      <button
        @click="activeTab = 'financials'"
        :class="[
          'inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors',
          activeTab === 'financials'
            ? 'shadow-xs bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white'
            : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white',
        ]"
      >
        <CreditCard :size="15" />
        <span>{{ t('reports.tab_financials') }}</span>
      </button>
    </div>

    <!-- TAB 1: OCCUPANCY ANALYTICS -->
    <div v-if="activeTab === 'occupancy'" class="space-y-6">
      <!-- High Level Metrics -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          class="shadow-xs flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div class="flex items-center justify-between">
            <span
              class="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
              >{{ t('reports.total_units') }}</span
            >
            <Building :size="16" class="text-neutral-400" />
          </div>
          <div class="mt-3">
            <div class="font-mono text-2xl font-bold text-neutral-900 dark:text-white">
              {{ occupancyData?.totalUnits ?? 0 }}
            </div>
            <div class="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              {{ t('reports.total_units_desc') }}
            </div>
          </div>
        </div>

        <div
          class="shadow-xs flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div class="flex items-center justify-between">
            <span
              class="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
              >{{ t('reports.occupancy_rate') }}</span
            >
            <CheckCircle2 :size="16" class="text-emerald-500" />
          </div>
          <div class="mt-3">
            <div class="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {{ occupancyData?.occupancyRate ?? 0 }}%
            </div>
            <div class="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400">
              {{ occupancyData?.occupiedUnits ?? 0 }} {{ t('reports.units_leased') }}
            </div>
          </div>
        </div>

        <div
          class="shadow-xs flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div class="flex items-center justify-between">
            <span
              class="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
              >{{ t('reports.vacant_units') }}</span
            >
            <Layers :size="16" class="text-sky-500" />
          </div>
          <div class="mt-3">
            <div class="font-mono text-2xl font-bold text-sky-600 dark:text-sky-400">
              {{ occupancyData?.availableUnits ?? 0 }}
            </div>
            <div class="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              {{ t('reports.available_lease') }}
            </div>
          </div>
        </div>

        <div
          class="shadow-xs flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div class="flex items-center justify-between">
            <span
              class="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
              >{{ t('reports.maintenance_units') }}</span
            >
            <AlertTriangle :size="16" class="text-amber-500" />
          </div>
          <div class="mt-3">
            <div class="font-mono text-2xl font-bold text-amber-600 dark:text-amber-400">
              {{ (occupancyData?.maintenanceUnits ?? 0) + (occupancyData?.reservedUnits ?? 0) }}
            </div>
            <div class="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              {{ occupancyData?.maintenanceUnits ?? 0 }} {{ t('reports.offline_units') }}
            </div>
          </div>
        </div>
      </div>

      <!-- Unit Distribution Breakdown Bar -->
      <div
        v-if="occupancyData && occupancyData.totalUnits > 0"
        class="shadow-xs space-y-4 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold text-neutral-900 dark:text-white">
            {{ t('reports.unit_allocation_breakdown') }}
          </h3>
          <span
            class="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
            >{{ t('reports.total_units_badge', { count: occupancyData.totalUnits }) }}</span
          >
        </div>

        <!-- Multi-segment progress bar -->
        <div class="flex h-3 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
          <div
            class="bg-emerald-500 transition-all duration-300"
            :style="{ width: `${(occupancyData.occupiedUnits / occupancyData.totalUnits) * 100}%` }"
            :title="`${t('reports.col_occupied')}: ${occupancyData.occupiedUnits}`"
          ></div>
          <div
            class="bg-purple-500 transition-all duration-300"
            :style="{ width: `${(occupancyData.reservedUnits / occupancyData.totalUnits) * 100}%` }"
            :title="`${t('common.reserved')}: ${occupancyData.reservedUnits}`"
          ></div>
          <div
            class="bg-amber-500 transition-all duration-300"
            :style="{
              width: `${(occupancyData.maintenanceUnits / occupancyData.totalUnits) * 100}%`,
            }"
            :title="`${t('reports.col_maintenance')}: ${occupancyData.maintenanceUnits}`"
          ></div>
          <div
            class="bg-sky-500 transition-all duration-300"
            :style="{
              width: `${(occupancyData.availableUnits / occupancyData.totalUnits) * 100}%`,
            }"
            :title="`${t('reports.col_available')}: ${occupancyData.availableUnits}`"
          ></div>
        </div>

        <!-- Legend -->
        <div
          class="flex flex-wrap items-center gap-4 text-xs text-neutral-600 dark:text-neutral-400"
        >
          <div class="flex items-center gap-1.5">
            <span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            <span>{{ t('reports.occupied_legend', { count: occupancyData.occupiedUnits }) }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="h-2.5 w-2.5 rounded-full bg-purple-500"></span>
            <span>{{ t('reports.reserved_legend', { count: occupancyData.reservedUnits }) }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
            <span>{{
              t('reports.maintenance_legend', { count: occupancyData.maintenanceUnits })
            }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="h-2.5 w-2.5 rounded-full bg-sky-500"></span>
            <span>{{
              t('reports.available_legend', { count: occupancyData.availableUnits })
            }}</span>
          </div>
        </div>
      </div>

      <!-- Property Breakdown Table -->
      <div
        class="shadow-xs overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div
          class="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800"
        >
          <h3 class="text-base font-semibold text-neutral-900 dark:text-white">
            {{ t('reports.property_breakdown') }}
          </h3>
          <span class="text-xs text-neutral-500 dark:text-neutral-400">{{
            t('reports.properties_count', {
              count: occupancyData?.propertyBreakdown?.length || 0,
            })
          }}</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-neutral-700 dark:text-neutral-200">
            <thead
              class="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-400"
            >
              <tr>
                <th class="px-4 py-3">{{ t('reports.col_property') }}</th>
                <th class="px-4 py-3">{{ t('reports.col_location') }}</th>
                <th class="px-4 py-3">{{ t('reports.col_units') }}</th>
                <th class="px-4 py-3">{{ t('reports.col_occupied') }}</th>
                <th class="px-4 py-3">{{ t('reports.col_available') }}</th>
                <th class="px-4 py-3">{{ t('reports.col_maintenance') }}</th>
                <th class="px-4 py-3">{{ t('reports.col_occupancy') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
              <tr v-if="isLoading">
                <td colspan="7" class="px-4 py-8 text-center text-sm text-neutral-500">
                  {{ t('reports.loading_properties') }}
                </td>
              </tr>
              <tr v-else-if="!occupancyData?.propertyBreakdown?.length">
                <td colspan="7" class="px-4 py-8 text-center text-sm text-neutral-500">
                  {{ t('reports.no_properties') }}
                </td>
              </tr>
              <tr
                v-for="prop in occupancyData?.propertyBreakdown"
                :key="prop.propertyId"
                class="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
              >
                <td class="px-4 py-3.5 font-medium text-neutral-900 dark:text-white">
                  {{ prop.title }}
                </td>
                <td class="px-4 py-3.5 text-xs text-neutral-500 dark:text-neutral-400">
                  {{ prop.city }}, {{ prop.state }}
                </td>
                <td class="px-4 py-3.5 font-mono">{{ prop.totalUnits }}</td>
                <td
                  class="px-4 py-3.5 font-mono font-medium text-emerald-600 dark:text-emerald-400"
                >
                  {{ prop.occupiedUnits }}
                </td>
                <td class="px-4 py-3.5 font-mono text-sky-600 dark:text-sky-400">
                  {{ prop.availableUnits }}
                </td>
                <td
                  :class="[
                    'px-4 py-3.5 font-mono',
                    prop.maintenanceUnits > 0
                      ? 'font-medium text-amber-600 dark:text-amber-400'
                      : 'text-neutral-500',
                  ]"
                >
                  {{ prop.maintenanceUnits }}
                </td>
                <td class="px-4 py-3.5">
                  <div class="flex items-center gap-2">
                    <div
                      class="h-2 w-20 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800"
                    >
                      <div
                        class="h-full rounded-full bg-emerald-500"
                        :style="{ width: `${prop.occupancyRate}%` }"
                      ></div>
                    </div>
                    <span class="font-mono text-xs font-medium text-neutral-900 dark:text-white"
                      >{{ prop.occupancyRate }}%</span
                    >
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 2: FINANCIAL ANALYTICS -->
    <div v-else class="space-y-6">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          class="shadow-xs flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div class="flex items-center justify-between">
            <span
              class="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
              >{{ t('reports.total_billed') }}</span
            >
            <CreditCard :size="16" class="text-neutral-400" />
          </div>
          <div class="mt-3">
            <div class="font-mono text-2xl font-bold text-neutral-900 dark:text-white">
              {{ financialData?.totalInvoiced ?? '$0.00' }}
            </div>
            <div class="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              {{ t('invoices.lifetime_billing') }}
            </div>
          </div>
        </div>

        <div
          class="shadow-xs flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div class="flex items-center justify-between">
            <span
              class="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
              >{{ t('reports.total_received') }}</span
            >
            <CheckCircle2 :size="16" class="text-emerald-500" />
          </div>
          <div class="mt-3">
            <div class="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {{ financialData?.totalCollected ?? '$0.00' }}
            </div>
            <div class="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400">
              {{ financialData?.collectionRate ?? 0 }}% {{ t('reports.collection_rate') }}
            </div>
          </div>
        </div>

        <div
          class="shadow-xs flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div class="flex items-center justify-between">
            <span
              class="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
              >{{ t('reports.outstanding_balance') }}</span
            >
            <Clock :size="16" class="text-amber-500" />
          </div>
          <div class="mt-3">
            <div class="font-mono text-2xl font-bold text-amber-600 dark:text-amber-400">
              {{ financialData?.outstandingBalance ?? '$0.00' }}
            </div>
            <div class="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              {{ t('invoices.unsettled_balance') }}
            </div>
          </div>
        </div>

        <div
          class="shadow-xs flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div class="flex items-center justify-between">
            <span
              class="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
              >{{ t('invoices.overdue_invoices') }}</span
            >
            <AlertTriangle :size="16" class="text-rose-500" />
          </div>
          <div class="mt-3">
            <div class="font-mono text-2xl font-bold text-rose-600 dark:text-rose-400">
              {{ financialData?.overdueTotal ?? '$0.00' }}
            </div>
            <div class="mt-0.5 text-xs text-rose-600 dark:text-rose-400">
              {{ t('invoices.requiring_attention') }}
            </div>
          </div>
        </div>
      </div>

      <!-- Collection Performance Card -->
      <div
        v-if="financialData"
        class="shadow-xs space-y-4 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold text-neutral-900 dark:text-white">
            {{ t('reports.financial_summary') }}
          </h3>
          <span
            class="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
            >{{ financialData.collectionRate }}% {{ t('invoices.status.paid') }}</span
          >
        </div>

        <div class="space-y-4">
          <div class="h-3 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
            <div
              class="h-full rounded-full bg-emerald-500 transition-all duration-300"
              :style="{ width: `${financialData.collectionRate}%` }"
            ></div>
          </div>
          <div
            class="grid grid-cols-1 gap-4 border-t border-neutral-200 pt-4 dark:border-neutral-800 sm:grid-cols-3"
          >
            <div>
              <span
                class="block text-[10px] font-semibold uppercase text-neutral-500 dark:text-neutral-400"
                >{{ t('reports.collected') }}</span
              >
              <span class="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400">{{
                financialData.totalCollected
              }}</span>
            </div>
            <div>
              <span
                class="block text-[10px] font-semibold uppercase text-neutral-500 dark:text-neutral-400"
                >{{ t('reports.outstanding_arrears') }}</span
              >
              <span class="font-mono text-lg font-bold text-amber-600 dark:text-amber-400">{{
                financialData.outstandingBalance
              }}</span>
            </div>
            <div>
              <span
                class="block text-[10px] font-semibold uppercase text-neutral-500 dark:text-neutral-400"
                >{{ t('reports.total_invoiced') }}</span
              >
              <span class="font-mono text-lg font-bold text-neutral-900 dark:text-white">{{
                financialData.totalInvoiced
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Operational Insights Grid -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div
          class="shadow-xs flex items-start gap-4 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
          >
            <CreditCard :size="20" />
          </div>
          <div class="flex-1 space-y-1.5">
            <h4 class="text-sm font-semibold text-neutral-900 dark:text-white">
              {{ t('reports.rent_reconciliations') }}
            </h4>
            <p class="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
              {{ t('reports.rent_reconciliations_desc') }}
            </p>
            <NuxtLink
              to="/dashboard/invoices"
              class="inline-flex items-center gap-1 pt-1 text-xs font-semibold text-primary-600 hover:underline dark:text-primary-400"
            >
              <span>{{ t('reports.view_invoices') }}</span>
              <ArrowUpRight :size="13" />
            </NuxtLink>
          </div>
        </div>

        <div
          class="shadow-xs flex items-start gap-4 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
          >
            <CheckCircle2 :size="20" />
          </div>
          <div class="flex-1 space-y-1.5">
            <h4 class="text-sm font-semibold text-neutral-900 dark:text-white">
              {{ t('reports.auto_invoicing') }}
            </h4>
            <p class="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
              {{ t('reports.auto_invoicing_desc') }}
            </p>
            <NuxtLink
              to="/dashboard/leases"
              class="inline-flex items-center gap-1 pt-1 text-xs font-semibold text-primary-600 hover:underline dark:text-primary-400"
            >
              <span>{{ t('reports.view_active_leases') }}</span>
              <ArrowUpRight :size="13" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
