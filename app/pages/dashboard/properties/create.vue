<script setup lang="ts">
import { ref } from 'vue';
import { ArrowLeft, Building, Plus, X, CheckCircle2, AlertCircle } from '@lucide/vue';
import { usePropertyStore } from '../../../stores/property.store';
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  title: 'Add New Property',
});

const { t } = useI18n();
const router = useRouter();
const propertyStore = usePropertyStore();
const { isSubmitting, errorMessage } = propertyStore;
const { createProperty } = propertyStore;

const form = ref({
  title: '',
  description: '',
  addressLine1: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'KH',
  amenities: [],
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

function toggleAmenity(item) {
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

async function handleCreateProperty() {
  try {
    const res = await createProperty(form.value);
    if (res.success && res.property) {
      toast.success(`Property "${res.property.title}" has been successfully created.`);
      router.push(`/dashboard/properties/${res.property.id}`);
    } else {
      toast.error(res.error || errorMessage.value || 'Failed to create property.');
    }
  } catch (err: any) {
    toast.error(err?.data?.error?.message || err?.message || 'Failed to create property.');
  }
}
</script>

<template>
  <div class="property-create-page">
    <div class="top-nav-bar">
      <NuxtLink to="/dashboard/properties" class="back-link">
        <ArrowLeft :size="15" />
        <span>{{ t('properties.back_to_properties') }}</span>
      </NuxtLink>
    </div>

    <div class="form-shell card-flat">
      <div class="form-header">
        <div class="header-icon-box">
          <Building :size="20" />
        </div>
        <div>
          <h2>{{ t('properties.create_property_title') }}</h2>
          <p class="subtitle">{{ t('properties.create_property_subtitle') }}</p>
        </div>
      </div>

      <div v-if="errorMessage" class="alert-error">
        <AlertCircle :size="16" />
        <span>{{ errorMessage }}</span>
      </div>

      <form @submit.prevent="handleCreateProperty" class="create-form">
        <!-- Basic Info Section -->
        <div class="form-section">
          <h3 class="section-title">{{ t('properties.property_details') }}</h3>

          <div class="form-group">
            <label for="prop-title" class="form-label">{{ t('properties.property_title_label') }}</label>
            <input id="prop-title" v-model="form.title" type="text" :placeholder="t('properties.property_title_placeholder')"
              required class="input-field" />
          </div>

          <div class="form-group">
            <label for="prop-desc" class="form-label">{{ t('properties.description_label') }}</label>
            <textarea id="prop-desc" v-model="form.description" rows="4"
              :placeholder="t('properties.description_placeholder')"
              required class="input-field textarea-field"></textarea>
          </div>
        </div>

        <!-- Location Section -->
        <div class="form-section">
          <h3 class="section-title">{{ t('properties.address_location') }}</h3>

          <div class="form-group">
            <label for="prop-addr" class="form-label">{{ t('properties.street_address_label') }}</label>
            <input id="prop-addr" v-model="form.addressLine1" type="text"
              :placeholder="t('properties.street_address_placeholder')" required class="input-field" />
          </div>

          <div class="grid-3">
            <div class="form-group">
              <label for="prop-city" class="form-label">{{ t('properties.city_label') }}</label>
              <input id="prop-city" v-model="form.city" type="text" :placeholder="t('properties.city_placeholder')" required
                class="input-field" />
            </div>

            <div class="form-group">
              <label for="prop-state" class="form-label">{{ t('properties.state_region_label') }}</label>
              <input id="prop-state" v-model="form.state" type="text" :placeholder="t('properties.city_placeholder')" required
                class="input-field" />
            </div>

            <div class="form-group">
              <label for="prop-zip" class="form-label">{{ t('properties.postal_code_label') }}</label>
              <input id="prop-zip" v-model="form.postalCode" type="text" placeholder="e.g. 120102" required
                class="input-field" />
            </div>
          </div>
        </div>

        <!-- Amenities Section -->
        <div class="form-section">
          <h3 class="section-title">{{ t('properties.amenities_features') }}</h3>
          <p class="section-hint">{{ t('properties.amenities_hint') }}</p>

          <div class="amenities-picker">
            <button v-for="item in standardAmenities" :key="item" type="button" @click="toggleAmenity(item)"
              class="amenity-chip" :class="{ selected: form.amenities.includes(item) }">
              <span>{{ item }}</span>
            </button>
          </div>

          <div class="custom-amenity-row mt-3">
            <input v-model="newAmenity" type="text" :placeholder="t('properties.add_custom_amenity')" class="input-field input-sm"
              @keydown.enter.prevent="addCustomAmenity" />
            <button type="button" @click="addCustomAmenity" class="btn-secondary btn-sm">
              <Plus :size="14" />
              <span>{{ t('properties.add') }}</span>
            </button>
          </div>
        </div>

        <div class="form-actions">
          <NuxtLink to="/dashboard/properties" class="btn-secondary">
            {{ t('common.cancel') }}
          </NuxtLink>
          <button type="submit" :disabled="isSubmitting" class="btn-primary">
            <span>{{ isSubmitting ? t('properties.creating_property') : t('properties.save_continue_units') }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.property-create-page {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.top-nav-bar {
  display: flex;
  align-items: center;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 500;
  transition: color 0.15s ease;
}

.back-link:hover {
  color: var(--text-main);
}

.form-shell {
  padding: 2rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 1.25rem;
}

.header-icon-box {
  width: 42px;
  height: 42px;
  border-radius: var(--radius-sm);
  background: var(--primary-subtle);
  color: #818cf8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-header h2 {
  font-size: 1.4rem;
}

.subtitle {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-top: 0.2rem;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 1.5rem;
}

.section-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-main);
}

.section-hint {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.textarea-field {
  resize: vertical;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

@media (max-width: 640px) {
  .grid-3 {
    grid-template-columns: 1fr;
  }
}

.amenities-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.amenity-chip {
  padding: 0.4rem 0.75rem;
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.amenity-chip:hover {
  background: var(--bg-surface-hover);
  color: var(--text-main);
}

.amenity-chip.selected {
  background: var(--primary-subtle);
  border-color: var(--primary);
  color: #818cf8;
  font-weight: 600;
}

.custom-amenity-row {
  display: flex;
  gap: 0.5rem;
  max-width: 380px;
}

.input-sm {
  padding: 0.45rem 0.75rem;
  font-size: 0.85rem;
}

.btn-sm {
  padding: 0.45rem 0.75rem;
  font-size: 0.85rem;
  gap: 0.3rem;
}

.mt-3 {
  margin-top: 0.75rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}
</style>
