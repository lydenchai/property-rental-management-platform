<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import {
  Building,
  Plus,
  MapPin,
  Layers,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Calendar
} from '@lucide/vue';
import { usePropertyStore } from '../../../stores/property.store';
import type { PropertyItem } from '~~/shared/types';
import AppTableCard from '../../../components/common/AppTableCard.vue';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  title: 'Property Portfolio',
});

const { t } = useI18n();
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
const activeFilter = ref<'ALL' | 'AVAILABLE' | 'FULL'>('ALL');

// Delete confirmation modal state
const propertyToDelete = ref<PropertyItem | null>(null);
const isDeleting = ref(false);

const availableCount = computed(() => {
  return properties.value.filter((p) => (p.availableUnitsCount ?? 0) > 0).length;
});

const fullCount = computed(() => {
  return properties.value.filter(
    (p) => (p.unitsCount ?? 0) > 0 && (p.availableUnitsCount ?? 0) === 0
  ).length;
});

const filteredProperties = computed(() => {
  let list = properties.value;

  // Filter tab
  if (activeFilter.value === 'AVAILABLE') {
    list = list.filter((p) => (p.availableUnitsCount ?? 0) > 0);
  } else if (activeFilter.value === 'FULL') {
    list = list.filter(
      (p) => (p.unitsCount ?? 0) > 0 && (p.availableUnitsCount ?? 0) === 0
    );
  }

  // Search filter
  if (!searchQuery.value.trim()) return list;
  const q = searchQuery.value.toLowerCase();
  return list.filter(
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

watch([searchQuery, activeFilter], () => {
  currentPage.value = 1;
});

function formatLocation(prop: PropertyItem) {
  const city = prop.city?.trim() || '';
  const state = prop.state?.trim() || '';
  if (!city && !state) return prop.country || 'Cambodia';
  if (!state || city.toLowerCase() === state.toLowerCase()) return city;
  return `${city}, ${state}`;
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function confirmDelete(property: PropertyItem) {
  propertyToDelete.value = property;
}

const toast = useToast();

async function executeDelete() {
  if (!propertyToDelete.value) return;
  isDeleting.value = true;
  try {
    const title = propertyToDelete.value.title;
    const res = await propertyStore.deleteProperty(propertyToDelete.value.id);
    if (res.success) {
      toast.success(`Property "${title}" and its units have been deleted.`);
      propertyToDelete.value = null;
    } else {
      toast.error(res.error || 'Failed to delete property.');
    }
  } catch (err: any) {
    toast.error(err?.message || 'Failed to delete property.');
  } finally {
    isDeleting.value = false;
  }
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
        <h1>{{ t('properties.management_title') }}</h1>
        <p class="subtitle">{{ t('properties.management_subtitle') }}</p>
      </div>

      <NuxtLink to="/dashboard/properties/create" class="btn-primary">
        <Plus :size="16" />
        <span>{{ t('properties.add_property') }}</span>
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
        <NuxtLink v-if="errorMessage.toLowerCase().includes('logged in')"
          :to="{ path: '/login', query: { redirect: $route.fullPath } }" class="alert-action-btn">
          {{ t('nav.sign_in') }}
        </NuxtLink>
      </div>
    </div>

    <!-- Overview Metrics Row -->
    <div class="metrics-row">
      <div class="stat-card card-flat">
        <span class="stat-label">{{ t('properties.total_properties') }}</span>
        <div class="stat-value">{{ totalProperties }}</div>
        <span class="stat-desc">{{ t('properties.active_in_portfolio') }}</span>
      </div>

      <div class="stat-card card-flat">
        <span class="stat-label">{{ t('properties.total_units_label') }}</span>
        <div class="stat-value">{{ totalUnits }}</div>
        <span class="stat-desc">{{ t('properties.currently_available', { count: totalAvailable }) }}</span>
      </div>

      <div class="stat-card card-flat">
        <span class="stat-label">{{ t('properties.portfolio_occupancy') }}</span>
        <div class="stat-value">{{ occupancyRate }}</div>
        <span class="stat-desc">{{ t('properties.leased_vs_capacity') }}</span>
      </div>
    </div>

    <!-- Properties Table using shared AppTableCard -->
    <AppTableCard v-model:search="searchQuery" :search-placeholder="t('properties.filter_by_title_location')"
      :is-loading="isLoading" :is-empty="filteredProperties.length === 0" :empty-title="t('properties.no_properties')"
      :empty-description="t('properties.first_property_desc')"
      :empty-icon="Building" v-model:current-page="currentPage" v-model:page-size="pageSize"
      :total-items="filteredProperties.length" :item-name="t('properties.units')">
      <!-- Quick Filter Pills -->
      <template #toolbar-start>
        <div class="filter-btn-group filter-pills">
          <button type="button" class="filter-btn filter-pill" :class="{ active: activeFilter === 'ALL' }"
            @click="activeFilter = 'ALL'">
            <span>{{ t('properties.filter_all_short') }}</span>
            <span class="filter-count pill-count">{{ properties.length }}</span>
          </button>
          <button type="button" class="filter-btn filter-pill" :class="{ active: activeFilter === 'AVAILABLE' }"
            @click="activeFilter = 'AVAILABLE'">
            <span>{{ t('properties.filter_available_short') }}</span>
            <span class="filter-count pill-count pill-count-emerald">{{ availableCount }}</span>
          </button>
          <button type="button" class="filter-btn filter-pill" :class="{ active: activeFilter === 'FULL' }"
            @click="activeFilter = 'FULL'">
            <span>{{ t('properties.filter_full_short') }}</span>
            <span class="filter-count pill-count">{{ fullCount }}</span>
          </button>
        </div>
      </template>

      <template #empty-action>
        <NuxtLink to="/dashboard/properties/create" class="btn-primary mt-2">
          <Plus :size="15" />
          <span>{{ t('properties.add_first_property') }}</span>
        </NuxtLink>
      </template>

      <table class="data-table">
        <thead>
          <tr>
            <th style="min-width: 250px;">{{ t('properties.col_property') }}</th>
            <th style="min-width: 240px;">{{ t('properties.col_location') }}</th>
            <th style="min-width: 170px;">{{ t('properties.col_units_breakdown') }}</th>
            <th style="min-width: 140px;">{{ t('properties.col_rent_range') }}</th>
            <th style="min-width: 130px;">{{ t('properties.col_created_date') }}</th>
            <th class="text-right" style="min-width: 140px;">{{ t('properties.col_actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="prop in paginatedProperties" :key="prop.id">
            <!-- Property Details -->
            <td>
              <div class="prop-cell">
                <div class="prop-icon-box">
                  <Building :size="16" />
                </div>
                <div class="prop-meta">
                  <NuxtLink :to="`/dashboard/properties/${prop.id}`" class="prop-title-link">
                    {{ prop.title }}
                  </NuxtLink>
                  <span class="prop-id-tag">#{{ prop.id.slice(0, 8) }}</span>
                </div>
              </div>
            </td>

            <!-- Location -->
            <td>
              <div class="location-cell">
                <div class="address-line" :title="prop.addressLine1">
                  <MapPin :size="13" class="location-pin-icon" />
                  <span class="address-text">{{ prop.addressLine1 }}</span>
                </div>
                <span class="region-chip">
                  {{ formatLocation(prop) }}
                </span>
              </div>
            </td>

            <!-- Units Breakdown -->
            <td>
              <div class="units-cell">
                <div class="units-primary">
                  <span class="units-count">{{ prop.unitsCount ?? 0 }}</span>
                  <span class="units-label">{{ (prop.unitsCount === 1) ? t('properties.unit_singular') : t('properties.unit_plural') }}</span>
                </div>
                <div class="units-badge-wrap">
                  <span v-if="(prop.availableUnitsCount ?? 0) > 0" class="badge badge-pill badge-success">
                    <span class="badge-dot"></span>
                    <span>{{ t('properties.unit_available_badge', { count: prop.availableUnitsCount }) }}</span>
                  </span>
                  <span v-else-if="(prop.unitsCount ?? 0) > 0" class="badge badge-pill badge-subtle">
                    <span class="badge-dot"></span>
                    <span>{{ t('properties.unit_fully_leased_badge') }}</span>
                  </span>
                  <span v-else class="badge badge-pill badge-warning">
                    <span class="badge-dot"></span>
                    <span>{{ t('properties.unit_no_units_badge') }}</span>
                  </span>
                </div>
              </div>
            </td>

            <!-- Rent Range -->
            <td>
              <div v-if="prop.minRent && prop.minRent > 0" class="rent-cell">
                <div class="rent-amount">
                  ${{ prop.minRent.toLocaleString() }}<span v-if="prop.maxRent && prop.maxRent > prop.minRent"
                    class="rent-dash"> – ${{ prop.maxRent.toLocaleString() }}</span>
                </div>
                <span class="rent-period">{{ t('properties.per_month_short') }}</span>
              </div>
              <div v-else class="rent-empty">
                <span class="text-dim text-xs">—</span>
              </div>
            </td>

            <!-- Created Date -->
            <td>
              <div class="date-cell">
                <Calendar :size="13" class="date-icon" />
                <span class="date-text">{{ formatDate(prop.createdAt) }}</span>
              </div>
            </td>

            <!-- Actions -->
            <td class="text-right">
              <div class="table-actions">
                <NuxtLink :to="`/dashboard/properties/${prop.id}`" class="action-btn action-btn-units"
                  :title="t('properties.manage_units')">
                  <Layers :size="13" />
                  <span>{{ t('properties.manage_units') }}</span>
                </NuxtLink>
                <NuxtLink :to="`/dashboard/properties/${prop.id}/edit`" class="action-btn action-btn-icon"
                  :title="t('properties.edit_property_title')">
                  <Edit3 :size="14" />
                </NuxtLink>
                <button @click="confirmDelete(prop)" class="action-btn action-btn-icon action-btn-danger"
                  :title="t('properties.delete_property')">
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
          <h3>{{ t('properties.delete_modal_title') }}</h3>
          <button @click="propertyToDelete = null" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <p>
            {{ t('properties.delete_modal_confirm', { title: propertyToDelete.title }) }}
          </p>
          <p class="text-muted text-sm">
            {{ t('properties.delete_modal_warning') }}
          </p>
          <div class="modal-actions">
            <button @click="executeDelete" :disabled="isDeleting" class="btn-primary btn-danger-action">
              <Trash2 :size="14" />
              <span>{{ isDeleting ? t('properties.deleting') : t('properties.confirm_deletion') }}</span>
            </button>
            <button @click="propertyToDelete = null" class="btn-secondary">
              {{ t('common.cancel') }}
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
  padding: 1rem 1.25rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-dim);
  letter-spacing: 0.05em;
}

:lang(km) .stat-label {
  letter-spacing: normal;
}

.stat-value {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0.2rem 0;
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

.filter-btn-group,
.filter-pills {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  flex-wrap: wrap;
}

.filter-btn,
.filter-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.42rem 0.85rem;
  font-size: 0.825rem;
  font-weight: 500;
  line-height: 1.25;
  color: var(--text-muted);
  background-color: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.filter-btn:hover,
.filter-pill:hover {
  color: var(--text-main);
  background-color: var(--bg-surface-hover);
  border-color: var(--border-default);
}

.filter-btn.active,
.filter-pill.active {
  color: #ffffff !important;
  background-color: var(--primary) !important;
  border-color: var(--primary) !important;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(37, 99, 235, 0.2);
}

.filter-count,
.pill-count {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.1rem 0.45rem;
  border-radius: var(--radius-full);
  background: var(--bg-primary);
  color: var(--text-dim);
  transition: all 0.15s ease;
}

.filter-btn.active .pill-count,
.filter-pill.active .pill-count {
  background: rgba(255, 255, 255, 0.25) !important;
  color: #ffffff !important;
}

.pill-count-emerald {
  color: var(--accent-emerald);
}

html.dark .pill-count-emerald {
  color: #34d399;
}

/* Property cell */
.prop-cell {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.prop-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #dbeafe;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

html.dark .prop-icon-box {
  background: rgba(37, 99, 235, 0.15);
  color: #60a5fa;
  border-color: rgba(37, 99, 235, 0.3);
}

.prop-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.prop-title-link {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-main);
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 260px;
  transition: color 0.15s ease;
}

.prop-title-link:hover {
  color: #2563eb;
}

html.dark .prop-title-link:hover {
  color: #60a5fa;
}

.prop-id-tag {
  font-family: monospace;
  font-size: 0.7rem;
  color: var(--text-dim);
  letter-spacing: 0.02em;
}

/* Location cell */
.location-cell {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  max-width: 320px;
}

.address-line {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--text-main);
  font-size: 0.825rem;
}

.location-pin-icon {
  color: #94a3b8;
  flex-shrink: 0;
}

.address-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-main);
}

.region-chip {
  display: inline-block;
  font-size: 0.725rem;
  color: var(--text-muted);
  background: #f1f5f9;
  padding: 1px 6px;
  border-radius: 4px;
  width: fit-content;
  border: 1px solid #e2e8f0;
}

html.dark .region-chip {
  background: #27272a;
  color: #a1a1aa;
  border-color: rgba(255, 255, 255, 0.08);
}

/* Units cell */
.units-cell {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.units-primary {
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
}

.units-count {
  font-size: 0.925rem;
  font-weight: 700;
  color: var(--text-main);
}

.units-label {
  font-size: 0.775rem;
  color: var(--text-muted);
  font-weight: 500;
}

.units-badge-wrap {
  display: flex;
  align-items: center;
}

.badge-status {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 9999px;
  line-height: 1.2;
}

.badge-status-emerald {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

html.dark .badge-status-emerald {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.3);
}

.badge-status-neutral {
  background: #f4f4f5;
  color: #52525b;
  border: 1px solid #e4e4e7;
}

html.dark .badge-status-neutral {
  background: #27272a;
  color: #a1a1aa;
  border-color: #3f3f46;
}

.badge-status-amber {
  background: #fffbeb;
  color: #92400e;
  border: 1px solid #fde68a;
}

html.dark .badge-status-amber {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border-color: rgba(245, 158, 11, 0.3);
}

.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot-emerald {
  background: #10b981;
}

.status-dot-neutral {
  background: #71717a;
}

.status-dot-amber {
  background: #f59e0b;
}

/* Rent cell */
.rent-cell {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.rent-amount {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: -0.01em;
}

.rent-dash {
  font-weight: 600;
}

.rent-period {
  font-size: 0.725rem;
  color: var(--text-dim);
}

.rent-empty {
  color: var(--text-dim);
}

/* Date cell */
.date-cell {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-muted);
  font-size: 0.8rem;
}

.date-icon {
  color: #94a3b8;
  flex-shrink: 0;
}

.date-text {
  font-variant-numeric: tabular-nums;
}

/* Actions */
.text-right {
  text-align: right;
}

.table-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  justify-content: flex-end;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface);
  color: var(--text-muted);
  border-radius: var(--radius-sm);
  cursor: pointer;
  text-decoration: none;
  transition: all 0.15s ease;
}

.action-btn:hover {
  color: var(--text-main);
  border-color: var(--border-default);
  background: var(--bg-hover);
}

.action-btn-units {
  padding: 0.35rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-main);
}

.action-btn-units:hover {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1d4ed8;
}

html.dark .action-btn-units:hover {
  background: rgba(37, 99, 235, 0.15);
  border-color: rgba(37, 99, 235, 0.4);
  color: #93c5fd;
}

.action-btn-icon {
  width: 30px;
  height: 30px;
  padding: 0;
}

.action-btn-danger:hover {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

html.dark .action-btn-danger:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #f87171;
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
