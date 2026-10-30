<script setup lang="ts">
import { ref, watch } from 'vue';
import AppModal from '../common/AppModal.vue';

export interface UnitFormData {
  unitNumber: string;
  floor: number;
  sizeSqFt: number;
  bedrooms: number;
  bathrooms: number;
  rentAmount: number;
  depositAmount: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';
}

interface Props {
  isOpen: boolean;
  unitId?: string | null;
  initialData?: Partial<UnitFormData> | null;
  isSubmitting?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', data: UnitFormData): void;
}>();

const { t } = useI18n();

const defaultForm: UnitFormData = {
  unitNumber: '',
  floor: 1,
  sizeSqFt: 60,
  bedrooms: 1,
  bathrooms: 1,
  rentAmount: 500,
  depositAmount: 500,
  status: 'AVAILABLE',
};

const form = ref<UnitFormData>({ ...defaultForm });

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      if (props.initialData) {
        form.value = {
          unitNumber: props.initialData.unitNumber || '',
          floor: props.initialData.floor ?? 1,
          sizeSqFt: props.initialData.sizeSqFt ?? 60,
          bedrooms: props.initialData.bedrooms ?? 1,
          bathrooms: props.initialData.bathrooms ?? 1,
          rentAmount: props.initialData.rentAmount ?? 500,
          depositAmount: props.initialData.depositAmount ?? 500,
          status: props.initialData.status || 'AVAILABLE',
        };
      } else {
        form.value = { ...defaultForm };
      }
    }
  },
  { immediate: true }
);

function handleSubmit() {
  emit('submit', { ...form.value });
}
</script>

<template>
  <AppModal
    :is-open="isOpen"
    :title="unitId ? t('properties.edit_unit') : t('properties.add_unit_to_property')"
    size="lg"
    @close="emit('close')"
  >
    <form id="unit-form" @submit.prevent="handleSubmit" class="flex flex-col gap-4">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="flex flex-col gap-2">
          <label
            for="u-number"
            class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
            >{{ t('properties.unit_number_label') }}</label
          >
          <input
            id="u-number"
            v-model="form.unitNumber"
            type="text"
            placeholder="e.g. 101A"
            required
            class="input-field"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label
            for="u-floor"
            class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
            >{{ t('properties.floor_level_label') }}</label
          >
          <input
            id="u-floor"
            v-model.number="form.floor"
            type="number"
            min="0"
            required
            class="input-field"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div class="flex flex-col gap-2">
          <label
            for="u-size"
            class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
            >{{ t('properties.area_sqm_label') }}</label
          >
          <input
            id="u-size"
            v-model.number="form.sizeSqFt"
            type="number"
            min="10"
            required
            class="input-field"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label
            for="u-beds"
            class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
            >{{ t('properties.bedrooms') }} *</label
          >
          <input
            id="u-beds"
            v-model.number="form.bedrooms"
            type="number"
            min="0"
            required
            class="input-field"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label
            for="u-baths"
            class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
            >{{ t('properties.bathrooms') }} *</label
          >
          <input
            id="u-baths"
            v-model.number="form.bathrooms"
            type="number"
            min="0.5"
            step="0.5"
            required
            class="input-field"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="flex flex-col gap-2">
          <label
            for="u-rent"
            class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
            >{{ t('properties.monthly_rent_label') }}</label
          >
          <input
            id="u-rent"
            v-model.number="form.rentAmount"
            type="number"
            min="1"
            required
            class="input-field"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label
            for="u-deposit"
            class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
            >{{ t('properties.security_deposit_label') }}</label
          >
          <input
            id="u-deposit"
            v-model.number="form.depositAmount"
            type="number"
            min="0"
            required
            class="input-field"
          />
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <label
          for="u-status"
          class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
          >{{ t('properties.unit_status_label') }}</label
        >
        <select id="u-status" v-model="form.status" class="input-field">
          <option value="AVAILABLE">{{ t('properties.status.vacant') }}</option>
          <option value="RESERVED">{{ t('properties.status.reserved') }}</option>
          <option value="OCCUPIED">{{ t('properties.status.occupied') }}</option>
          <option value="MAINTENANCE">{{ t('properties.status.maintenance') }}</option>
        </select>
      </div>
    </form>

    <template #footer>
      <div class="flex items-center justify-end gap-2.5">
        <button type="button" @click="emit('close')" class="btn-secondary">
          {{ t('common.cancel') }}
        </button>
        <button type="submit" form="unit-form" :disabled="isSubmitting" class="btn-primary">
          <span>{{ isSubmitting ? t('properties.saving') : t('properties.save_unit') }}</span>
        </button>
      </div>
    </template>
  </AppModal>
</template>
