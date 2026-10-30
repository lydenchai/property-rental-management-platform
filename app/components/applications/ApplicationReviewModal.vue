<script setup lang="ts">
import { ref, watch } from 'vue';
import { AlertCircle } from '@lucide/vue';
import type { ApplicationItem } from '~~/shared/types';
import AppModal from '../common/AppModal.vue';

interface Props {
  application: ApplicationItem | null;
  decision: 'APPROVED' | 'REJECTED';
  isSubmitting?: boolean;
  error?: string | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', payload: { applicationId: string; reason: string }): void;
}>();

const { t } = useI18n();

const reason = ref('');
const localError = ref<string | null>(null);

watch(
  [() => props.application, () => props.decision],
  ([app, dec]) => {
    if (app) {
      localError.value = null;
      reason.value =
        dec === 'APPROVED'
          ? 'Application meets credit and income criteria. Lease agreement drafted.'
          : 'Unable to approve application at this time based on qualification criteria.';
    }
  },
  { immediate: true }
);

function handleSubmit() {
  if (!props.application || props.isSubmitting) return;

  const sanitized = reason.value.trim();
  if (sanitized.length < 3) {
    localError.value = 'Please provide a review reason with at least 3 characters.';
    return;
  }

  localError.value = null;
  emit('submit', { applicationId: props.application.id, reason: sanitized });
}
</script>

<template>
  <AppModal
    :is-open="!!application"
    :title="
      decision === 'APPROVED'
        ? t('applications.approve_modal_title')
        : t('applications.reject_modal_title')
    "
    size="md"
    @close="emit('close')"
  >
    <form v-if="application" id="application-review-form" @submit.prevent="handleSubmit" class="space-y-4">
      <div
        v-if="error || localError"
        class="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400"
      >
        <AlertCircle :size="15" class="shrink-0 text-rose-600 dark:text-rose-400" />
        <span>{{ error || localError }}</span>
      </div>

      <div
        class="space-y-1.5 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-300"
      >
        <div>
          <strong class="text-neutral-900 dark:text-white"
            >{{ t('applications.applicant_label') }}:</strong
          >
          {{ application.tenant?.fullName || 'Tenant' }} ({{ application.tenant?.email }})
        </div>
        <div>
          <strong class="text-neutral-900 dark:text-white"
            >{{ t('applications.unit_label') }}:</strong
          >
          Unit {{ application.unit?.unitNumber }} ({{ application.property?.title }})
        </div>
        <div>
          <strong class="text-neutral-900 dark:text-white"
            >{{ t('applications.desired_move_in_label') }}:</strong
          >
          {{ new Date(application.desiredMoveInDate).toLocaleDateString() }}
        </div>
        <div>
          <strong class="text-neutral-900 dark:text-white"
            >{{ t('applications.proposed_rent_label') }}:</strong
          >
          ${{ application.proposedRent }}/month
        </div>
        <div class="mt-2 border-t border-neutral-200 pt-2 dark:border-neutral-700">
          <span
            class="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
            >{{ t('applications.credentials_label') }}:</span
          >
          <p class="text-neutral-800 dark:text-neutral-200">
            {{ application.employmentDetails }}
          </p>
        </div>
      </div>

      <div class="space-y-2">
        <label class="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          {{ t('applications.review_notes_label') }}
        </label>
        <textarea
          v-model="reason"
          rows="3"
          required
          class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          :placeholder="t('applications.review_notes_placeholder')"
        ></textarea>
      </div>

      <p
        v-if="decision === 'APPROVED'"
        class="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400"
      >
        {{ t('applications.approval_auto_note', { unit: application.unit?.unitNumber || '' }) }}
      </p>
    </form>

    <template #footer>
      <div v-if="application" class="flex items-center justify-end gap-2.5">
        <button
          type="button"
          @click="emit('close')"
          class="btn-secondary"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          type="submit"
          form="application-review-form"
          :disabled="isSubmitting || reason.trim().length < 3"
          :class="decision === 'REJECTED' ? 'btn-danger' : 'btn-primary'"
        >
          <span>{{
            isSubmitting
              ? t('applications.processing_btn')
              : decision === 'APPROVED'
                ? t('applications.confirm_approval_btn')
                : t('applications.confirm_rejection_btn')
          }}</span>
        </button>
      </div>
    </template>
  </AppModal>
</template>
