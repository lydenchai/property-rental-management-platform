<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  Building, 
  ArrowLeft, 
  Plus, 
  MapPin, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  X,
  Layers,
  ExternalLink
} from '@lucide/vue';
import PropertyMap from '../../../../components/common/PropertyMap.vue';
import type { ApiResponse } from '../../../../../shared/types/api';
import AppTableCard from '../../../../components/common/AppTableCard.vue';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  title: 'Property Units & Inventory',
});

const route = useRoute();
const propertyId = route.params.id as string;

interface Unit {
  id: string;
  propertyId: string;
  unitNumber: string;
  floor: number;
  sizeSqFt: number;
  bedrooms: number;
  bathrooms: number;
  rentAmount: number;
  depositAmount: number;
  status: string;
  createdAt: string;
}

interface PropertyDetail {
  id: string;
  title: string;
  description: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  amenities: string[];
  units: Unit[];
  unitsCount: number;
  availableUnitsCount: number;
  latitude?: number;
  longitude?: number;
}

const property = ref<PropertyDetail | null>(null);
const isLoading = ref(true);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);

// Units pagination state
const currentUnitPage = ref(1);
const unitPageSize = ref(5);

const paginatedUnits = computed(() => {
  if (!property.value?.units) return [];
  const start = (currentUnitPage.value - 1) * unitPageSize.value;
  return property.value.units.slice(start, start + unitPageSize.value);
});

// Unit modal state
const isUnitModalOpen = ref(false);
const editingUnitId = ref<string | null>(null);
const isSubmittingUnit = ref(false);

const unitForm = ref({
  unitNumber: '',
  floor: 1,
  sizeSqFt: 55,
  bedrooms: 1,
  bathrooms: 1,
  rentAmount: 650,
  depositAmount: 650,
  status: 'AVAILABLE',
});

// Delete confirmation modal state
const unitToDelete = ref<Unit | null>(null);
const isDeleting = ref(false);

async function loadProperty() {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    const res = await $fetch<ApiResponse<{ property: PropertyDetail }>>(`/api/v1/properties/${propertyId}`);
    if (res.success && res.data) {
      property.value = res.data.property;
    } else {
      errorMessage.value = res.error?.message || 'Property not found';
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.error?.message || err?.message || 'Error loading property';
  } finally {
    isLoading.value = false;
  }
}

function openAddUnitModal() {
  editingUnitId.value = null;
  unitForm.value = {
    unitNumber: '',
    floor: 1,
    sizeSqFt: 55,
    bedrooms: 1,
    bathrooms: 1,
    rentAmount: 650,
    depositAmount: 650,
    status: 'AVAILABLE',
  };
  isUnitModalOpen.value = true;
}

function openEditUnitModal(unit: Unit) {
  editingUnitId.value = unit.id;
  unitForm.value = {
    unitNumber: unit.unitNumber,
    floor: unit.floor,
    sizeSqFt: unit.sizeSqFt,
    bedrooms: unit.bedrooms,
    bathrooms: unit.bathrooms,
    rentAmount: unit.rentAmount,
    depositAmount: unit.depositAmount,
    status: unit.status,
  };
  isUnitModalOpen.value = true;
}

async function handleSaveUnit() {
  isSubmittingUnit.value = true;
  errorMessage.value = null;

  try {
    if (editingUnitId.value) {
      // Update
      const res = await $fetch<ApiResponse<{ unit: Unit }>>(`/api/v1/units/${editingUnitId.value}`, {
        method: 'PUT',
        body: unitForm.value,
      });
      if (res.success) {
        successMessage.value = `Unit ${unitForm.value.unitNumber} updated successfully.`;
        isUnitModalOpen.value = false;
        await loadProperty();
      }
    } else {
      // Create
      const res = await $fetch<ApiResponse<{ unit: Unit }>>(`/api/v1/properties/${propertyId}/units`, {
        method: 'POST',
        body: unitForm.value,
      });
      if (res.success) {
        successMessage.value = `Unit ${unitForm.value.unitNumber} added successfully.`;
        isUnitModalOpen.value = false;
        await loadProperty();
      }
    }
    setTimeout(() => {
      successMessage.value = null;
    }, 3500);
  } catch (err: any) {
    errorMessage.value = err?.data?.error?.message || err?.message || 'Failed to save unit';
  } finally {
    isSubmittingUnit.value = false;
  }
}

function confirmDeleteUnit(unit: Unit) {
  unitToDelete.value = unit;
}

async function executeDeleteUnit() {
  if (!unitToDelete.value) return;
  isDeleting.value = true;
  try {
    const res = await $fetch<ApiResponse<any>>(`/api/v1/units/${unitToDelete.value.id}`, {
      method: 'DELETE',
    });
    if (res.success) {
      successMessage.value = `Unit ${unitToDelete.value.unitNumber} removed.`;
      unitToDelete.value = null;
      await loadProperty();
      setTimeout(() => {
        successMessage.value = null;
      }, 3500);
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.error?.message || err?.message || 'Failed to delete unit';
  } finally {
    isDeleting.value = false;
  }
}

onMounted(() => {
  loadProperty();
});
</script>

<template>
  <div class="property-manage-page">
    <div class="top-nav-bar">
      <NuxtLink to="/dashboard/properties" class="back-link">
        <ArrowLeft :size="15" />
        <span>Back to Properties</span>
      </NuxtLink>
    </div>

    <!-- Alert Messages -->
    <div v-if="successMessage" class="alert-success">
      <CheckCircle2 :size="16" />
      <span>{{ successMessage }}</span>
    </div>

    <div v-if="errorMessage" class="alert-error">
      <AlertCircle :size="16" />
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading property and units...</p>
    </div>

    <div v-else-if="property" class="content-container">
      <!-- Property Summary Card -->
      <div class="property-summary card-flat">
        <div class="summary-main">
          <div class="prop-badge">Residential Asset</div>
          <h2>{{ property.title }}</h2>
          <div class="location-row">
            <MapPin :size="14" class="loc-icon" />
            <span>{{ property.addressLine1 }}, {{ property.city }}, {{ property.state }} {{ property.postalCode }}</span>
          </div>
        </div>

        <div class="summary-stats">
          <div class="stat-pill">
            <span class="pill-label">Total Units</span>
            <span class="pill-val">{{ property.unitsCount }}</span>
          </div>
          <div class="stat-pill">
            <span class="pill-label">Available</span>
            <span class="pill-val text-emerald">{{ property.availableUnitsCount }}</span>
          </div>
          <div class="stat-actions">
            <NuxtLink :to="`/properties/${property.id}`" target="_blank" class="btn-secondary btn-sm" title="View Public Listing">
              <ExternalLink :size="13" />
              <span>Public View</span>
            </NuxtLink>
            <NuxtLink :to="`/dashboard/properties/${property.id}/edit`" class="btn-secondary btn-sm">
              <Edit3 :size="13" />
              <span>Edit Property</span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Property Location Map (OpenFreeMap) -->
      <div class="property-map-section">
        <ClientOnly>
          <PropertyMap
            :latitude="property.latitude ?? 11.5516"
            :longitude="property.longitude ?? 104.9224"
            :title="property.title"
            :address="property.addressLine1"
            :city="property.city"
            height="340px"
          />
          <template #fallback>
            <div class="map-placeholder card-flat">
              <p>Loading OpenFreeMap vector tiles...</p>
            </div>
          </template>
        </ClientOnly>
      </div>

      <!-- Units Management Section using shared AppTableCard -->
      <AppTableCard
        title="Unit Inventory"
        subtitle="Manage pricing, floor area, and occupancy status for each individual unit."
        :show-search="false"
        :is-empty="!property.units || property.units.length === 0"
        empty-title="No units configured yet"
        empty-description="Add individual apartments or office units with their respective monthly rent and square footage."
        :empty-icon="Layers"
        v-model:current-page="currentUnitPage"
        v-model:page-size="unitPageSize"
        :total-items="property.units?.length || 0"
        item-name="units"
      >
        <template #toolbar-end>
          <button @click="openAddUnitModal" class="btn-primary btn-sm">
            <Plus :size="14" />
            <span>Add Unit</span>
          </button>
        </template>

        <template #empty-action>
          <button @click="openAddUnitModal" class="btn-primary mt-2">
            <Plus :size="14" />
            <span>Add First Unit</span>
          </button>
        </template>

        <table class="data-table">
            <thead>
              <tr>
                <th>Unit #</th>
                <th>Floor</th>
                <th>Size</th>
                <th>Bedrooms / Bath</th>
                <th>Monthly Rent</th>
                <th>Deposit</th>
                <th>Occupancy Status</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="unit in paginatedUnits" :key="unit.id">
                <td class="font-semibold">Unit {{ unit.unitNumber }}</td>
                <td>Level {{ unit.floor }}</td>
                <td>{{ unit.sizeSqFt }} sq m</td>
                <td>
                  {{ unit.bedrooms === 0 ? 'Studio' : `${unit.bedrooms} Bed` }} / {{ unit.bathrooms }} Bath
                </td>
                <td class="font-semibold">${{ unit.rentAmount.toLocaleString() }}</td>
                <td>${{ unit.depositAmount.toLocaleString() }}</td>
                <td>
                  <span
                    :class="[
                      'badge',
                      unit.status === 'AVAILABLE' ? 'badge-success' :
                      unit.status === 'OCCUPIED' ? 'badge-warning' :
                      unit.status === 'RESERVED' ? 'badge-landlord' : 'badge-danger'
                    ]"
                  >
                    {{ unit.status }}
                  </span>
                </td>
                <td class="text-right">
                  <div class="action-btn-group">
                    <button
                      @click="openEditUnitModal(unit)"
                      class="btn-secondary btn-icon-sm"
                      title="Edit Unit"
                    >
                      <Edit3 :size="13" />
                      <span>Edit</span>
                    </button>
                    <button
                      @click="confirmDeleteUnit(unit)"
                      class="btn-secondary btn-icon-sm text-danger"
                      title="Delete Unit"
                    >
                      <Trash2 :size="13" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
        </table>
      </AppTableCard>
    </div>

    <!-- Unit Add / Edit Modal -->
    <div v-if="isUnitModalOpen" class="modal-backdrop">
      <div class="modal-card card-flat">
        <div class="modal-header">
          <h3>{{ editingUnitId ? 'Edit Unit' : 'Add Unit to Property' }}</h3>
          <button @click="isUnitModalOpen = false" class="modal-close">&times;</button>
        </div>

        <form @submit.prevent="handleSaveUnit" class="modal-form">
          <div class="grid-2">
            <div class="form-group">
              <label for="u-number" class="form-label">Unit Number *</label>
              <input
                id="u-number"
                v-model="unitForm.unitNumber"
                type="text"
                placeholder="e.g. 101A"
                required
                class="input-field"
              />
            </div>

            <div class="form-group">
              <label for="u-floor" class="form-label">Floor Level *</label>
              <input
                id="u-floor"
                v-model.number="unitForm.floor"
                type="number"
                min="0"
                required
                class="input-field"
              />
            </div>
          </div>

          <div class="grid-3">
            <div class="form-group">
              <label for="u-size" class="form-label">Area (sq m) *</label>
              <input
                id="u-size"
                v-model.number="unitForm.sizeSqFt"
                type="number"
                min="10"
                required
                class="input-field"
              />
            </div>

            <div class="form-group">
              <label for="u-beds" class="form-label">Bedrooms *</label>
              <input
                id="u-beds"
                v-model.number="unitForm.bedrooms"
                type="number"
                min="0"
                required
                class="input-field"
              />
            </div>

            <div class="form-group">
              <label for="u-baths" class="form-label">Bathrooms *</label>
              <input
                id="u-baths"
                v-model.number="unitForm.bathrooms"
                type="number"
                min="0.5"
                step="0.5"
                required
                class="input-field"
              />
            </div>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label for="u-rent" class="form-label">Monthly Rent ($) *</label>
              <input
                id="u-rent"
                v-model.number="unitForm.rentAmount"
                type="number"
                min="1"
                required
                class="input-field"
              />
            </div>

            <div class="form-group">
              <label for="u-deposit" class="form-label">Security Deposit ($) *</label>
              <input
                id="u-deposit"
                v-model.number="unitForm.depositAmount"
                type="number"
                min="0"
                required
                class="input-field"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="u-status" class="form-label">Unit Status</label>
            <select id="u-status" v-model="unitForm.status" class="input-field">
              <option value="AVAILABLE">AVAILABLE — Ready to lease</option>
              <option value="RESERVED">RESERVED — Application approved</option>
              <option value="OCCUPIED">OCCUPIED — Active lease</option>
              <option value="MAINTENANCE">MAINTENANCE — Repair in progress</option>
              <option value="UNDER_RENOVATION">UNDER_RENOVATION</option>
            </select>
          </div>

          <div class="modal-actions">
            <button type="button" @click="isUnitModalOpen = false" class="btn-secondary">
              Cancel
            </button>
            <button type="submit" :disabled="isSubmittingUnit" class="btn-primary">
              <span>{{ isSubmittingUnit ? 'Saving...' : 'Save Unit' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Unit Delete Confirmation Modal -->
    <div v-if="unitToDelete" class="modal-backdrop">
      <div class="modal-card card-flat">
        <div class="modal-header">
          <h3>Remove Unit</h3>
          <button @click="unitToDelete = null" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to remove <strong>Unit {{ unitToDelete.unitNumber }}</strong>?</p>
          <div class="modal-actions">
            <button @click="executeDeleteUnit" :disabled="isDeleting" class="btn-primary btn-danger-action">
              <span>{{ isDeleting ? 'Removing...' : 'Confirm Remove' }}</span>
            </button>
            <button @click="unitToDelete = null" class="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.property-manage-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

.content-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.property-summary {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.25rem;
}

.summary-main {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.prop-badge {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-indigo-accent);
}

.summary-main h2 {
  font-size: 1.5rem;
}

.location-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.loc-icon {
  color: var(--text-dim);
}

.summary-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  padding: 0.45rem 0.85rem;
  border-radius: var(--radius-sm);
}

.pill-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-dim);
}

.pill-val {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-main);
}

.text-emerald {
  color: var(--color-emerald-accent);
}

.stat-actions {
  display: flex;
  gap: 0.5rem;
}

.units-shell {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.units-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.units-header h3 {
  font-size: 1.25rem;
}

.subtitle {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-top: 0.2rem;
}

.font-semibold {
  font-weight: 600;
}

.text-right {
  text-align: right;
}

.action-btn-group {
  display: inline-flex;
  gap: 0.35rem;
}

.btn-icon-sm {
  padding: 0.35rem 0.65rem;
  font-size: 0.8rem;
  gap: 0.3rem;
}

.text-danger {
  color: #f87171;
}

.text-danger:hover {
  border-color: rgba(239, 68, 68, 0.4);
}

.empty-units-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.empty-icon {
  color: var(--text-dim);
  margin-bottom: 0.5rem;
}

.mt-2 {
  margin-top: 0.75rem;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1.5rem;
}

.modal-card {
  width: 100%;
  max-width: 520px;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 0.75rem;
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.btn-danger-action {
  background-color: var(--accent-rose);
}

.btn-danger-action:hover {
  background-color: #dc2626;
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
