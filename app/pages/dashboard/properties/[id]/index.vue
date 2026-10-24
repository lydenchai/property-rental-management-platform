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
import AppTableCard from '../../../../components/common/AppTableCard.vue';
import { usePropertyStore } from '../../../../stores/property.store';
import type { PropertyDetail, UnitItem as Unit } from '~~/shared/types';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  title: 'Property Units & Inventory',
});

const { t } = useI18n();
const route = useRoute();
const propertyId = route.params.id as string;
const propertyStore = usePropertyStore();

const {
  currentProperty: property,
  isLoading,
  isSubmittingUnit,
  isDeleting,
  errorMessage,
} = propertyStore;

const {
  fetchPropertyById,
  createUnit,
  updateUnit,
  deleteUnit,
} = propertyStore;

const loadProperty = () => fetchPropertyById(propertyId);

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

const toast = useToast();

function formatUnitStatus(status: string) {
  switch (status) {
    case 'AVAILABLE': return t('properties.status.vacant');
    case 'OCCUPIED': return t('properties.status.occupied');
    case 'RESERVED': return t('properties.status.reserved');
    case 'MAINTENANCE': return t('properties.status.maintenance');
    default: return status ? status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : 'Unknown';
  }
}

function getUnitBadgeClass(status: string) {
  switch (status) {
    case 'AVAILABLE': return 'badge-success';
    case 'OCCUPIED': return 'badge-warning';
    case 'RESERVED': return 'badge-info';
    case 'MAINTENANCE': return 'badge-danger';
    default: return 'badge-subtle';
  }
}

async function handleSaveUnit() {
  try {
    if (editingUnitId.value) {
      const res = await updateUnit(propertyId, editingUnitId.value, unitForm.value);
      if (res.success) {
        toast.success(`Unit ${unitForm.value.unitNumber} updated successfully.`);
        isUnitModalOpen.value = false;
      } else {
        toast.error(res.error || 'Failed to update unit.');
      }
    } else {
      const res = await createUnit(propertyId, unitForm.value);
      if (res.success) {
        toast.success(`Unit ${unitForm.value.unitNumber} added successfully.`);
        isUnitModalOpen.value = false;
      } else {
        toast.error(res.error || 'Failed to add unit.');
      }
    }
  } catch (err: any) {
    toast.error(err?.message || 'Failed to save unit.');
  }
}

function confirmDeleteUnit(unit: Unit) {
  unitToDelete.value = unit;
}

async function executeDeleteUnit() {
  if (!unitToDelete.value) return;
  try {
    const res = await deleteUnit(propertyId, unitToDelete.value.id);
    if (res.success) {
      toast.success(`Unit ${unitToDelete.value.unitNumber} removed.`);
      unitToDelete.value = null;
    } else {
      toast.error(res.error || 'Failed to delete unit.');
    }
  } catch (err: any) {
    toast.error(err?.message || 'Failed to delete unit.');
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
        <span>{{ t('properties.back_to_properties') }}</span>
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
      <p>{{ t('properties.loading_property_units') }}</p>
    </div>

    <div v-else-if="property" class="content-container">
      <!-- Property Summary Card -->
      <div class="property-summary card-flat">
        <div class="summary-main">
          <div class="prop-badge">{{ t('properties.residential_asset') }}</div>
          <h2>{{ property.title }}</h2>
          <div class="location-row">
            <MapPin :size="14" class="loc-icon" />
            <span>{{ property.addressLine1 }}, {{ property.city }}, {{ property.state }} {{ property.postalCode }}</span>
          </div>
        </div>

        <div class="summary-stats">
          <div class="stat-pill">
            <span class="pill-label">{{ t('properties.total_units_label') }}</span>
            <span class="pill-val">{{ property.unitsCount }}</span>
          </div>
          <div class="stat-pill">
            <span class="pill-label">{{ t('properties.filter_available_short') }}</span>
            <span class="pill-val text-emerald">{{ property.availableUnitsCount }}</span>
          </div>
          <div class="stat-actions">
            <NuxtLink :to="`/properties/${property.id}`" target="_blank" class="btn-secondary btn-sm"
              :title="t('properties.public_view')">
              <ExternalLink :size="13" />
              <span>{{ t('properties.public_view') }}</span>
            </NuxtLink>
            <NuxtLink :to="`/dashboard/properties/${property.id}/edit`" class="btn-secondary btn-sm">
              <Edit3 :size="13" />
              <span>{{ t('properties.edit_property_title') }}</span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Property Location Map (OpenFreeMap) -->
      <div class="property-map-section">
        <ClientOnly>
          <PropertyMap :latitude="property.latitude ?? 11.5516" :longitude="property.longitude ?? 104.9224"
            :title="property.title" :address="property.addressLine1" :city="property.city" height="340px" />
          <template #fallback>
            <div class="map-placeholder card-flat">
              <p>{{ t('common.please_wait') }}</p>
            </div>
          </template>
        </ClientOnly>
      </div>

      <!-- Units Management Section using shared AppTableCard -->
      <AppTableCard :title="t('properties.unit_inventory')"
        :subtitle="t('properties.unit_inventory_desc')" :show-search="false"
        :is-empty="!property.units || property.units.length === 0" :empty-title="t('properties.no_units_yet')"
        :empty-description="t('properties.no_units_yet_desc')"
        :empty-icon="Layers" v-model:current-page="currentUnitPage" v-model:page-size="unitPageSize"
        :total-items="property.units?.length || 0" :item-name="t('properties.units')">
        <template #toolbar-end>
          <button @click="openAddUnitModal" class="btn-primary btn-sm">
            <Plus :size="14" />
            <span>{{ t('properties.add_unit') }}</span>
          </button>
        </template>

        <template #empty-action>
          <button @click="openAddUnitModal" class="btn-primary mt-2">
            <Plus :size="14" />
            <span>{{ t('properties.add_first_unit') }}</span>
          </button>
        </template>

        <table class="data-table">
          <thead>
            <tr>
              <th>{{ t('properties.col_unit_number') }}</th>
              <th>{{ t('properties.col_floor') }}</th>
              <th>{{ t('properties.col_size') }}</th>
              <th>{{ t('properties.col_bedrooms_bath') }}</th>
              <th>{{ t('properties.col_monthly_rent') }}</th>
              <th>{{ t('properties.col_deposit') }}</th>
              <th>{{ t('properties.col_occupancy_status') }}</th>
              <th class="text-right">{{ t('properties.col_actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="unit in paginatedUnits" :key="unit.id">
              <td class="font-semibold">{{ t('properties.unit_label', { number: unit.unitNumber }) }}</td>
              <td>{{ t('properties.level', { floor: unit.floor }) }}</td>
              <td>{{ t('properties.sq_m', { size: unit.sizeSqFt }) }}</td>
              <td>
                {{ unit.bedrooms === 0 ? t('properties.studio') : t('properties.bed_short', { count: unit.bedrooms }) }} / {{ t('properties.bath_short', { count: unit.bathrooms }) }}
              </td>
              <td class="font-semibold">${{ unit.rentAmount.toLocaleString() }}</td>
              <td>${{ unit.depositAmount.toLocaleString() }}</td>
              <td>
                <span :class="['badge badge-pill', getUnitBadgeClass(unit.status)]">
                  <span class="badge-dot"></span>
                  <span>{{ formatUnitStatus(unit.status) }}</span>
                </span>
              </td>
              <td class="text-right">
                <div class="action-btn-group">
                  <button @click="openEditUnitModal(unit)" class="btn-secondary btn-icon-sm" :title="t('common.edit')">
                    <Edit3 :size="13" />
                    <span>{{ t('common.edit') }}</span>
                  </button>
                  <button @click="confirmDeleteUnit(unit)" class="btn-secondary btn-icon-sm text-danger"
                    :title="t('properties.remove_unit')">
                    <Trash2 :size="13" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </AppTableCard>
    </div>

    <!-- Fallback when property is not found -->
    <div v-else-if="!isLoading && !property" class="empty-detail-state card-flat">
      <Building :size="36" class="empty-icon" />
      <h3>{{ t('properties.property_not_found') }}</h3>
      <p class="text-muted text-sm">{{ t('properties.property_not_found_desc') }}</p>
      <NuxtLink to="/dashboard/properties" class="btn-primary mt-2">
        <ArrowLeft :size="15" />
        <span>{{ t('properties.return_to_properties') }}</span>
      </NuxtLink>
    </div>

    <!-- Unit Add / Edit Modal -->
    <div v-if="isUnitModalOpen" class="modal-backdrop">
      <div class="modal-card card-flat">
        <div class="modal-header">
          <h3>{{ editingUnitId ? t('properties.edit_unit') : t('properties.add_unit_to_property') }}</h3>
          <button @click="isUnitModalOpen = false" class="modal-close">&times;</button>
        </div>

        <form @submit.prevent="handleSaveUnit" class="modal-form">
          <div class="grid-2">
            <div class="form-group">
              <label for="u-number" class="form-label">{{ t('properties.unit_number_label') }}</label>
              <input id="u-number" v-model="unitForm.unitNumber" type="text" placeholder="e.g. 101A" required
                class="input-field" />
            </div>

            <div class="form-group">
              <label for="u-floor" class="form-label">{{ t('properties.floor_level_label') }}</label>
              <input id="u-floor" v-model.number="unitForm.floor" type="number" min="0" required class="input-field" />
            </div>
          </div>

          <div class="grid-3">
            <div class="form-group">
              <label for="u-size" class="form-label">{{ t('properties.area_sqm_label') }}</label>
              <input id="u-size" v-model.number="unitForm.sizeSqFt" type="number" min="10" required
                class="input-field" />
            </div>

            <div class="form-group">
              <label for="u-beds" class="form-label">{{ t('properties.bedrooms') }} *</label>
              <input id="u-beds" v-model.number="unitForm.bedrooms" type="number" min="0" required
                class="input-field" />
            </div>

            <div class="form-group">
              <label for="u-baths" class="form-label">{{ t('properties.bathrooms') }} *</label>
              <input id="u-baths" v-model.number="unitForm.bathrooms" type="number" min="0.5" step="0.5" required
                class="input-field" />
            </div>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label for="u-rent" class="form-label">{{ t('properties.monthly_rent_label') }}</label>
              <input id="u-rent" v-model.number="unitForm.rentAmount" type="number" min="1" required
                class="input-field" />
            </div>

            <div class="form-group">
              <label for="u-deposit" class="form-label">{{ t('properties.security_deposit_label') }}</label>
              <input id="u-deposit" v-model.number="unitForm.depositAmount" type="number" min="0" required
                class="input-field" />
            </div>
          </div>

          <div class="form-group">
            <label for="u-status" class="form-label">{{ t('properties.unit_status_label') }}</label>
            <select id="u-status" v-model="unitForm.status" class="input-field">
              <option value="AVAILABLE">{{ t('properties.status.vacant') }}</option>
              <option value="RESERVED">{{ t('properties.status.reserved') }}</option>
              <option value="OCCUPIED">{{ t('properties.status.occupied') }}</option>
              <option value="MAINTENANCE">{{ t('properties.status.maintenance') }}</option>
            </select>
          </div>

          <div class="modal-actions">
            <button type="button" @click="isUnitModalOpen = false" class="btn-secondary">
              {{ t('common.cancel') }}
            </button>
            <button type="submit" :disabled="isSubmittingUnit" class="btn-primary">
              <span>{{ isSubmittingUnit ? t('properties.saving') : t('properties.save_unit') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Unit Delete Confirmation Modal -->
    <div v-if="unitToDelete" class="modal-backdrop">
      <div class="modal-card card-flat">
        <div class="modal-header">
          <h3>{{ t('properties.remove_unit') }}</h3>
          <button @click="unitToDelete = null" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <p>{{ t('properties.remove_unit_confirm', { number: unitToDelete.unitNumber }) }}</p>
          <div class="modal-actions">
            <button @click="executeDeleteUnit" :disabled="isDeleting" class="btn-primary btn-danger-action">
              <span>{{ isDeleting ? t('properties.removing') : t('properties.confirm_remove') }}</span>
            </button>
            <button @click="unitToDelete = null" class="btn-secondary">
              {{ t('common.cancel') }}
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
  to {
    transform: rotate(360deg);
  }
}

.empty-detail-state {
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.75rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  margin-top: 1rem;
}

.empty-detail-state h3 {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text-main);
}
</style>
