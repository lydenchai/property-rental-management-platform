<script setup lang="ts">
import { Key, CreditCard, AlertTriangle, RefreshCw, Download } from '@lucide/vue';
import { useAuth } from '../../../composables/useAuth';
import { useReportStore } from '../../../stores/report.store';
import OccupancyAnalyticsTab from '../../../components/reports/OccupancyAnalyticsTab.vue';
import FinancialAnalyticsTab from '../../../components/reports/FinancialAnalyticsTab.vue';

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

    <!-- Tab 1: Occupancy Analytics -->
    <OccupancyAnalyticsTab
      v-if="activeTab === 'occupancy'"
      :occupancy-data="occupancyData"
      :is-loading="isLoading"
    />

    <!-- Tab 2: Financial Analytics -->
    <FinancialAnalyticsTab v-else :financial-data="financialData" />
  </div>
</template>
