<script setup lang="ts">
import { ref, watch } from 'vue';
import { Wrench, AlertCircle } from '@lucide/vue';
import type { MaintenanceItem } from '~~/shared/types';
import AppModal from '../common/AppModal.vue';

interface Props {
  ticket: MaintenanceItem | null;
  isUpdating?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (
    e: 'submit',
    data: {
      ticketId: string;
      status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
      resolutionNotes?: string;
    }
  ): void;
}>();

const { t } = useI18n();

const status = ref<'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'>('IN_PROGRESS');
const resolutionNotes = ref('');
const error = ref('');

watch(
  () => props.ticket,
  (t) => {
    if (t) {
      status.value = t.status;
      resolutionNotes.value = t.resolutionNotes || '';
      error.value = '';
    }
  },
  { immediate: true }
);

function handleSubmit() {
  if (!props.ticket) return;
  if (status.value === 'RESOLVED' && !resolutionNotes.value.trim()) {
    error.value = 'Resolution notes are required when marking a ticket as Resolved.';
    return;
  }
  emit('submit', {
    ticketId: props.ticket.id,
    status: status.value,
    resolutionNotes: resolutionNotes.value,
  });
}
</script>

<template>
  <AppModal :is-open="!!ticket" :title="t('maintenance.update_modal_title')" size="md" @close="emit('close')">
    <form v-if="ticket" id="update-ticket-form" @submit.prevent="handleSubmit" class="space-y-4">
      <div v-if="error"
        class="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400">
        <AlertCircle :size="15" class="shrink-0 text-rose-600 dark:text-rose-400" />
        <span>{{ error }}</span>
      </div>

      <div
        class="space-y-1.5 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-300">
        <div>
          <strong class="text-neutral-900 dark:text-white">{{ t('maintenance.issue_title') }}:</strong>
          {{ ticket.title }}
        </div>
        <div>
          <strong class="text-neutral-900 dark:text-white">Unit:</strong> Unit
          {{ ticket.unit?.unitNumber }} ({{ ticket.unit?.property?.title }})
        </div>
      </div>

      <div class="space-y-2">
        <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
          {{ t('maintenance.col_status') }} *
        </label>
        <select v-model="status" required
          class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white">
          <option value="IN_PROGRESS">{{ t('maintenance.status_in_progress') }}</option>
          <option value="RESOLVED">{{ t('maintenance.status_resolved') }}</option>
          <option value="ASSIGNED">{{ t('maintenance.status_assigned') }}</option>
          <option value="OPEN">{{ t('maintenance.status_open') }}</option>
        </select>
      </div>

      <div class="space-y-2">
        <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">{{
          t('maintenance.resolution_notes')
        }}</label>
        <textarea v-model="resolutionNotes" rows="3"
          class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          placeholder="Detail parts replaced, repairs performed, and tests conducted..."></textarea>
      </div>
    </form>

    <template #footer>
      <div v-if="ticket" class="flex items-center justify-end gap-2.5">
        <button type="button" @click="emit('close')" class="btn-secondary">
          {{ t('common.cancel') }}
        </button>
        <button type="submit" form="update-ticket-form" :disabled="isUpdating" class="btn-primary">
          <Wrench :size="14" />
          <span>{{
            isUpdating ? t('maintenance.saving_progress') : t('maintenance.save_progress')
          }}</span>
        </button>
      </div>
    </template>
  </AppModal>
</template>
