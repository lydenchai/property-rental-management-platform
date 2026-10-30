<script setup lang="ts">
import { ref, watch } from 'vue';
import { FileSignature } from '@lucide/vue';
import type { LeaseItem } from '~~/shared/types';
import AppModal from '../common/AppModal.vue';

interface Props {
  lease: LeaseItem | null;
  isSigning?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'sign', leaseId: string): void;
}>();

const { t } = useI18n();
const agreeToTerms = ref(false);

watch(
  () => props.lease,
  () => {
    agreeToTerms.value = false;
  }
);

function handleSign() {
  if (!props.lease || !agreeToTerms.value) return;
  emit('sign', props.lease.id);
}
</script>

<template>
  <AppModal
    :is-open="!!lease"
    :title="t('leases.sign_modal_title')"
    size="md"
    @close="emit('close')"
  >
    <form v-if="lease" id="sign-lease-form" @submit.prevent="handleSign" class="space-y-4">
      <div
        class="space-y-1.5 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-300"
      >
        <div>
          <strong class="text-neutral-900 dark:text-white">{{ t('leases.unit_label') }}:</strong>
          Unit {{ lease.unit?.unitNumber }} ({{ lease.property?.title }})
        </div>
        <div>
          <strong class="text-neutral-900 dark:text-white">{{ t('leases.monthly_rent') }}:</strong>
          ${{ lease.rentAmount.toLocaleString() }} / month
        </div>
        <div>
          <strong class="text-neutral-900 dark:text-white">{{ t('leases.deposit') }}:</strong>
          ${{ lease.depositAmount.toLocaleString() }}
        </div>
        <div>
          <strong class="text-neutral-900 dark:text-white">{{ t('leases.term_label') }}:</strong>
          {{ new Date(lease.startDate).toLocaleDateString() }} to
          {{ new Date(lease.endDate).toLocaleDateString() }}
        </div>
      </div>

      <div
        class="space-y-1.5 rounded-lg border border-neutral-200 bg-neutral-100 p-4 dark:border-neutral-700 dark:bg-neutral-800"
      >
        <span
          class="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
          >{{ t('leases.terms_modal_title') }}:</span
        >
        <pre
          class="max-h-48 overflow-y-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-neutral-700 dark:text-neutral-300"
          >{{ lease.termsAndConditions }}</pre>
      </div>

      <label
        class="flex cursor-pointer items-start gap-3 text-xs text-neutral-700 dark:text-neutral-300"
      >
        <input
          type="checkbox"
          v-model="agreeToTerms"
          required
          class="mt-0.5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
        />
        <span>{{ t('leases.agree_checkbox') }}</span>
      </label>
    </form>

    <template #footer>
      <div v-if="lease" class="flex items-center justify-end gap-2.5">
        <button
          type="button"
          @click="emit('close')"
          class="btn-secondary"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          type="submit"
          form="sign-lease-form"
          :disabled="!agreeToTerms || isSigning"
          class="btn-primary"
        >
          <FileSignature :size="14" />
          <span>{{
            isSigning ? t('leases.recording_signature') : t('leases.confirm_signature')
          }}</span>
        </button>
      </div>
    </template>
  </AppModal>
</template>
