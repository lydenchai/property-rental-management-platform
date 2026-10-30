<script setup lang="ts">
import { AlertTriangle, Trash2 } from '@lucide/vue';
import AppModal from '../common/AppModal.vue';

interface UnitSummary {
  id: string;
  unitNumber: string;
}

interface Props {
  unit: UnitSummary | null;
  isDeleting?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'confirm', unitId: string): void;
}>();

const { t } = useI18n();

function handleConfirm() {
  if (!props.unit) return;
  emit('confirm', props.unit.id);
}
</script>

<template>
  <AppModal
    :is-open="!!unit"
    :title="t('properties.remove_unit')"
    :icon="Trash2"
    size="md"
    @close="emit('close')"
  >
    <div v-if="unit" class="space-y-3">
      <div
        class="flex items-start gap-3 rounded-lg border border-rose-100 bg-rose-50/60 p-3.5 dark:border-rose-900/30 dark:bg-rose-950/20"
      >
        <AlertTriangle :size="18" class="mt-0.5 shrink-0 text-rose-600 dark:text-rose-400" />
        <div class="space-y-1 text-xs">
          <p class="font-semibold text-neutral-900 dark:text-neutral-100">
            {{ t('properties.remove_unit_confirm', { number: unit.unitNumber }) }}
          </p>
          <p class="text-neutral-600 dark:text-neutral-400">
            {{ t('properties.remove_unit_warning') }}
          </p>
        </div>
      </div>
    </div>

    <template #footer>
      <div v-if="unit" class="flex items-center justify-end gap-2.5">
        <button type="button" @click="emit('close')" class="btn-secondary">
          {{ t('common.cancel') }}
        </button>
        <button
          type="button"
          @click="handleConfirm"
          :disabled="isDeleting"
          class="btn-danger"
        >
          <Trash2 :size="14" />
          <span>{{ isDeleting ? t('properties.removing') : t('properties.confirm_remove') }}</span>
        </button>
      </div>
    </template>
  </AppModal>
</template>
