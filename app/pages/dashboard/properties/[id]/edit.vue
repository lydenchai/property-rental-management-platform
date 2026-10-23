<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ArrowLeft, Building, Plus, CheckCircle2, AlertCircle } from '@lucide/vue';
import { usePropertyStore } from '../../../../stores/property.store';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  title: 'Edit Property Details',
});

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
      country: p.country || 'US',
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

async function handleUpdateProperty() {
  const res = await updateProperty(propertyId, form.value);
  if (res.success) {
    router.push(`/dashboard/properties/${propertyId}`);
  }
}

onMounted(() => {
  loadProperty();
});
</script>

<template>
  <div class="property-edit-page">
    <div class="top-nav-bar">
      <NuxtLink :to="`/dashboard/properties/${propertyId}`" class="back-link">
        <ArrowLeft :size="15" />
        <span>Back to Property</span>
      </NuxtLink>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading property details...</p>
    </div>

    <div v-else class="form-shell card-flat">
      <div class="form-header">
        <div class="header-icon-box">
          <Building :size="20" />
        </div>
        <div>
          <h2>Edit Property</h2>
          <p class="subtitle">Modify listing information, building description, and community amenities.</p>
        </div>
      </div>

      <div v-if="errorMessage" class="alert-error">
        <AlertCircle :size="16" />
        <span>{{ errorMessage }}</span>
      </div>

      <form @submit.prevent="handleUpdateProperty" class="create-form">
        <div class="form-section">
          <h3 class="section-title">Property Details</h3>
          
          <div class="form-group">
            <label for="prop-title" class="form-label">Property Title *</label>
            <input
              id="prop-title"
              v-model="form.title"
              type="text"
              required
              class="input-field"
            />
          </div>

          <div class="form-group">
            <label for="prop-desc" class="form-label">Description *</label>
            <textarea
              id="prop-desc"
              v-model="form.description"
              rows="4"
              required
              class="input-field textarea-field"
            ></textarea>
          </div>
        </div>

        <div class="form-section">
          <h3 class="section-title">Address & Location</h3>

          <div class="form-group">
            <label for="prop-addr" class="form-label">Street Address *</label>
            <input
              id="prop-addr"
              v-model="form.addressLine1"
              type="text"
              required
              class="input-field"
            />
          </div>

          <div class="grid-3">
            <div class="form-group">
              <label for="prop-city" class="form-label">City *</label>
              <input
                id="prop-city"
                v-model="form.city"
                type="text"
                required
                class="input-field"
              />
            </div>

            <div class="form-group">
              <label for="prop-state" class="form-label">State *</label>
              <input
                id="prop-state"
                v-model="form.state"
                type="text"
                required
                class="input-field"
              />
            </div>

            <div class="form-group">
              <label for="prop-zip" class="form-label">Postal / Zip Code *</label>
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

        <div class="form-section">
          <h3 class="section-title">Amenities & Features</h3>
          <div class="amenities-picker">
            <button
              v-for="item in standardAmenities"
              :key="item"
              type="button"
              @click="toggleAmenity(item)"
              class="amenity-chip"
              :class="{ selected: form.amenities.includes(item) }"
            >
              <span>{{ item }}</span>
            </button>
          </div>

          <div class="custom-amenity-row mt-3">
            <input
              v-model="newAmenity"
              type="text"
              placeholder="Add custom amenity..."
              class="input-field input-sm"
              @keydown.enter.prevent="addCustomAmenity"
            />
            <button type="button" @click="addCustomAmenity" class="btn-secondary btn-sm">
              <Plus :size="14" />
              <span>Add</span>
            </button>
          </div>
        </div>

        <div class="form-actions">
          <NuxtLink :to="`/dashboard/properties/${propertyId}`" class="btn-secondary">
            Cancel
          </NuxtLink>
          <button type="submit" :disabled="isSubmitting" class="btn-primary">
            <span>{{ isSubmitting ? 'Saving Changes...' : 'Save Changes' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.property-edit-page {
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

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 1rem;
  color: var(--text-muted);
}

.loading-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--border-subtle);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
