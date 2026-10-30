<script setup lang="ts">
import { ref } from 'vue';
import { UserCheck } from '@lucide/vue';
import type { MaintenanceItem } from '~~/shared/types';
import AppModal from '../common/AppModal.vue';

interface Props {
  ticket: MaintenanceItem | null;
  technicians?: Array<{ id: string; fullName: string; email: string }>;
  isAssigning?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'assign', data: { ticketId: string; technicianId: string; notes?: string }): void;
}>();

const { t } = useI18n();

const selectedTechnicianId = ref('');
const notes = ref('');

// Pre-fill default technicians if not passed
const defaultTechs = [
  { id: 'tech-001', fullName: 'Alex Rivers', email: 'alex.rivers@rentease.com' },
  { id: 'tech-002', fullName: 'Marcus Vance', email: 'marcus.v@rentease.com' },
  { id: 'tech-003', fullName: 'Elena Rostova', email: 'elena.r@rentease.com' },
];

function handleSubmit() {
  if (!props.ticket || !selectedTechnicianId.value) return;
  emit('assign', {
    ticketId: props.ticket.id,
    technicianId: selectedTechnicianId.value,
    notes: notes.value,
  });
}
</script>

<template>
  <AppModal
    :is-open="!!ticket"
    :title="t('maintenance.assign_modal_title')"
    size="md"
    @close="emit('close')"
  >
    <form v-if="ticket" id="assign-tech-form" @submit.prevent="handleSubmit" class="space-y-4">
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

      <div class="space-y-2">
        <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
          {{ t('maintenance.select_technician') }} *
        </label>
        <select
          v-model="selectedTechnicianId"
          required
          class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
        >
          <option value="" disabled>{{ t('maintenance.choose_technician') }}</option>
          <option
            v-for="tech in technicians && technicians.length > 0 ? technicians : defaultTechs"
            :key="tech.id"
            :value="tech.id"
          >
            {{ tech.fullName }} ({{ tech.email }})
          </option>
        </select>
      </div>

      <div class="space-y-2">
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
    </form>

    <template #footer>
      <div v-if="ticket" class="flex items-center justify-end gap-2.5">
        <button
          type="button"
          @click="emit('close')"
          class="btn-secondary"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          type="submit"
          form="assign-tech-form"
          :disabled="isAssigning"
          class="btn-primary"
        >
          <UserCheck :size="14" />
          <span>{{
            isAssigning ? t('maintenance.assigning_tech') : t('maintenance.confirm_assignment')
          }}</span>
        </button>
      </div>
    </template>
  </AppModal>
</template>
