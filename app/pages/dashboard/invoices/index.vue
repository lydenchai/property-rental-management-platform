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
import type { InvoiceItem } from '~~/shared/types';
import AppTableCard from '../../../components/common/AppTableCard.vue';

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
const generateForm = ref({
  leaseId: 'lease-skyline-101a',
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  amountDue: 1650,
  notes: 'Monthly Residential Rent',
});

// Pay / Record Payment Modal
const invoiceToPay = ref<InvoiceItem | null>(null);
const paymentForm = ref({
  amount: 0,
  method: 'BANK_TRANSFER',
  referenceNumber: '',
  notes: '',
});

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

watch([activeTab, searchQuery], () => {
  currentPage.value = 1;
});

async function executeGenerateInvoice() {
  const res = (await generateInvoice({
    ...generateForm.value,
    dueDate: generateForm.value.dueDate!,
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
  const remaining = Math.max(0, Number(inv.amountDue) - Number(inv.amountPaid));
  paymentForm.value = {
    amount: remaining,
    method: isTenant.value ? 'CREDIT_CARD' : 'BANK_TRANSFER',
    referenceNumber: '',
    notes: '',
  };
}

async function executeRecordPayment() {
  if (!invoiceToPay.value) return;
  const res = (await recordPayment({
    invoiceId: invoiceToPay.value.id,
    amount: Number(paymentForm.value.amount),
    method: paymentForm.value.method,
    referenceNumber: paymentForm.value.referenceNumber || undefined,
    notes: paymentForm.value.notes || undefined,
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

function printReceipt() {
  window.print();
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
            ${{ totalOutstanding.toLocaleString() }}
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
            ${{ totalCollected.toLocaleString() }}
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
            ${{ totalInvoiced.toLocaleString() }}
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

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-neutral-700 dark:text-neutral-200">
          <thead
            class="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-400"
          >
            <tr>
              <th class="px-4 py-3">{{ t('invoices.col_invoice_num') }}</th>
              <th class="px-4 py-3">{{ t('invoices.col_property_unit') }}</th>
              <th class="px-4 py-3">{{ t('invoices.col_tenant') }}</th>
              <th class="px-4 py-3">{{ t('invoices.col_due_date') }}</th>
              <th class="px-4 py-3">{{ t('invoices.col_amount') }}</th>
              <th class="px-4 py-3">{{ t('invoices.col_paid') }}</th>
              <th class="px-4 py-3">{{ t('invoices.col_status') }}</th>
              <th class="px-4 py-3 text-right">{{ t('invoices.col_actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
            <tr
              v-for="inv in paginatedInvoices"
              :key="inv.id"
              class="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
            >
              <td class="px-4 py-3.5">
                <div class="flex flex-col">
                  <span class="font-mono font-semibold text-neutral-900 dark:text-white">{{
                    inv.invoiceNumber
                  }}</span>
                  <span class="text-xs text-neutral-500 dark:text-neutral-400"
                    >{{ t('common.created_at') }}:
                    {{ new Date(inv.issueDate).toLocaleDateString() }}</span
                  >
                </div>
              </td>
              <td class="px-4 py-3.5">
                <div class="flex flex-col">
                  <span class="font-semibold text-neutral-900 dark:text-white"
                    >{{ t('dashboard.metrics.unit') }}
                    {{ inv.lease?.unit?.unitNumber || '101A' }}</span
                  >
                  <span class="text-xs text-neutral-500 dark:text-neutral-400">{{
                    inv.lease?.unit?.property?.title || 'Skyline Heights'
                  }}</span>
                </div>
              </td>
              <td class="px-4 py-3.5">
                <div class="flex flex-col text-xs">
                  <span class="font-medium text-neutral-900 dark:text-white">{{
                    inv.tenant?.fullName || 'Sarah Jenkins'
                  }}</span>
                  <span class="text-neutral-500 dark:text-neutral-400">{{
                    inv.tenant?.email || 'tenant@example.com'
                  }}</span>
                </div>
              </td>
              <td class="px-4 py-3.5">
                <div
                  class="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300"
                >
                  <Calendar :size="14" class="shrink-0 text-neutral-400" />
                  <span>{{ new Date(inv.dueDate).toLocaleDateString() }}</span>
                </div>
              </td>
              <td class="px-4 py-3.5 font-mono font-semibold text-neutral-900 dark:text-white">
                ${{ inv.amountDue.toLocaleString() }}
              </td>
              <td class="px-4 py-3.5">
                <div class="flex flex-col font-mono text-xs">
                  <span class="font-semibold text-neutral-900 dark:text-white"
                    >${{ inv.amountPaid.toLocaleString() }}</span
                  >
                  <span
                    v-if="inv.amountDue > inv.amountPaid"
                    class="text-neutral-500 dark:text-neutral-400"
                  >
                    (${{ (inv.amountDue - inv.amountPaid).toLocaleString() }} left)
                  </span>
                </div>
              </td>
              <td class="px-4 py-3.5">
                <span
                  :class="[
                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                    inv.status === 'PAID'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                      : inv.status === 'PARTIALLY_PAID'
                        ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                        : inv.status === 'OVERDUE'
                          ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-400'
                          : 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-400',
                  ]"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
                  <span>{{
                    inv.status === 'PAID'
                      ? t('invoices.status.paid')
                      : inv.status === 'PARTIALLY_PAID'
                        ? t('invoices.status.partially_paid')
                        : inv.status === 'UNPAID'
                          ? t('invoices.status.unpaid')
                          : inv.status === 'OVERDUE'
                            ? t('invoices.status.overdue')
                            : inv.status
                  }}</span>
                </span>
              </td>
              <td class="px-4 py-3.5 text-right">
                <div class="inline-flex items-center justify-end gap-1.5">
                  <button
                    v-if="inv.status !== 'PAID' && inv.status !== 'CANCELLED'"
                    @click="openPayModal(inv)"
                    class="shadow-xs inline-flex cursor-pointer items-center gap-1 rounded-lg bg-primary-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-primary-700"
                  >
                    <CreditCard :size="13" />
                    <span>{{
                      isTenant ? t('invoices.pay_now') : t('invoices.record_payment')
                    }}</span>
                  </button>

                  <button
                    v-if="inv.payments && inv.payments.length > 0"
                    @click="viewReceipt(inv.payments[0]!.id)"
                    class="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-neutral-300 px-2.5 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                    :title="t('invoices.view_receipt')"
                  >
                    <Receipt :size="13" />
                    <span>{{ t('invoices.view_receipt') }}</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </AppTableCard>

    <!-- Generate Invoice Modal -->
    <Teleport to="body">
      <div
        v-if="isGenerateModalOpen"
        class="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      >
        <div
          class="w-full max-w-lg overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800"
          >
            <h3 class="text-base font-semibold text-neutral-900 dark:text-white">
              {{ t('invoices.generate_modal_title') }}
            </h3>
            <button
              type="button"
              @click="isGenerateModalOpen = false"
              class="cursor-pointer text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X :size="18" />
            </button>
          </div>

          <form @submit.prevent="executeGenerateInvoice" class="space-y-4 p-6">
            <div class="space-y-1.5">
              <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                {{ t('invoices.active_lease_select_label') }} *
              </label>
              <input
                v-model="generateForm.leaseId"
                type="text"
                required
                class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                placeholder="e.g. lease-skyline-101a"
              />
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="space-y-1.5">
                <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {{ t('invoices.due_date') }} *
                </label>
                <input
                  v-model="generateForm.dueDate"
                  type="date"
                  required
                  class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
              <div class="space-y-1.5">
                <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {{ t('invoices.amount_due_label') }} *
                </label>
                <input
                  v-model.number="generateForm.amountDue"
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                {{ t('invoices.invoice_memo_label') }}
              </label>
              <input
                v-model="generateForm.notes"
                type="text"
                class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                :placeholder="t('invoices.invoice_memo_placeholder')"
              />
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                @click="isGenerateModalOpen = false"
                class="cursor-pointer rounded-lg border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                type="submit"
                :disabled="isGenerating"
                class="shadow-xs inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
              >
                <Plus :size="14" />
                <span>{{
                  isGenerating ? t('invoices.generating_btn') : t('invoices.create_invoice_btn')
                }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Record / Pay Modal -->
    <Teleport to="body">
      <div
        v-if="invoiceToPay"
        class="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      >
        <div
          class="w-full max-w-lg overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800"
          >
            <h3 class="text-base font-semibold text-neutral-900 dark:text-white">
              {{ isTenant ? t('invoices.pay_rent_invoice_title') : t('invoices.record_payment') }}
            </h3>
            <button
              type="button"
              @click="invoiceToPay = null"
              class="cursor-pointer text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X :size="18" />
            </button>
          </div>

          <form @submit.prevent="executeRecordPayment" class="space-y-4 p-6">
            <div
              class="space-y-1.5 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-300"
            >
              <div>
                <strong class="text-neutral-900 dark:text-white"
                  >{{ t('invoices.invoice_num_label') }}:</strong
                >
                {{ invoiceToPay.invoiceNumber }}
              </div>
              <div>
                <strong class="text-neutral-900 dark:text-white"
                  >{{ t('invoices.total_due_label') }}:</strong
                >
                ${{ invoiceToPay.amountDue.toLocaleString() }}
              </div>
              <div>
                <strong class="text-neutral-900 dark:text-white"
                  >{{ t('invoices.already_paid_label') }}:</strong
                >
                ${{ invoiceToPay.amountPaid.toLocaleString() }}
              </div>
              <div>
                <strong class="text-neutral-900 dark:text-white"
                  >{{ t('invoices.remaining_balance_label') }}:</strong
                >
                ${{ (invoiceToPay.amountDue - invoiceToPay.amountPaid).toLocaleString() }}
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="space-y-1.5">
                <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {{ t('invoices.amount_to_pay') }} *
                </label>
                <input
                  v-model.number="paymentForm.amount"
                  type="number"
                  min="1"
                  :max="invoiceToPay.amountDue - invoiceToPay.amountPaid"
                  step="0.01"
                  required
                  class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div class="space-y-1.5">
                <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {{ t('invoices.payment_method') }} *
                </label>
                <select
                  v-model="paymentForm.method"
                  required
                  class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                >
                  <option value="BANK_TRANSFER">{{ t('invoices.payment_method_bank') }}</option>
                  <option value="CREDIT_CARD">{{ t('invoices.payment_method_card') }}</option>
                  <option value="STRIPE_MOCK">{{ t('invoices.payment_method_stripe') }}</option>
                  <option v-if="isLandlord || isAdmin" value="CASH">
                    {{ t('invoices.payment_method_cash') }}
                  </option>
                  <option v-if="isLandlord || isAdmin" value="CHECK">
                    {{ t('invoices.payment_method_check') }}
                  </option>
                </select>
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                {{ t('invoices.reference_number') }}
              </label>
              <input
                v-model="paymentForm.referenceNumber"
                type="text"
                class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                :placeholder="t('invoices.ref_code_placeholder')"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                {{ t('invoices.payment_notes') }}
              </label>
              <input
                v-model="paymentForm.notes"
                type="text"
                class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                :placeholder="t('invoices.payment_notes')"
              />
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                @click="invoiceToPay = null"
                class="cursor-pointer rounded-lg border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                type="submit"
                :disabled="isPaying"
                class="shadow-xs inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
              >
                <DollarSign :size="14" />
                <span>{{
                  isPaying ? t('invoices.processing_btn') : t('invoices.confirm_payment')
                }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Official Printable Digital Receipt Modal -->
    <Teleport to="body">
      <div
        v-if="receiptData"
        class="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 print:static print:bg-transparent print:p-0"
      >
        <div
          class="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900 print:max-w-full print:border-none print:p-0 print:shadow-none"
        >
          <div
            class="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800 print:hidden"
          >
            <h3 class="text-base font-semibold text-neutral-900 dark:text-white">
              {{ t('invoices.receipt_header_title') }}
            </h3>
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="printReceipt"
                class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
              >
                <Printer :size="14" />
                <span>{{ t('invoices.print_btn') }}</span>
              </button>
              <button
                type="button"
                @click="receiptData = null"
                class="cursor-pointer text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X :size="18" />
              </button>
            </div>
          </div>

          <div class="space-y-5 p-6 print:p-0">
            <div class="flex items-start justify-between">
              <div>
                <div class="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  Rent<span class="text-primary-600">Ease</span>
                </div>
                <div class="text-xs text-neutral-500 dark:text-neutral-400">
                  Property Rental Management System
                </div>
              </div>
              <div
                class="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
              >
                <CheckCircle2 :size="14" />
                <span>CONFIRMED RECEIPT</span>
              </div>
            </div>

            <hr class="border-neutral-200 dark:border-neutral-800" />

            <div class="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
              <div>
                <span
                  class="block text-[10px] font-semibold uppercase text-neutral-500 dark:text-neutral-400"
                  >Receipt Number</span
                >
                <strong class="font-mono text-sm text-neutral-900 dark:text-white">{{
                  receiptData.receiptNumber
                }}</strong>
              </div>
              <div>
                <span
                  class="block text-[10px] font-semibold uppercase text-neutral-500 dark:text-neutral-400"
                  >Payment Date</span
                >
                <span class="text-neutral-800 dark:text-neutral-200">{{
                  new Date(receiptData.paidAt).toLocaleString()
                }}</span>
              </div>
              <div>
                <span
                  class="block text-[10px] font-semibold uppercase text-neutral-500 dark:text-neutral-400"
                  >Payment Method</span
                >
                <span class="text-neutral-800 dark:text-neutral-200">{{
                  receiptData.method.replace('_', ' ')
                }}</span>
              </div>
              <div>
                <span
                  class="block text-[10px] font-semibold uppercase text-neutral-500 dark:text-neutral-400"
                  >Reference Number</span
                >
                <span class="font-mono text-neutral-800 dark:text-neutral-200">{{
                  receiptData.referenceNumber || 'N/A'
                }}</span>
              </div>
            </div>

            <div
              class="grid grid-cols-1 gap-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-xs dark:border-neutral-800 dark:bg-neutral-800/40 sm:grid-cols-2"
            >
              <div class="space-y-0.5">
                <span
                  class="block text-[10px] font-semibold uppercase text-neutral-500 dark:text-neutral-400"
                  >Tenant</span
                >
                <strong class="block text-neutral-900 dark:text-white">{{
                  receiptData.tenant?.fullName
                }}</strong>
                <span class="text-neutral-500 dark:text-neutral-400">{{
                  receiptData.tenant?.email
                }}</span>
              </div>
              <div class="space-y-0.5">
                <span
                  class="block text-[10px] font-semibold uppercase text-neutral-500 dark:text-neutral-400"
                  >Property & Unit</span
                >
                <strong class="block text-neutral-900 dark:text-white"
                  >{{ receiptData.property?.title }} — Unit
                  {{ receiptData.property?.unitNumber }}</strong
                >
                <span class="text-neutral-500 dark:text-neutral-400">{{
                  receiptData.property?.address
                }}</span>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs text-neutral-700 dark:text-neutral-300">
                <thead>
                  <tr
                    class="border-b border-neutral-200 text-[10px] font-semibold uppercase text-neutral-500 dark:border-neutral-800 dark:text-neutral-400"
                  >
                    <th class="py-2">Description</th>
                    <th class="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
                  <tr>
                    <td class="py-3">
                      <span class="font-medium text-neutral-900 dark:text-white"
                        >Invoice {{ receiptData.invoice?.invoiceNumber }}</span
                      >
                      <span class="mt-0.5 block text-neutral-500 dark:text-neutral-400"
                        >Due:
                        {{ new Date(receiptData.invoice?.dueDate).toLocaleDateString() }}</span
                      >
                    </td>
                    <td
                      class="py-3 text-right font-mono font-semibold text-neutral-900 dark:text-white"
                    >
                      ${{ Number(receiptData.amount).toFixed(2) }}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="border-t border-neutral-200 dark:border-neutral-800">
                    <td class="py-2.5 font-semibold text-neutral-900 dark:text-white">
                      Total Paid
                    </td>
                    <td
                      class="py-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400"
                    >
                      ${{ Number(receiptData.amount).toFixed(2) }}
                    </td>
                  </tr>
                  <tr>
                    <td class="py-1 text-neutral-500 dark:text-neutral-400">
                      Remaining Invoice Balance
                    </td>
                    <td class="py-1 text-right font-mono text-neutral-700 dark:text-neutral-300">
                      ${{ Number(receiptData.invoice?.remainingBalance || 0).toFixed(2) }}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div class="border-t border-neutral-200 pt-2 text-center dark:border-neutral-800">
              <span class="text-[11px] text-neutral-400 dark:text-neutral-500">
                This is a computer-generated digital receipt and official proof of payment recorded
                within the RentEase platform.
              </span>
            </div>
          </div>

          <div
            class="flex justify-end border-t border-neutral-200 px-6 py-4 dark:border-neutral-800 print:hidden"
          >
            <button
              @click="receiptData = null"
              class="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
