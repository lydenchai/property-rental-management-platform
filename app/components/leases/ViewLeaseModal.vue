<script setup lang="ts">
import type { LeaseItem } from '~~/shared/types';
import AppModal from '../common/AppModal.vue';

interface Props {
  lease: LeaseItem | null;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const { t } = useI18n();
</script>

<template>
  <AppModal
    :is-open="!!lease"
    :title="t('leases.contract_details_title')"
    size="lg"
    @close="emit('close')"
  >
    <div v-if="lease" class="space-y-4">
      <div
        class="space-y-1.5 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-300"
      >
        <div>
          <strong class="text-neutral-900 dark:text-white">{{ t('leases.unit_label') }}:</strong>
          Unit {{ lease.unit?.unitNumber }}
        </div>
        <div>
          <strong class="text-neutral-900 dark:text-white">{{ t('leases.col_tenant') }}:</strong>
          {{ lease.tenant?.fullName }}
        </div>
        <div>
          <strong class="text-neutral-900 dark:text-white"
            >{{ t('properties.col_property') }}:</strong
          >
          {{ lease.property?.title || lease.landlord?.fullName }}
        </div>
        <div>
          <strong class="text-neutral-900 dark:text-white">{{ t('leases.monthly_rent') }}:</strong>
          ${{ lease.rentAmount }} / month ({{ t('leases.payment_due_day_label') }}:
          {{ lease.paymentDueDay }})
        </div>
        <div class="flex items-center gap-2 pt-1">
          <strong class="text-neutral-900 dark:text-white">{{ t('leases.col_status') }}:</strong>
          <span
            :class="[
              'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium',
              lease.status === 'ACTIVE'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                : lease.status === 'PENDING_SIGNATURES'
                  ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                  : 'border-neutral-200 bg-neutral-100 text-neutral-700',
            ]"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
            <span>{{
              lease.status === 'ACTIVE'
                ? t('leases.status.active')
                : lease.status === 'PENDING_SIGNATURES'
                  ? t('leases.status.pending')
                  : t('leases.status.terminated')
            }}</span>
          </span>
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
          class="max-h-56 overflow-y-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-neutral-700 dark:text-neutral-300"
          >{{ lease.termsAndConditions }}</pre>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end">
        <button
          type="button"
          @click="emit('close')"
          class="btn-secondary"
        >
          {{ t('leases.close_btn') }}
        </button>
      </div>
    </template>
  </AppModal>
</template>
