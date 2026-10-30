<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import {
  CreditCard,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Plus,
  Receipt,
  FileText,
  Printer,
  X,
} from '@lucide/vue';
import { useAuth } from '../../../composables/useAuth';
import { useInvoiceStore } from '../../../stores/invoice.store';
import type { InvoiceItem, TableColumn } from '~~/shared/types';
import AppTableCard from '../../../components/common/AppTableCard.vue';
import AppDataTable from '../../../components/common/AppDataTable.vue';
import GenerateInvoiceModal, {
  type GenerateInvoiceFormData,
} from '../../../components/invoices/GenerateInvoiceModal.vue';
import RecordPaymentModal, {
  type PaymentFormData,
} from '../../../components/invoices/RecordPaymentModal.vue';
import InvoiceReceiptModal from '../../../components/invoices/InvoiceReceiptModal.vue';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  title: 'Invoices & Billing',
});

const { t } = useI18n();
const { isLandlord, isTenant, isAdmin } = useAuth();
const invoiceStore = useInvoiceStore();

const {
  invoices,
  isLoading,
  isGenerating,
  isPaying,
  isLoadingReceipt,
  receiptData,
  errorMessage,
  totalInvoiced,
  totalCollected,
  totalOutstanding,
  overdueCount,
} = invoiceStore;

const { fetchInvoices, loadInvoices, generateInvoice, recordPayment, viewReceipt } = invoiceStore;

const successMessage = ref<string | null>(null);

// Filters
const activeTab = ref<'ALL' | 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE'>('ALL');
const searchQuery = ref('');

// Generate Invoice Modal
const isGenerateModalOpen = ref(false);

// Pay / Record Payment Modal
const invoiceToPay = ref<InvoiceItem | null>(null);

// Filtered invoices
const filteredInvoices = computed(() => {
  return invoices.value.filter((inv) => {
    if (activeTab.value !== 'ALL' && inv.status !== activeTab.value) {
      return false;
    }
    if (!searchQuery.value.trim()) return true;

    const q = searchQuery.value.toLowerCase();
    const invNum = inv.invoiceNumber.toLowerCase();
    const unit = inv.lease?.unit?.unitNumber?.toLowerCase() || '';
    const prop = inv.lease?.unit?.property?.title?.toLowerCase() || '';
    const tenant = inv.tenant?.fullName?.toLowerCase() || '';
    return invNum.includes(q) || unit.includes(q) || prop.includes(q) || tenant.includes(q);
  });
});

// Pagination state
const currentPage = ref(1);
const pageSize = ref(5);

const paginatedInvoices = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredInvoices.value.slice(start, start + pageSize.value);
});

const columns = computed<TableColumn[]>(() => [
  {
    key: 'invoiceNumber',
    label: t('invoices.col_invoice_num'),
    headerClass: 'whitespace-nowrap',
    class: 'whitespace-nowrap',
  },
  { key: 'propertyUnit', label: t('invoices.col_property_unit'), headerClass: 'whitespace-nowrap' },
  {
    key: 'tenant',
    label: t('invoices.col_tenant'),
    headerClass: 'whitespace-nowrap',
    class: 'whitespace-nowrap',
  },
  {
    key: 'dueDate',
    label: t('invoices.col_due_date'),
    headerClass: 'whitespace-nowrap',
    class: 'whitespace-nowrap',
  },
  {
    key: 'amountDue',
    label: t('invoices.col_amount'),
    headerClass: 'whitespace-nowrap',
    class: 'whitespace-nowrap',
  },
  {
    key: 'amountPaid',
    label: t('invoices.col_paid'),
    headerClass: 'whitespace-nowrap',
    class: 'whitespace-nowrap',
  },
  {
    key: 'status',
    label: t('invoices.col_status'),
    headerClass: 'whitespace-nowrap',
    class: 'whitespace-nowrap',
  },
  {
    key: 'actions',
    label: t('invoices.col_actions'),
    align: 'right',
    headerClass: 'whitespace-nowrap text-right',
    class: 'whitespace-nowrap text-right',
  },
]);

watch([activeTab, searchQuery], () => {
  currentPage.value = 1;
});

async function executeGenerateInvoice(formData: GenerateInvoiceFormData) {
  const res = (await generateInvoice({
    ...formData,
    dueDate: formData.dueDate,
  })) as any;

  if (res.success) {
    successMessage.value = res.message || 'Invoice generated successfully';
    isGenerateModalOpen.value = false;
    setTimeout(() => {
      successMessage.value = null;
    }, 4000);
  }
}

function openPayModal(inv: InvoiceItem) {
  invoiceToPay.value = inv;
}

async function executeRecordPayment(paymentData: PaymentFormData) {
  if (!invoiceToPay.value) return;
  const res = (await recordPayment({
    invoiceId: invoiceToPay.value.id,
    amount: Number(paymentData.amount),
    method: paymentData.method,
    referenceNumber: paymentData.referenceNumber || undefined,
    notes: paymentData.notes || undefined,
  })) as any;

  if (res.success) {
    successMessage.value = res.message || 'Payment recorded successfully';
    const paymentId = res.payment?.id;
    invoiceToPay.value = null;

    if (paymentId) {
      await viewReceipt(paymentId);
    }
    setTimeout(() => {
      successMessage.value = null;
    }, 4000);
  }
}

onMounted(async () => {
  try {
    await loadInvoices();
  } catch (err: any) {
    console.warn('Could not load invoices:', err);
  }
});
</script>

<template>
  <div class="space-y-6">
    <!-- Top Bar -->
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {{ t('invoices.title') }}
        </h1>
        <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {{ t('invoices.subtitle') }}
        </p>
      </div>
      <button
        v-if="isLandlord || isAdmin"
        @click="isGenerateModalOpen = true"
        class="shadow-xs inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
      >
        <Plus :size="16" />
        <span>{{ t('invoices.generate_invoice') }}</span>
      </button>
    </div>

    <!-- Alert Notifications -->
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

    <!-- Financial Stats Cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div
        class="shadow-xs flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div class="flex items-center justify-between">
          <span
            class="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
            >{{ t('invoices.total_outstanding') }}</span
          >
          <div
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
          >
            <Clock :size="16" />
          </div>
        </div>
        <div class="mt-3">
          <div class="font-mono text-2xl font-bold text-neutral-900 dark:text-white">
            ${{ (totalOutstanding ?? 0).toLocaleString() }}
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
            >{{ t('invoices.total_collected') }}</span
          >
          <div
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
          >
            <DollarSign :size="16" />
          </div>
        </div>
        <div class="mt-3">
          <div class="font-mono text-2xl font-bold text-neutral-900 dark:text-white">
            ${{ (totalCollected ?? 0).toLocaleString() }}
          </div>
          <div class="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            {{ t('invoices.verified_cleared') }}
          </div>
        </div>
      </div>

      <div
        class="shadow-xs flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div class="flex items-center justify-between">
          <span
            class="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
            >{{ t('invoices.total_invoiced') }}</span
          >
          <div
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
          >
            <CreditCard :size="16" />
          </div>
        </div>
        <div class="mt-3">
          <div class="font-mono text-2xl font-bold text-neutral-900 dark:text-white">
            ${{ (totalInvoiced ?? 0).toLocaleString() }}
          </div>
          <div class="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            {{ invoices.length }} {{ t('invoices.title') }}
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
          <div
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
          >
            <AlertTriangle :size="16" />
          </div>
        </div>
        <div class="mt-3">
          <div
            :class="[
              'font-mono text-2xl font-bold',
              overdueCount > 0
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-neutral-900 dark:text-white',
            ]"
          >
            {{ overdueCount }}
          </div>
          <div class="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            {{ t('invoices.requiring_attention') }}
          </div>
        </div>
      </div>
    </div>

    <!-- Invoices Table using shared AppTableCard -->
    <AppTableCard
      v-model:search="searchQuery"
      :search-placeholder="t('invoices.col_invoice_num')"
      :is-loading="isLoading"
      :is-empty="filteredInvoices.length === 0"
      :empty-title="t('invoices.no_invoices')"
      :empty-description="t('invoices.no_invoices_desc')"
      :empty-icon="FileText"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total-items="filteredInvoices.length"
      :item-name="t('common.records')"
    >
      <template #toolbar-start>
        <div class="inline-flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            @click="activeTab = 'ALL'"
            :class="[
              'inline-flex cursor-pointer items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
              activeTab === 'ALL'
                ? 'shadow-xs border-primary-600 bg-primary-600 font-semibold text-white'
                : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700',
            ]"
          >
            {{ t('invoices.filter_all') }}
          </button>
          <button
            type="button"
            @click="activeTab = 'UNPAID'"
            :class="[
              'inline-flex cursor-pointer items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
              activeTab === 'UNPAID'
                ? 'shadow-xs border-primary-600 bg-primary-600 font-semibold text-white'
                : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700',
            ]"
          >
            {{ t('invoices.filter_unpaid') }}
          </button>
          <button
            type="button"
            @click="activeTab = 'PARTIALLY_PAID'"
            :class="[
              'inline-flex cursor-pointer items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
              activeTab === 'PARTIALLY_PAID'
                ? 'shadow-xs border-primary-600 bg-primary-600 font-semibold text-white'
                : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700',
            ]"
          >
            {{ t('invoices.filter_partially_paid') }}
          </button>
          <button
            type="button"
            @click="activeTab = 'PAID'"
            :class="[
              'inline-flex cursor-pointer items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
              activeTab === 'PAID'
                ? 'shadow-xs border-primary-600 bg-primary-600 font-semibold text-white'
                : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700',
            ]"
          >
            {{ t('invoices.filter_paid') }}
          </button>
          <button
            type="button"
            @click="activeTab = 'OVERDUE'"
            :class="[
              'inline-flex cursor-pointer items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
              activeTab === 'OVERDUE'
                ? 'shadow-xs border-primary-600 bg-primary-600 font-semibold text-white'
                : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700',
            ]"
          >
            {{ t('invoices.filter_overdue') }}
          </button>
        </div>
      </template>

      <AppDataTable
        :columns="columns"
        :items="paginatedInvoices"
        :is-loading="isLoading"
        min-width="min-w-[1050px]"
      >
        <template #cell-invoiceNumber="slotProps">
          <div class="flex flex-col">
            <span class="font-mono font-semibold text-neutral-900 dark:text-white">{{
              slotProps?.item?.invoiceNumber || '—'
            }}</span>
            <span class="text-xs text-neutral-500 dark:text-neutral-400"
              >{{ t('common.created_at') }}:
              {{
                slotProps?.item?.issueDate
                  ? new Date(slotProps.item.issueDate).toLocaleDateString()
                  : '—'
              }}</span
            >
          </div>
        </template>

        <template #cell-propertyUnit="slotProps">
          <div class="flex flex-col">
            <span class="font-semibold text-neutral-900 dark:text-white"
              >{{ t('dashboard.metrics.unit') }}
              {{ slotProps?.item?.lease?.unit?.unitNumber || '101A' }}</span
            >
            <span class="text-xs text-neutral-500 dark:text-neutral-400">{{
              slotProps?.item?.lease?.unit?.property?.title || 'Skyline Heights'
            }}</span>
          </div>
        </template>

        <template #cell-tenant="slotProps">
          <div class="flex flex-col text-xs">
            <span class="font-medium text-neutral-900 dark:text-white">{{
              slotProps?.item?.tenant?.fullName || 'Sarah Jenkins'
            }}</span>
            <span class="text-neutral-500 dark:text-neutral-400">{{
              slotProps?.item?.tenant?.email || 'tenant@example.com'
            }}</span>
          </div>
        </template>

        <template #cell-dueDate="slotProps">
          <div class="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300">
            <Calendar :size="14" class="shrink-0 text-neutral-400" />
            <span>{{
              slotProps?.item?.dueDate ? new Date(slotProps.item.dueDate).toLocaleDateString() : '—'
            }}</span>
          </div>
        </template>

        <template #cell-amountDue="slotProps">
          <span class="font-mono font-semibold text-neutral-900 dark:text-white">
            ${{ slotProps?.item?.amountDue ? slotProps.item.amountDue.toLocaleString() : '0' }}
          </span>
        </template>

        <template #cell-amountPaid="slotProps">
          <div class="flex flex-col font-mono text-xs">
            <span class="font-semibold text-neutral-900 dark:text-white"
              >${{
                slotProps?.item?.amountPaid ? slotProps.item.amountPaid.toLocaleString() : '0'
              }}</span
            >
            <span
              v-if="(slotProps?.item?.amountDue ?? 0) > (slotProps?.item?.amountPaid ?? 0)"
              class="text-neutral-500 dark:text-neutral-400"
            >
              (${{
                (
                  (slotProps?.item?.amountDue ?? 0) - (slotProps?.item?.amountPaid ?? 0)
                ).toLocaleString()
              }}
              left)
            </span>
          </div>
        </template>

        <template #cell-status="slotProps">
          <span
            :class="[
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
              slotProps?.item?.status === 'PAID'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                : slotProps?.item?.status === 'PARTIALLY_PAID'
                  ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                  : slotProps?.item?.status === 'OVERDUE'
                    ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-400'
                    : 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-400',
            ]"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
            <span>{{
              slotProps?.item?.status === 'PAID'
                ? t('invoices.status.paid')
                : slotProps?.item?.status === 'PARTIALLY_PAID'
                  ? t('invoices.status.partially_paid')
                  : slotProps?.item?.status === 'UNPAID'
                    ? t('invoices.status.unpaid')
                    : slotProps?.item?.status === 'OVERDUE'
                      ? t('invoices.status.overdue')
                      : slotProps?.item?.status || '—'
            }}</span>
          </span>
        </template>

        <template #cell-actions="slotProps">
          <div class="inline-flex items-center justify-end gap-1.5 whitespace-nowrap">
            <button
              v-if="slotProps?.item?.status !== 'PAID' && slotProps?.item?.status !== 'CANCELLED'"
              @click="slotProps?.item && openPayModal(slotProps.item)"
              class="shadow-xs inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg bg-primary-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-primary-700"
            >
              <CreditCard :size="13" />
              <span>{{ isTenant ? t('invoices.pay_now') : t('invoices.record_payment') }}</span>
            </button>

            <button
              v-if="slotProps?.item?.payments && slotProps.item.payments.length > 0"
              @click="
                slotProps?.item?.payments?.[0]?.id && viewReceipt(slotProps.item.payments[0]!.id)
              "
              class="inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-neutral-300 bg-white px-3 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
              :title="t('invoices.view_receipt')"
            >
              <Receipt :size="13" />
              <span>{{ t('invoices.view_receipt') }}</span>
            </button>
          </div>
        </template>
      </AppDataTable>
    </AppTableCard>

    <!-- Generate Invoice Modal -->
    <GenerateInvoiceModal
      :is-open="isGenerateModalOpen"
      :is-generating="isGenerating"
      @close="isGenerateModalOpen = false"
      @submit="executeGenerateInvoice"
    />

    <!-- Record / Pay Modal -->
    <RecordPaymentModal
      :invoice="invoiceToPay"
      :is-paying="isPaying"
      :is-tenant="isTenant"
      :is-landlord="isLandlord"
      :is-admin="isAdmin"
      @close="invoiceToPay = null"
      @submit="executeRecordPayment"
    />

    <!-- Official Printable Digital Receipt Modal -->
    <InvoiceReceiptModal :receipt="receiptData" @close="receiptData = null" />
  </div>
</template>
