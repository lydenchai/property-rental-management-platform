<script setup lang="ts">
import type { MaintenanceItem } from '~~/shared/types';
import AppModal from '../common/AppModal.vue';

interface Props {
  ticket: MaintenanceItem | null;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const { t } = useI18n();
</script>

<template>
  <AppModal :is-open="!!ticket" :title="t('maintenance.ticket_details_title')" size="lg" @close="emit('close')">
    <div v-if="ticket" class="space-y-4">
      <div
        class="space-y-2 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-300">
        <div>
          <strong class="text-neutral-900 dark:text-white">{{ t('maintenance.issue_title') }}:</strong>
          {{ ticket.title }}
        </div>
        <div class="flex items-center gap-2">
          <strong class="text-neutral-900 dark:text-white">{{ t('maintenance.col_priority') }}:</strong>
          <span :class="[
            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
            ticket.priority === 'EMERGENCY'
              ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-400'
              : ticket.priority === 'HIGH'
                ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                : ticket.priority === 'MEDIUM'
                  ? 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-400'
                  : 'border-neutral-200 bg-neutral-100 text-neutral-700',
          ]">
            <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
            <span>{{
              ticket.priority === 'EMERGENCY'
                ? t('maintenance.priority.urgent')
                : ticket.priority === 'HIGH'
                  ? t('maintenance.priority.high')
                  : ticket.priority === 'MEDIUM'
                    ? t('maintenance.priority.medium')
                    : t('maintenance.priority.low')
            }}</span>
          </span>
        </div>
        <div class="flex items-center gap-2">
          <strong class="text-neutral-900 dark:text-white">{{ t('maintenance.col_status') }}:</strong>
          <span :class="[
            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
            ticket.status === 'RESOLVED'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
              : ticket.status === 'IN_PROGRESS'
                ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                : ticket.status === 'OPEN'
                  ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400'
                  : ticket.status === 'ASSIGNED'
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-400'
                    : 'border-neutral-200 bg-neutral-100 text-neutral-700',
          ]">
            <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
            <span>{{
              ticket.status === 'CONFIRMED_CLOSED'
                ? t('maintenance.status.confirmed_closed')
                : ticket.status === 'IN_PROGRESS'
                  ? t('maintenance.status.in_progress')
                  : ticket.status === 'OPEN'
                    ? t('maintenance.status.open')
                    : ticket.status === 'ASSIGNED'
                      ? t('maintenance.status.assigned')
                      : t('maintenance.status.resolved')
            }}</span>
          </span>
        </div>
        <div>
          <strong class="text-neutral-900 dark:text-white">{{ t('maintenance.col_unit_property') }}:</strong>
          Unit {{ ticket.unit?.unitNumber }} ({{ ticket.unit?.property?.title }})
        </div>
        <div>
          <strong class="text-neutral-900 dark:text-white">{{ t('maintenance.col_requester') }}:</strong>
          {{ ticket.tenant?.fullName }} ({{ ticket.tenant?.email }})
        </div>
        <div v-if="ticket.assignments && ticket.assignments.length > 0">
          <strong class="text-neutral-900 dark:text-white">{{ t('maintenance.col_technician') }}:</strong>
          {{ ticket.assignments[0]!.technician?.fullName }}
        </div>
        <div>
          <strong class="text-neutral-900 dark:text-white">{{ t('maintenance.col_reported') }}:</strong>
          {{ new Date(ticket.requestedAt).toLocaleString() }}
        </div>
        <div v-if="ticket.resolvedAt">
          <strong class="text-neutral-900 dark:text-white">Resolved At:</strong>
          {{ new Date(ticket.resolvedAt).toLocaleString() }}
        </div>
        <div v-if="ticket.confirmedAt">
          <strong class="text-neutral-900 dark:text-white">Confirmed Closed:</strong>
          {{ new Date(ticket.confirmedAt).toLocaleString() }}
        </div>
      </div>

      <div class="space-y-1.5">
        <label class="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">{{ t('maintenance.issue_desc')
          }}:</label>
        <div
          class="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs leading-relaxed text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-200">
          {{ ticket.description }}
        </div>
      </div>

      <div v-if="ticket.resolutionNotes" class="space-y-1.5">
        <label class="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">{{
          t('maintenance.resolution_notes') }}:</label>
        <div
          class="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300">
          {{ ticket.resolutionNotes }}
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end">
        <button type="button" @click="emit('close')" class="btn-secondary">
          {{ t('maintenance.close_btn') }}
        </button>
      </div>
    </template>
  </AppModal>
</template>
