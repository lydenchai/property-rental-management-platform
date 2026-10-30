<script setup lang="ts">
import type { LeaseItem } from '~~/shared/types';
import AppModal from '../common/AppModal.vue';

interface Props {
  lease: LeaseItem | null;
  isTerminating?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'confirm', leaseId: string): void;
}>();

const { t } = useI18n();

function handleConfirm() {
  if (!props.lease) return;
  emit('confirm', props.lease.id);
}
</script>

<template>
  <AppModal
    :is-open="!!lease"
    :title="t('leases.terminate_modal_title')"
    size="md"
    @close="emit('close')"
  >
    <div v-if="lease" class="space-y-4 p-6 text-sm text-neutral-700 dark:text-neutral-300">
      <p>
        {{
          t('leases.terminate_confirm_question', {
            unit: lease.unit?.unitNumber || '',
          })
        }}
      </p>
      <p class="text-xs text-neutral-500 dark:text-neutral-400">
        {{ t('leases.terminate_status_note') }}
      </p>
      <div class="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          @click="emit('close')"
          class="cursor-pointer rounded-lg border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          type="button"
          @click="handleConfirm"
          :disabled="isTerminating"
          class="shadow-xs cursor-pointer rounded-lg bg-rose-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
        >
          <span>{{
            isTerminating ? t('leases.terminating_btn') : t('leases.confirm_termination_btn')
          }}</span>
        </button>
      </div>
    </div>
  </AppModal>
</template>
