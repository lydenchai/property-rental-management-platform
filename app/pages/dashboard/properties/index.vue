<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { 
  Building, 
  Plus, 
  MapPin, 
  Layers, 
  DollarSign, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Search,
  CheckCircle2,
  AlertCircle
} from '@lucide/vue';
import { usePropertyStore } from '../../../stores/property.store';
import type { PropertyItem } from '~~/shared/types';
import AppTableCard from '../../../components/common/AppTableCard.vue';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  title: 'Property Portfolio',
});

const propertyStore = usePropertyStore();
const { 
  properties, 
  isLoading, 
  errorMessage, 
  totalProperties, 
  totalUnits, 
  totalAvailable, 
  occupancyRate 
} = propertyStore;

const successMessage = ref<string | null>(null);
const searchQuery = ref('');

// Delete confirmation modal state
const propertyToDelete = ref<PropertyItem | null>(null);
const isDeleting = ref(false);

const filteredProperties = computed(() => {
  if (!searchQuery.value.trim()) return properties.value;
  const q = searchQuery.value.toLowerCase();
  return properties.value.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.addressLine1.toLowerCase().includes(q)
  );
});

// Pagination state
const currentPage = ref(1);
const pageSize = ref(5);

const paginatedProperties = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredProperties.value.slice(start, start + pageSize.value);
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

function confirmDelete(property: PropertyItem) {
  propertyToDelete.value = property;
}

async function executeDelete() {
  if (!propertyToDelete.value) return;
  isDeleting.value = true;
  const res = await propertyStore.deleteProperty(propertyToDelete.value.id);
  if (res.success) {
    successMessage.value = `Property "${propertyToDelete.value.title}" and its units have been deleted.`;
    propertyToDelete.value = null;
    setTimeout(() => {
      successMessage.value = null;
    }, 3500);
  }
  isDeleting.value = false;
}

onMounted(() => {
  propertyStore.fetchProperties();
});
</script>

<template>
  <div class="properties-management-page">
    <!-- Header with Action -->
    <div class="page-top-bar">
      <div>
        <h1>Property Management</h1>
        <p class="subtitle">Oversee real estate assets, configure unit inventories, and track occupancy metrics.</p>
      </div>

      <NuxtLink to="/dashboard/properties/create" class="btn-primary">
        <Plus :size="16" />
        <span>Add Property</span>
      </NuxtLink>
    </div>

    <!-- Alert Messages -->
    <div v-if="successMessage" class="alert-success">
      <CheckCircle2 :size="16" class="alert-icon" />
      <span>{{ successMessage }}</span>
    </div>

    <div v-if="errorMessage" class="alert-error">
      <AlertCircle :size="16" class="alert-icon" />
      <div class="alert-body">
        <span>{{ errorMessage }}</span>
        <NuxtLink
          v-if="errorMessage.toLowerCase().includes('logged in')"
          :to="{ path: '/login', query: { redirect: $route.fullPath } }"
          class="alert-action-btn"
        >
          Sign In
        </NuxtLink>
      </div>
    </div>

    <!-- Overview Metrics Row -->
    <div class="metrics-row">
      <div class="stat-card card-flat">
        <span class="stat-label">Total Properties</span>
        <div class="stat-value">{{ totalProperties }}</div>
        <span class="stat-desc">Active in portfolio</span>
      </div>

      <div class="stat-card card-flat">
        <span class="stat-label">Total Units</span>
        <div class="stat-value">{{ totalUnits }}</div>
        <span class="stat-desc">{{ totalAvailable }} currently available</span>
      </div>

      <div class="stat-card card-flat">
        <span class="stat-label">Portfolio Occupancy</span>
        <div class="stat-value">{{ occupancyRate }}</div>
        <span class="stat-desc">Leased vs. total capacity</span>
      </div>
    </div>

    <!-- Properties Table using shared AppTableCard -->
    <AppTableCard
      v-model:search="searchQuery"
      search-placeholder="Filter properties by title or location..."
      :is-loading="isLoading"
      :is-empty="filteredProperties.length === 0"
      empty-title="No properties found"
      empty-description="Create your first real estate listing to begin managing units and leases."
      :empty-icon="Building"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total-items="filteredProperties.length"
      item-name="properties"
    >
      <template #empty-action>
        <NuxtLink to="/dashboard/properties/create" class="btn-primary mt-2">
          <Plus :size="15" />
          <span>Add First Property</span>
        </NuxtLink>
      </template>

      <table class="data-table">
          <thead>
            <tr>
              <th>Property Details</th>
              <th>Location</th>
              <th>Units Breakdown</th>
              <th>Rent Range</th>
              <th>Created Date</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="prop in paginatedProperties" :key="prop.id">
              <td>
                <div class="prop-cell">
                  <div class="prop-icon-box">
                    <Building :size="16" />
                  </div>
                  <div>
                    <NuxtLink :to="`/dashboard/properties/${prop.id}`" class="prop-link">
                      {{ prop.title }}
                    </NuxtLink>
                  </div>
                </div>
              </td>
              <td>
                <div class="loc-text">
                  <span>{{ prop.addressLine1 }}, {{ prop.city }}, {{ prop.state }}</span>
                </div>
              </td>
              <td>
                <span class="font-semibold">{{ prop.unitsCount }} Units</span>
                <span v-if="prop.availableUnitsCount > 0" class="badge badge-success ml-2">
                  {{ prop.availableUnitsCount }} Available
                </span>
                <span v-else class="badge badge-warning ml-2">
                  Full
                </span>
              </td>
              <td>
                <template v-if="prop.minRent > 0">
                  ${{ prop.minRent.toLocaleString() }}
                  <span v-if="prop.maxRent > prop.minRent"> – ${{ prop.maxRent.toLocaleString() }}</span>
                </template>
                <template v-else>
                  <span class="text-dim">No units</span>
                </template>
              </td>
              <td class="text-muted text-sm">
                {{ new Date(prop.createdAt).toLocaleDateString() }}
              </td>
              <td class="text-right">
                <div class="action-btn-group">
                  <NuxtLink
                    :to="`/dashboard/properties/${prop.id}`"
                    class="btn-secondary btn-icon-sm"
                    title="Manage Units"
                  >
                    <Layers :size="14" />
                    <span>Units</span>
                  </NuxtLink>
                  <NuxtLink
                    :to="`/dashboard/properties/${prop.id}/edit`"
                    class="btn-secondary btn-icon-sm"
                    title="Edit Property"
                  >
                    <Edit3 :size="14" />
                  </NuxtLink>
                  <button
                    @click="confirmDelete(prop)"
                    class="btn-secondary btn-icon-sm text-danger"
                    title="Delete Property"
                  >
                    <Trash2 :size="14" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
      </table>
    </AppTableCard>

    <!-- Delete Confirmation Modal -->
    <div v-if="propertyToDelete" class="modal-backdrop">
      <div class="modal-card card-flat">
        <div class="modal-header">
          <h3>Delete Property</h3>
          <button @click="propertyToDelete = null" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <p>
            Are you sure you want to delete <strong>{{ propertyToDelete.title }}</strong>?
          </p>
          <p class="text-muted text-sm">
            This will soft-delete the property and all its associated units. Active leases will remain in audit history.
          </p>
          <div class="modal-actions">
            <button
              @click="executeDelete"
              :disabled="isDeleting"
              class="btn-primary btn-danger-action"
            >
              <Trash2 :size="14" />
              <span>{{ isDeleting ? 'Deleting...' : 'Confirm Deletion' }}</span>
            </button>
            <button @click="propertyToDelete = null" class="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.properties-management-page {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.page-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-top-bar h1 {
  font-size: 1.6rem;
}

.subtitle {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin-top: 0.2rem;
}

.metrics-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.stat-card {
  padding: 0.85rem 1.15rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-dim);
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0.15rem 0;
}

.stat-desc {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.table-shell {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-wrap {
  position: relative;
  width: 100%;
  max-width: 360px;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-dim);
}

.table-search-input {
  width: 100%;
  background: var(--bg-input);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  padding: 0.55rem 0.75rem 0.55rem 2.25rem;
  color: var(--text-main);
  font-size: 0.875rem;
}

.table-search-input:focus {
  outline: none;
  border-color: var(--border-focus);
}

.prop-cell {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.prop-icon-box {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--primary-subtle);
  color: var(--color-indigo-accent);
  border: 1px solid rgba(79, 70, 229, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.prop-link {
  font-weight: 600;
  color: var(--text-main);
  transition: color 0.15s ease;
}

.prop-link:hover {
  color: var(--color-indigo-accent);
}

.loc-text {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.ml-2 {
  margin-left: 0.5rem;
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

.empty-table-state {
  padding: 3.5rem 1rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-muted);
}

.empty-icon {
  color: var(--text-dim);
  margin-bottom: 0.5rem;
}

.mt-2 {
  margin-top: 0.75rem;
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

/* Modal */
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
  max-width: 460px;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.btn-danger-action {
  background-color: var(--accent-rose);
}

.btn-danger-action:hover {
  background-color: #dc2626;
}
</style>
