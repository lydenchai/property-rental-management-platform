<script setup lang="ts">
import { CheckCircle2 } from '@lucide/vue';
import type { MaintenanceItem } from '~~/shared/types';
import AppModal from '../common/AppModal.vue';

interface Props {
  ticket: MaintenanceItem | null;
  isConfirming?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'confirm', ticketId: string): void;
}>();

const { t } = useI18n();

function handleConfirm() {
  if (!props.ticket) return;
  emit('confirm', props.ticket.id);
}
</script>

<template>
  <AppModal
    :is-open="!!ticket"
    :title="t('maintenance.confirm_modal_title')"
    size="md"
    @close="emit('close')"
  >
    <div v-if="ticket" class="space-y-4 p-6">
      <div
        class="space-y-1.5 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-300"
      >
        <div>
          <strong class="text-neutral-900 dark:text-white"
            >{{ t('maintenance.issue_title') }}:</strong
          >
          {{ ticket.title }}
        </div>
        <div>
          <strong class="text-neutral-900 dark:text-white"
            >{{ t('maintenance.resolution_notes') }}:</strong
          >
          {{ ticket.resolutionNotes || 'Repairs completed.' }}
        </div>
      </div>

      <p class="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
        {{ t('maintenance.confirm_resolution_desc') }}
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
          :disabled="isConfirming"
          class="shadow-xs inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          <CheckCircle2 :size="14" />
          <span>{{
            isConfirming ? t('maintenance.closing_ticket') : t('maintenance.confirm_close')
          }}</span>
        </button>
      </div>
    </div>
  </AppModal>
</template>
