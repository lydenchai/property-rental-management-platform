<script setup lang="ts">
import { ref, watch } from 'vue';
import { Plus } from '@lucide/vue';
import AppModal from '../common/AppModal.vue';

interface AvailableUnit {
  id: string;
  unitNumber: string;
  rentAmount: number;
  depositAmount: number;
  propertyId: string;
  propertyTitle: string;
  city: string;
}

interface AvailableTenant {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
}

interface Props {
  isOpen: boolean;
  isCreating?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (
    e: 'submit',
    form: {
      unitId: string;
      tenantId: string;
      startDate: string;
      endDate: string;
      rentAmount: number;
      depositAmount: number;
      paymentDueDay: number;
      termsAndConditions: string;
    }
  ): void;
}>();

const { t } = useI18n();

const availableUnits = ref<AvailableUnit[]>([]);
const availableTenants = ref<AvailableTenant[]>([]);
const isManualTenant = ref(false);
const isLoadingOptions = ref(false);

const form = ref({
  unitId: '',
  tenantId: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  rentAmount: 1200,
  depositAmount: 1200,
  paymentDueDay: 1,
  termsAndConditions: `Standard 12-Month Residential Lease Agreement.
1. Rent is due on the 1st of each calendar month.
2. Tenant agrees to observe all quiet hours and community guidelines.
3. Security deposit is refundable within 30 days after lease termination.`,
});

function onUnitSelect(unitId: string) {
  form.value.unitId = unitId;
  const unit = availableUnits.value.find((u) => u.id === unitId);
  if (unit) {
    form.value.rentAmount = unit.rentAmount;
    form.value.depositAmount = unit.depositAmount || unit.rentAmount;
  }
}

async function loadLeaseOptions() {
  isLoadingOptions.value = true;
  try {
    const { data } = await useFetch<any>('/api/v1/leases/options');
    if (data.value?.data) {
      availableUnits.value = data.value.data.units || [];
      availableTenants.value = data.value.data.tenants || [];
      if (availableUnits.value.length > 0 && !form.value.unitId) {
        onUnitSelect(availableUnits.value[0].id);
      }
      if (availableTenants.value.length > 0 && !form.value.tenantId) {
        form.value.tenantId = availableTenants.value[0].id;
      }
    }
  } catch {
    // Fall back gracefully to manual input
  } finally {
    isLoadingOptions.value = false;
  }
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      loadLeaseOptions();
    }
  }
);

function handleSubmit() {
  emit('submit', { ...form.value });
}
</script>

<template>
  <AppModal :is-open="isOpen" :title="t('leases.new_lease')" size="xl" @close="emit('close')">
    <form @submit.prevent="handleSubmit" class="space-y-4 p-6">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <!-- Unit Selection -->
        <div class="space-y-1.5">
          <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
            {{ t('leases.unit_select_label') }} *
          </label>
          <select
            v-if="availableUnits.length > 0"
            :value="form.unitId"
            @change="onUnitSelect(($event.target as HTMLSelectElement).value)"
            required
            class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          >
            <option value="" disabled>{{ t('leases.select_unit_placeholder') }}</option>
            <option v-for="u in availableUnits" :key="u.id" :value="u.id">
              {{ u.propertyTitle }} — Unit {{ u.unitNumber }} (${{ u.rentAmount }}/mo)
            </option>
          </select>
          <input
            v-else
            v-model="form.unitId"
            type="text"
            required
            class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            :placeholder="t('leases.select_unit_placeholder')"
          />
        </div>

        <!-- Tenant Selection -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
              {{ t('leases.tenant_select_label') }} *
            </label>
            <button
              type="button"
              v-if="availableTenants.length > 0"
              @click="isManualTenant = !isManualTenant"
              class="cursor-pointer text-[11px] text-primary-600 hover:underline dark:text-primary-400"
            >
              {{
                isManualTenant
                  ? t('leases.select_tenant_placeholder')
                  : t('leases.manual_tenant_input')
              }}
            </button>
          </div>

          <select
            v-if="availableTenants.length > 0 && !isManualTenant"
            v-model="form.tenantId"
            required
            class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          >
            <option value="" disabled>{{ t('leases.select_tenant_placeholder') }}</option>
            <option v-for="tn in availableTenants" :key="tn.id" :value="tn.id">
              {{ tn.fullName }} ({{ tn.email }})
            </option>
          </select>
          <input
            v-else
            v-model="form.tenantId"
            type="text"
            required
            class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            :placeholder="t('leases.select_tenant_placeholder')"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
            {{ t('leases.start_date') }} *
          </label>
          <input
            v-model="form.startDate"
            type="date"
            required
            class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
        </div>
        <div class="space-y-1.5">
          <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
            {{ t('leases.end_date') }} *
          </label>
          <input
            v-model="form.endDate"
            type="date"
            required
            class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div class="space-y-1.5">
          <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
            {{ t('leases.monthly_rent') }} ($) *
          </label>
          <input
            v-model.number="form.rentAmount"
            type="number"
            min="0"
            step="1"
            required
            class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
        </div>
        <div class="space-y-1.5">
          <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
            {{ t('leases.deposit') }} ($) *
          </label>
          <input
            v-model.number="form.depositAmount"
            type="number"
            min="0"
            step="1"
            required
            class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
        </div>
        <div class="space-y-1.5">
          <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
            {{ t('leases.due_day') }} *
          </label>
          <input
            v-model.number="form.paymentDueDay"
            type="number"
            min="1"
            max="28"
            required
            class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
        </div>
      </div>

      <div class="space-y-1.5">
        <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
          {{ t('leases.terms_obligations') }} *
        </label>
        <textarea
          v-model="form.termsAndConditions"
          rows="4"
          required
          class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
        ></textarea>
      </div>

      <div class="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          @click="emit('close')"
          class="cursor-pointer rounded-lg border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          type="submit"
          :disabled="isCreating"
          class="shadow-xs inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
        >
          <Plus :size="14" />
          <span>{{
            isCreating ? t('leases.generating_contract') : t('leases.create_contract_btn')
          }}</span>
        </button>
      </div>
    </form>
  </AppModal>
</template>
