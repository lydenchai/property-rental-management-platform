<script setup lang="ts">
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
  <AppModal :is-open="!!unit" :title="t('properties.remove_unit')" size="md" @close="emit('close')">
    <div v-if="unit" class="flex flex-col gap-4 p-6">
      <p class="text-sm text-neutral-700 dark:text-neutral-300">
        {{ t('properties.remove_unit_confirm', { number: unit.unitNumber }) }}
      </p>
      <div
        class="flex items-center justify-end gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800"
      >
        <button type="button" @click="emit('close')" class="btn-secondary">
          {{ t('common.cancel') }}
        </button>
        <button type="button" @click="handleConfirm" :disabled="isDeleting" class="btn-danger">
          <span>{{ isDeleting ? t('properties.removing') : t('properties.confirm_remove') }}</span>
        </button>
      </div>
    </div>
  </AppModal>
</template>
