<script setup lang="ts">
import { Printer, CheckCircle2 } from '@lucide/vue';
import type { PaymentReceipt } from '~~/shared/types';
import AppModal from '../common/AppModal.vue';

interface Props {
  receipt: PaymentReceipt | null;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const { t } = useI18n();

function printReceipt() {
  if (typeof window !== 'undefined') {
    window.print();
  }
}
</script>

<template>
  <AppModal
    :is-open="!!receipt"
    :title="t('invoices.receipt_header_title')"
    size="xl"
    @close="emit('close')"
  >
    <template #header>
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
            @click="emit('close')"
            class="cursor-pointer rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <span class="sr-only">{{ t('common.cancel') }}</span>
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </template>

    <div v-if="receipt" class="space-y-5 p-6 print:p-0">
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
            receipt.receiptNumber
          }}</strong>
        </div>
        <div>
          <span
            class="block text-[10px] font-semibold uppercase text-neutral-500 dark:text-neutral-400"
            >Payment Date</span
          >
          <span class="text-neutral-800 dark:text-neutral-200">{{
            new Date(receipt.paidAt).toLocaleString()
          }}</span>
        </div>
        <div>
          <span
            class="block text-[10px] font-semibold uppercase text-neutral-500 dark:text-neutral-400"
            >Payment Method</span
          >
          <span class="text-neutral-800 dark:text-neutral-200">{{
            receipt.method.replace('_', ' ')
          }}</span>
        </div>
        <div>
          <span
            class="block text-[10px] font-semibold uppercase text-neutral-500 dark:text-neutral-400"
            >Reference Number</span
          >
          <span class="font-mono text-neutral-800 dark:text-neutral-200">{{
            receipt.referenceNumber || 'N/A'
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
            receipt.tenant?.fullName
          }}</strong>
          <span class="text-neutral-500 dark:text-neutral-400">{{ receipt.tenant?.email }}</span>
        </div>
        <div class="space-y-0.5">
          <span
            class="block text-[10px] font-semibold uppercase text-neutral-500 dark:text-neutral-400"
            >Property & Unit</span
          >
          <strong class="block text-neutral-900 dark:text-white"
            >{{ receipt.property?.title }} — Unit {{ receipt.property?.unitNumber }}</strong
          >
          <span class="text-neutral-500 dark:text-neutral-400">{{
            receipt.property?.address
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
                  >Invoice {{ receipt.invoice?.invoiceNumber }}</span
                >
                <span class="mt-0.5 block text-neutral-500 dark:text-neutral-400"
                  >Due: {{ new Date(receipt.invoice?.dueDate).toLocaleDateString() }}</span
                >
              </td>
              <td class="py-3 text-right font-mono font-semibold text-neutral-900 dark:text-white">
                ${{ Number(receipt.amount).toFixed(2) }}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="border-t border-neutral-200 dark:border-neutral-800">
              <td class="py-2.5 font-semibold text-neutral-900 dark:text-white">Total Paid</td>
              <td
                class="py-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400"
              >
                ${{ Number(receipt.amount).toFixed(2) }}
              </td>
            </tr>
            <tr>
              <td class="py-1 text-neutral-500 dark:text-neutral-400">Remaining Invoice Balance</td>
              <td class="py-1 text-right font-mono text-neutral-700 dark:text-neutral-300">
                ${{ Number(receipt.invoice?.remainingBalance || 0).toFixed(2) }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="border-t border-neutral-200 pt-2 text-center dark:border-neutral-800">
        <span class="text-[11px] text-neutral-400 dark:text-neutral-500">
          This is a computer-generated digital receipt and official proof of payment recorded within
          the RentEase platform.
        </span>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end print:hidden">
        <button
          type="button"
          @click="emit('close')"
          class="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
        >
          {{ t('common.cancel') }}
        </button>
      </div>
    </template>
  </AppModal>
</template>
