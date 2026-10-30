<script setup lang="ts">
import { CreditCard, CheckCircle2, Clock, AlertTriangle, ArrowUpRight } from '@lucide/vue';

interface FinancialData {
  totalInvoiced: string;
  totalCollected: string;
  collectionRate: number;
  outstandingBalance: string;
  overdueTotal: string;
  overdueInvoicesCount?: number;
  activeLeasesCount?: number;
  monthlyAverageRevenue?: string;
  recentInvoices?: any[];
}

interface Props {
  financialData: FinancialData | null;
}

defineProps<Props>();

const { t } = useI18n();
</script>

<template>
  <div class="space-y-6">
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
</template>
