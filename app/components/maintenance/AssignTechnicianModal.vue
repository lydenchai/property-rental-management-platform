<script setup lang="ts">
import { ref, watch } from 'vue';
import { UserCheck } from '@lucide/vue';
import type { MaintenanceItem } from '~~/shared/types';
import AppModal from '../common/AppModal.vue';

interface Props {
  ticket: MaintenanceItem | null;
  isAssigning?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', payload: { technicianId: string; notes?: string }): void;
}>();

const { t } = useI18n();

const technicianId = ref('user-tech-01');
const notes = ref('');

watch(
  () => props.ticket,
  () => {
    technicianId.value = 'user-tech-01';
    notes.value = '';
  }
);

function handleSubmit() {
  if (!props.ticket) return;
  emit('submit', {
    technicianId: technicianId.value,
    notes: notes.value || undefined,
  });
}
</script>

<template>
  <AppModal
    :is-open="!!ticket"
    :title="t('maintenance.assign_modal_title')"
    size="lg"
    @close="emit('close')"
  >
    <form v-if="ticket" @submit.prevent="handleSubmit" class="space-y-4 p-6">
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
          {{ ticket.unit?.unitNumber }} ({{ ticket.unit?.property?.title }})
        </div>
        <div>
          <strong class="text-neutral-900 dark:text-white"
            >{{ t('maintenance.col_priority') }}:</strong
          >
          {{ ticket.priority }}
        </div>
      </div>

      <div class="space-y-1.5">
        <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">{{
          t('maintenance.select_technician')
        }}</label>
        <select
          v-model="technicianId"
          required
          class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
        >
          <option value="user-tech-01">Alex Rivers (Licensed HVAC & Plumbing Specialist)</option>
          <option value="user-technician-01">Dave Miller (General Building Maintenance)</option>
        </select>
      </div>

      <div class="space-y-1.5">
        <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">{{
          t('maintenance.dispatch_notes')
        }}</label>
        <textarea
          v-model="notes"
          rows="3"
          class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          placeholder="Optional notes, access instructions, or tools needed..."
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
          :disabled="isAssigning"
          class="shadow-xs inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
        >
          <UserCheck :size="14" />
          <span>{{
            isAssigning ? t('maintenance.assigning_tech') : t('maintenance.confirm_assignment')
          }}</span>
        </button>
      </div>
    </form>
  </AppModal>
</template>
