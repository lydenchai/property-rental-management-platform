<script setup lang="ts">
import { ref, watch } from 'vue';
import { FileSignature, CheckCircle2, AlertCircle } from '@lucide/vue';
import AppModal from '../common/AppModal.vue';

interface UnitSummary {
  id: string;
  unitNumber: string;
  rentAmount: number;
  depositAmount: number;
  bedrooms: number;
  bathrooms: number;
  sizeSqFt: number;
}

export interface ApplyFormData {
  desiredMoveInDate: string;
  proposedRent: number;
  employmentDetails: string;
  notes?: string;
}

interface Props {
  unit: UnitSummary | null;
  propertyTitle?: string;
  isSubmitting?: boolean;
  successMessage?: string | null;
  errorMessage?: string | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', form: ApplyFormData): void;
}>();

const { t } = useI18n();

const form = ref<ApplyFormData>({
  desiredMoveInDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!,
  proposedRent: 0,
  employmentDetails: '',
  notes: '',
});

watch(
  () => props.unit,
  (u) => {
    if (u) {
      form.value = {
        desiredMoveInDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]!,
        proposedRent: u.rentAmount,
        employmentDetails: '',
        notes: '',
      };
    }
  },
  { immediate: true }
);

function handleQuickDemo() {
  const rent = form.value.proposedRent || 1000;
  form.value.employmentDetails =
    'Employed full-time / Verified income ($' + (rent * 3).toLocaleString() + '/mo)';
}

function handleSubmit() {
  emit('submit', { ...form.value });
}
</script>

<template>
  <AppModal
    :is-open="!!unit"
    :title="unit ? t('properties.apply_for_unit', { number: unit.unitNumber }) : ''"
    size="lg"
    @close="emit('close')"
  >
    <div v-if="unit">
      <div v-if="successMessage" class="alert-success">
        <div class="flex flex-col gap-3">
          <div class="flex items-start gap-2">
            <CheckCircle2 :size="18" class="mt-0.5 shrink-0" />
            <span>{{ successMessage }}</span>
          </div>
          <div class="mt-2 flex items-center gap-2">
            <NuxtLink to="/dashboard/applications" class="btn-primary btn-sm">
              <span>{{ t('properties.view_my_applications') }}</span>
            </NuxtLink>
            <button @click="emit('close')" class="btn-secondary btn-sm">
              {{ t('common.close') }}
            </button>
          </div>
        </div>
      </div>

      <form v-else id="apply-unit-form" @submit.prevent="handleSubmit" class="flex flex-col gap-4">
        <div v-if="errorMessage" class="alert-error">
          <AlertCircle :size="15" />
          <span>{{ errorMessage }}</span>
        </div>

        <div
          class="flex flex-col gap-1 rounded-xl border border-neutral-200 bg-neutral-50 p-3.5 text-xs text-neutral-600 dark:border-neutral-700/60 dark:bg-neutral-800/60 dark:text-neutral-300"
        >
          <div>
            <strong>{{ t('properties.unit_singular') }}:</strong>
            {{ t('properties.unit_label', { number: unit.unitNumber }) }} ({{ propertyTitle }})
          </div>
          <div>
            <strong>{{ t('properties.col_monthly_rent') }}:</strong> ${{
              unit.rentAmount.toLocaleString()
            }}{{ t('properties.per_month_short') }} &bull;
            <strong>{{ t('properties.col_deposit') }}:</strong> ${{
              unit.depositAmount.toLocaleString()
            }}
          </div>
          <div>
            <strong>{{ t('properties.col_size') }}:</strong>
            {{
              unit.bedrooms === 0
                ? t('properties.studio')
                : t('properties.bed_short', { count: unit.bedrooms })
            }}
            / {{ t('properties.bath_short', { count: unit.bathrooms }) }} ({{
              t('properties.sq_m', { size: unit.sizeSqFt })
            }})
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-2">
            <label
              class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
              >{{ t('properties.desired_move_in') }}</label
            >
            <input v-model="form.desiredMoveInDate" type="date" required class="input-field" />
          </div>

          <div class="flex flex-col gap-2">
            <label
              class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
              >{{ t('properties.proposed_monthly_rent') }}</label
            >
            <input
              v-model.number="form.proposedRent"
              type="number"
              min="1"
              required
              class="input-field"
            />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <label
              class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
              >{{ t('properties.employment_income_credentials') }}</label
            >
            <button
              type="button"
              @click="handleQuickDemo"
              class="text-[11px] font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              {{ t('auth.quick_demo') }}
            </button>
          </div>
          <textarea
            v-model="form.employmentDetails"
            rows="3"
            :placeholder="t('properties.employment_placeholder')"
            class="input-field"
          ></textarea>
        </div>

        <div class="flex flex-col gap-2">
          <label
            class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
            >{{ t('properties.additional_notes_optional') }}</label
          >
          <input
            v-model="form.notes"
            type="text"
            :placeholder="t('properties.additional_notes_placeholder')"
            class="input-field"
          />
        </div>
      </form>
    </div>

    <template #footer>
      <div v-if="unit && !successMessage" class="flex items-center justify-end gap-2.5">
        <button type="button" @click="emit('close')" class="btn-secondary">
          {{ t('common.cancel') }}
        </button>
        <button type="submit" form="apply-unit-form" :disabled="isSubmitting" class="btn-primary">
          <FileSignature :size="14" />
          <span>{{
            isSubmitting
              ? t('properties.submitting_application')
              : t('properties.submit_application')
          }}</span>
        </button>
      </div>
    </template>
  </AppModal>
</template>
