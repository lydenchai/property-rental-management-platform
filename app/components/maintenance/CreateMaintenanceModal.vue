<script setup lang="ts">
import { ref } from 'vue';
import { Plus } from '@lucide/vue';
import AppModal from '../common/AppModal.vue';

export interface MaintenanceFormData {
  unitId: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
}

interface Props {
  isOpen: boolean;
  isSubmitting?: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', form: MaintenanceFormData): void;
}>();

const { t } = useI18n();

const form = ref<MaintenanceFormData>({
  unitId: '',
  title: '',
  description: '',
  priority: 'MEDIUM',
});

function handleSubmit() {
  emit('submit', { ...form.value });
}
</script>

<template>
  <AppModal
    :is-open="isOpen"
    :title="t('maintenance.create_modal_title')"
    size="lg"
    @close="emit('close')"
  >
    <form id="create-maintenance-form" @submit.prevent="handleSubmit" class="space-y-4">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
            {{ t('maintenance.unit_select_label') }}
          </label>
          <input
            v-model="form.unitId"
            type="text"
            required
            class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            :placeholder="t('maintenance.unit_select_placeholder')"
          />
        </div>
        <div class="space-y-2">
          <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
            {{ t('maintenance.select_priority') }}
          </label>
          <select
            v-model="form.priority"
            required
            class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          >
            <option value="LOW">{{ t('maintenance.priority_low_desc') }}</option>
            <option value="MEDIUM">{{ t('maintenance.priority_medium_desc') }}</option>
            <option value="HIGH">{{ t('maintenance.priority_high_desc') }}</option>
            <option value="EMERGENCY">{{ t('maintenance.priority_emergency_desc') }}</option>
          </select>
        </div>
      </div>

      <div class="space-y-2">
        <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
          {{ t('maintenance.issue_title') }}
        </label>
        <input
          v-model="form.title"
          type="text"
          required
          class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          placeholder="e.g. HVAC Air Conditioning Not Cooling"
        />
      </div>

      <div class="space-y-2">
        <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
          {{ t('maintenance.issue_desc') }}
        </label>
        <textarea
          v-model="form.description"
          rows="4"
          required
          class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          placeholder="Please provide precise details regarding where the issue is located, when it started, and any symptoms observed..."
        ></textarea>
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
          form="create-maintenance-form"
          :disabled="isSubmitting"
          class="btn-primary"
        >
          <Plus :size="14" />
          <span>{{
            isSubmitting ? t('maintenance.submitting_ticket') : t('maintenance.submit_ticket')
          }}</span>
        </button>
      </div>
    </template>
  </AppModal>
</template>
