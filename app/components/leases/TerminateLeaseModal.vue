<script setup lang="ts">
import { AlertTriangle } from '@lucide/vue';
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
    :icon="AlertTriangle"
    size="md"
    @close="emit('close')"
  >
    <div v-if="lease" class="space-y-3">
      <div
        class="flex items-start gap-3 rounded-lg border border-amber-100 bg-amber-50/60 p-3.5 dark:border-amber-900/30 dark:bg-amber-950/20"
      >
        <AlertTriangle :size="18" class="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div class="space-y-1 text-xs">
          <p class="font-semibold text-neutral-900 dark:text-neutral-100">
            {{
              t('leases.terminate_confirm_question', {
                unit: lease.unit?.unitNumber || '',
              })
            }}
          </p>
          <p class="text-neutral-600 dark:text-neutral-400">
            {{ t('leases.terminate_status_note') }}
          </p>
        </div>
      </div>
    </div>

    <template #footer>
      <div v-if="lease" class="flex items-center justify-end gap-2.5">
        <button
          type="button"
          @click="emit('close')"
          class="btn-secondary"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          type="button"
          @click="handleConfirm"
          :disabled="isTerminating"
          class="btn-danger"
        >
          <AlertTriangle :size="14" />
          <span>{{
            isTerminating ? t('leases.terminating_btn') : t('leases.confirm_termination_btn')
          }}</span>
        </button>
      </div>
    </template>
  </AppModal>
</template>
