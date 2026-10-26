<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ArrowLeft, Building, Plus, CheckCircle2, AlertCircle } from '@lucide/vue';
import { usePropertyStore } from '../../../../stores/property.store';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  title: 'Edit Property Details',
});

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const propertyId = route.params.id as string;

const propertyStore = usePropertyStore();
const { isLoading, isSubmitting, errorMessage } = propertyStore;
const { fetchPropertyById, updateProperty } = propertyStore;

const form = ref({
  title: '',
  description: '',
  addressLine1: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'KH',
  amenities: [] as string[],
});

const newAmenity = ref('');

const standardAmenities = [
  'Swimming Pool',
  'Fitness Center',
  'Underground Parking',
  '24/7 Concierge',
  'High-speed Fiber',
  'Dog Park',
  'In-unit Laundry',
  'Balcony / Patio',
  'Storage Lockers',
  'Central Air Conditioning',
];

async function loadProperty() {
  const res = await fetchPropertyById(propertyId);
  if (res.success && res.property) {
    const p = res.property;
    form.value = {
      title: p.title,
      description: p.description,
      addressLine1: p.addressLine1,
      city: p.city,
      state: p.state,
      postalCode: p.postalCode,
      country: p.country || 'KH',
      amenities: p.amenities || [],
    };
  }
}

function toggleAmenity(item: string) {
  if (form.value.amenities.includes(item)) {
    form.value.amenities = form.value.amenities.filter((a) => a !== item);
  } else {
    form.value.amenities.push(item);
  }
}

function addCustomAmenity() {
  const val = newAmenity.value.trim();
  if (val && !form.value.amenities.includes(val)) {
    form.value.amenities.push(val);
    newAmenity.value = '';
  }
}

const toast = useToast();

async function handleUpdateProperty() {
  try {
    const res = await updateProperty(propertyId, form.value);
    if (res.success) {
      toast.success('Property updated successfully.');
      router.push(`/dashboard/properties/${propertyId}`);
    } else {
      toast.error(res.error || errorMessage.value || 'Failed to update property.');
    }
  } catch (err: any) {
    toast.error(err?.data?.error?.message || err?.message || 'Failed to update property.');
  }
}

onMounted(() => {
  loadProperty();
});
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-5">
    <div class="flex items-center">
      <NuxtLink
        :to="`/dashboard/properties/${propertyId}`"
        class="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white sm:text-sm"
      >
        <ArrowLeft :size="15" />
        <span>{{ t('properties.back_to_property') }}</span>
      </NuxtLink>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-col items-center gap-3 py-20 text-center">
      <div
        class="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-blue-600"
      />
      <p class="text-sm text-neutral-500 dark:text-neutral-400">
        {{ t('properties.loading_property_details') }}
      </p>
    </div>

    <div
      v-else
      class="shadow-xs flex flex-col gap-6 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 sm:p-8"
    >
      <div
        class="flex items-center gap-3.5 border-b border-neutral-100 pb-5 dark:border-neutral-800"
      >
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-800/40 dark:bg-blue-950/40 dark:text-blue-400"
        >
          <Building :size="20" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-neutral-900 dark:text-white">
            {{ t('properties.edit_property_title') }}
          </h2>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm">
            {{ t('properties.edit_property_subtitle') }}
          </p>
        </div>
      </div>

      <div v-if="errorMessage" class="alert-error">
        <AlertCircle :size="16" />
        <span>{{ errorMessage }}</span>
      </div>

      <form @submit.prevent="handleUpdateProperty" class="flex flex-col gap-6">
        <div class="flex flex-col gap-4">
          <h3
            class="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500"
          >
            {{ t('properties.property_details') }}
          </h3>

          <div class="flex flex-col gap-1.5">
            <label
              for="prop-title"
              class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
              >{{ t('properties.property_title_label') }}</label
            >
            <input id="prop-title" v-model="form.title" type="text" required class="input-field" />
          </div>

          <div class="flex flex-col gap-1.5">
            <label
              for="prop-desc"
              class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
              >{{ t('properties.description_label') }}</label
            >
            <textarea
              id="prop-desc"
              v-model="form.description"
              rows="4"
              required
              class="input-field"
            ></textarea>
          </div>
        </div>

        <div class="flex flex-col gap-4 border-t border-neutral-100 pt-6 dark:border-neutral-800">
          <h3
            class="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500"
          >
            {{ t('properties.address_location') }}
          </h3>

          <div class="flex flex-col gap-1.5">
            <label
              for="prop-addr"
              class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
              >{{ t('properties.street_address_label') }}</label
            >
            <input
              id="prop-addr"
              v-model="form.addressLine1"
              type="text"
              required
              class="input-field"
            />
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div class="flex flex-col gap-1.5">
              <label
                for="prop-city"
                class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
                >{{ t('properties.city_label') }}</label
              >
              <input id="prop-city" v-model="form.city" type="text" required class="input-field" />
            </div>

            <div class="flex flex-col gap-1.5">
              <label
                for="prop-state"
                class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
                >{{ t('properties.state_region_label') }}</label
              >
              <input
                id="prop-state"
                v-model="form.state"
                type="text"
                required
                class="input-field"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label
                for="prop-zip"
                class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
                >{{ t('properties.postal_code_label') }}</label
              >
              <input
                id="prop-zip"
                v-model="form.postalCode"
                type="text"
                required
                class="input-field"
              />
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-3 border-t border-neutral-100 pt-6 dark:border-neutral-800">
          <h3
            class="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500"
          >
            {{ t('properties.amenities_features') }}
          </h3>
          <div class="mt-1 flex flex-wrap gap-2">
            <button
              v-for="item in standardAmenities"
              :key="item"
              type="button"
              @click="toggleAmenity(item)"
              :class="[
                'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                form.amenities.includes(item)
                  ? 'shadow-xs border-blue-600 bg-blue-600 text-white'
                  : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700',
              ]"
            >
              <span>{{ item }}</span>
            </button>
          </div>

          <div class="mt-2 flex items-center gap-2">
            <input
              v-model="newAmenity"
              type="text"
              :placeholder="t('properties.add_custom_amenity')"
              class="input-field max-w-xs text-xs"
              @keydown.enter.prevent="addCustomAmenity"
            />
            <button type="button" @click="addCustomAmenity" class="btn-secondary btn-sm shrink-0">
              <Plus :size="14" />
              <span>{{ t('properties.add') }}</span>
            </button>
          </div>
        </div>

        <div
          class="flex items-center justify-end gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800"
        >
          <NuxtLink :to="`/dashboard/properties/${propertyId}`" class="btn-secondary">
            {{ t('common.cancel') }}
          </NuxtLink>
          <button type="submit" :disabled="isSubmitting" class="btn-primary">
            <span>{{ isSubmitting ? t('properties.saving') : t('properties.save_changes') }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
