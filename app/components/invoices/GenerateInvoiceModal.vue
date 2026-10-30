<script setup lang="ts">
import { ref } from 'vue';
import { Plus } from '@lucide/vue';
import AppModal from '../common/AppModal.vue';

export interface GenerateInvoiceFormData {
  leaseId: string;
  dueDate: string;
  amountDue: number;
  notes?: string;
}

interface Props {
  isOpen: boolean;
  isGenerating?: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', form: GenerateInvoiceFormData): void;
}>();

const { t } = useI18n();

const form = ref<GenerateInvoiceFormData>({
  leaseId: '',
  dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  amountDue: 1200,
  notes: '',
});

function handleSubmit() {
  emit('submit', { ...form.value });
}
</script>

<template>
  <AppModal
    :is-open="isOpen"
    :title="t('invoices.generate_modal_title')"
    size="md"
    @close="emit('close')"
  >
    <form id="generate-invoice-form" @submit.prevent="handleSubmit" class="space-y-4">
      <div class="space-y-2">
        <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
          {{ t('invoices.active_lease_select_label') }} *
        </label>
        <input
          v-model="form.leaseId"
          type="text"
          required
          class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          placeholder="e.g. lease-skyline-101a"
        />
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
            {{ t('invoices.due_date') }} *
          </label>
          <input
            v-model="form.dueDate"
            type="date"
            required
            class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
        </div>
        <div class="space-y-2">
          <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
            {{ t('invoices.amount_due_label') }} *
          </label>
          <input
            v-model.number="form.amountDue"
            type="number"
            min="1"
            step="0.01"
            required
            class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
        </div>
      </div>

      <div class="space-y-2">
        <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
          {{ t('invoices.invoice_memo_label') }}
        </label>
        <input
          v-model="form.notes"
          type="text"
          class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          :placeholder="t('invoices.invoice_memo_placeholder')"
        />
      </div>
    </form>

    <template #footer>
      <div class="flex items-center justify-end gap-2.5">
        <button
          type="button"
          @click="emit('close')"
          class="btn-secondary"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          type="submit"
          form="generate-invoice-form"
          :disabled="isGenerating"
          class="btn-primary"
        >
          <Plus :size="14" />
          <span>{{
            isGenerating ? t('invoices.generating_btn') : t('invoices.create_invoice_btn')
          }}</span>
        </button>
      </div>
    </template>
  </AppModal>
</template>
