<script setup lang="ts">
import { ref, watch } from 'vue';
import { DollarSign } from '@lucide/vue';
import type { InvoiceItem } from '~~/shared/types';
import AppModal from '../common/AppModal.vue';

export interface PaymentFormData {
  amount: number;
  method: 'BANK_TRANSFER' | 'CREDIT_CARD' | 'STRIPE_MOCK' | 'CASH' | 'CHECK';
  referenceNumber?: string;
  notes?: string;
}

interface Props {
  invoice: InvoiceItem | null;
  isPaying?: boolean;
  isTenant?: boolean;
  isLandlord?: boolean;
  isAdmin?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', data: PaymentFormData): void;
}>();

const { t } = useI18n();

const form = ref<PaymentFormData>({
  amount: 0,
  method: 'BANK_TRANSFER',
  referenceNumber: '',
  notes: '',
});

watch(
  () => props.invoice,
  (inv) => {
    if (inv) {
      form.value.amount = inv.amountDue - inv.amountPaid;
      form.value.method = 'BANK_TRANSFER';
      form.value.referenceNumber = '';
      form.value.notes = '';
    }
  },
  { immediate: true }
);

function handleSubmit() {
  if (!props.invoice) return;
  emit('submit', { ...form.value });
}
</script>

<template>
  <AppModal
    :is-open="!!invoice"
    :title="isTenant ? t('invoices.pay_rent_invoice_title') : t('invoices.record_payment')"
    size="md"
    @close="emit('close')"
  >
    <form v-if="invoice" id="record-payment-form" @submit.prevent="handleSubmit" class="space-y-4">
      <div
        class="space-y-1.5 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-300"
      >
        <div>
          <strong class="text-neutral-900 dark:text-white"
            >{{ t('invoices.invoice_num_label') }}:</strong
          >
          {{ invoice.invoiceNumber }}
        </div>
        <div>
          <strong class="text-neutral-900 dark:text-white"
            >{{ t('invoices.total_due_label') }}:</strong
          >
          ${{ invoice.amountDue.toLocaleString() }}
        </div>
        <div>
          <strong class="text-neutral-900 dark:text-white"
            >{{ t('invoices.already_paid_label') }}:</strong
          >
          ${{ invoice.amountPaid.toLocaleString() }}
        </div>
        <div>
          <strong class="text-neutral-900 dark:text-white"
            >{{ t('invoices.remaining_balance_label') }}:</strong
          >
          ${{ (invoice.amountDue - invoice.amountPaid).toLocaleString() }}
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
            {{ t('invoices.amount_to_pay') }} *
          </label>
          <input
            v-model.number="form.amount"
            type="number"
            min="1"
            :max="invoice.amountDue - invoice.amountPaid"
            step="0.01"
            required
            class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
        </div>

        <div class="space-y-2">
          <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
            {{ t('invoices.payment_method') }} *
          </label>
          <select
            v-model="form.method"
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

      <div class="space-y-2">
        <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
          {{ t('invoices.reference_number') }}
        </label>
        <input
          v-model="form.referenceNumber"
          type="text"
          class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          :placeholder="t('invoices.ref_code_placeholder')"
        />
      </div>

      <div class="space-y-2">
        <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
          {{ t('invoices.payment_notes') }}
        </label>
        <input
          v-model="form.notes"
          type="text"
          class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          :placeholder="t('invoices.payment_notes')"
        />
      </div>
    </form>

    <template #footer>
      <div v-if="invoice" class="flex items-center justify-end gap-2.5">
        <button
          type="button"
          @click="emit('close')"
          class="btn-secondary"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          type="submit"
          form="record-payment-form"
          :disabled="isPaying"
          class="btn-primary"
        >
          <DollarSign :size="14" />
          <span>{{ isPaying ? t('invoices.processing_btn') : t('invoices.confirm_payment') }}</span>
        </button>
      </div>
    </template>
  </AppModal>
</template>
