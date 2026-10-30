<script setup lang="ts">
import { ref, watch } from 'vue';
import { AlertCircle, Wrench } from '@lucide/vue';
import type { MaintenanceItem } from '~~/shared/types';
import AppModal from '../common/AppModal.vue';

interface Props {
  ticket: MaintenanceItem | null;
  isUpdating?: boolean;
  error?: string | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', payload: { status: 'IN_PROGRESS' | 'RESOLVED'; resolutionNotes?: string }): void;
}>();

const { t } = useI18n();

const status = ref<'IN_PROGRESS' | 'RESOLVED'>('IN_PROGRESS');
const resolutionNotes = ref('');

watch(
  () => props.ticket,
  (tkt) => {
    if (tkt) {
      status.value = tkt.status === 'IN_PROGRESS' ? 'RESOLVED' : 'IN_PROGRESS';
      resolutionNotes.value = tkt.resolutionNotes || '';
    }
  }
);

function handleSubmit() {
  if (!props.ticket) return;
  emit('submit', {
    status: status.value,
    resolutionNotes: resolutionNotes.value || undefined,
  });
}
</script>

<template>
  <AppModal
    :is-open="!!ticket"
    :title="t('maintenance.update_modal_title')"
    size="lg"
    @close="emit('close')"
  >
    <form v-if="ticket" @submit.prevent="handleSubmit" class="space-y-4 p-6">
      <div
        v-if="error"
        class="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400"
      >
        <AlertCircle :size="15" class="shrink-0 text-rose-600 dark:text-rose-400" />
        <span>{{ error }}</span>
      </div>

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
          <strong class="text-neutral-900 dark:text-white">Unit:</strong> Unit
          {{ ticket.unit?.unitNumber }}
        </div>
      </div>

      <div class="space-y-1.5">
        <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">{{
          t('maintenance.progress_status')
        }}</label>
        <select
          v-model="status"
          required
          class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
        >
          <option value="IN_PROGRESS">In Progress (Diagnostics / Parts ordered)</option>
          <option value="RESOLVED">Resolved (Repairs completed, ready for tenant check)</option>
        </select>
      </div>

      <div class="space-y-1.5">
        <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">{{
          t('maintenance.resolution_notes')
        }}</label>
        <textarea
          v-model="resolutionNotes"
          rows="4"
          class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          placeholder="Detail parts replaced, repairs performed, and tests conducted..."
        ></textarea>
      </div>

      <div class="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          @click="emit('close')"
          class="cursor-pointer rounded-lg border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          type="submit"
          :disabled="isUpdating"
          class="shadow-xs inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
        >
          <Wrench :size="14" />
          <span>{{
            isUpdating ? t('maintenance.saving_progress') : t('maintenance.save_progress')
          }}</span>
        </button>
      </div>
    </form>
  </AppModal>
</template>
