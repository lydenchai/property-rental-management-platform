<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { 
  Building, 
  MapPin, 
  Search, 
  SlidersHorizontal, 
  ArrowRight, 
  Check, 
  RotateCcw,
  Sparkles,
  LayoutGrid,
  Map as MapIcon,
  Columns2
} from '@lucide/vue';
import PropertiesMapExplorer from '../../components/common/PropertiesMapExplorer.vue';
import AppPagination from '../../components/common/AppPagination.vue';

interface Property {
  id: string;
  landlordId: string;
  title: string;
  description: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  amenities: string[];
  unitsCount: number;
  availableUnitsCount: number;
  minRent: number;
  maxRent: number;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

const properties = ref<Property[]>([]);
const isLoading = ref<boolean>(true);
const errorMessage = ref<string | null>(null);

// View mode: 'grid' | 'split' | 'map'
const viewMode = ref<'grid' | 'split' | 'map'>('grid');
const activePropertyId = ref<string | null>(null);

// Filters
const searchKeyword = ref('');
const selectedCity = ref('');
const minPrice = ref<number | ''>('');
const maxPrice = ref<number | ''>('');
const selectedBeds = ref<number | ''>('');

async function fetchProperties() {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    const params: Record<string, string> = {};
    if (searchKeyword.value) params.search = searchKeyword.value;
    if (selectedCity.value) params.city = selectedCity.value;
    if (minPrice.value !== '') params.minRent = String(minPrice.value);
    if (maxPrice.value !== '') params.maxRent = String(maxPrice.value);
    if (selectedBeds.value !== '') params.bedrooms = String(selectedBeds.value);

    const queryStr = new URLSearchParams(params).toString();
    const url = `/api/v1/properties${queryStr ? `?${queryStr}` : ''}`;

    const res = await $fetch<ApiResponse<{ properties: Property[]; total: number }>>(url);
    if (res.success && res.data) {
      properties.value = res.data.properties;
      if (properties.value.length > 0 && !activePropertyId.value) {
        activePropertyId.value = properties.value[0]?.id!;
      }
    } else {
      errorMessage.value = res.error?.message || 'Failed to load properties';
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.error?.message || err?.message || 'Network error loading properties';
  } finally {
    isLoading.value = false;
  }
}

// City dropdown options dynamically extracted
const availableCities = computed(() => {
  const cities = new Set<string>();
  properties.value.forEach((p) => {
    if (p.city) cities.add(p.city);
  });
  return Array.from(cities);
});

// Pagination state
const currentPage = ref(1);
const pageSize = ref(6);

const paginatedProperties = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return properties.value.slice(start, start + pageSize.value);
});

watch([searchKeyword, selectedCity, minPrice, maxPrice, selectedBeds], () => {
  currentPage.value = 1;
});

function resetFilters() {
  searchKeyword.value = '';
  selectedCity.value = '';
  minPrice.value = '';
  maxPrice.value = '';
  selectedBeds.value = '';
  currentPage.value = 1;
  fetchProperties();
}

function handleSearch() {
  currentPage.value = 1;
  fetchProperties();
}

function selectProperty(id: string) {
  activePropertyId.value = id;
}

const PROPERTY_COVERS: Record<string, string> = {
  'prop-skyline-01': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
  'prop-oakwood-02': 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
  'prop-metropolitan-03': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  'prop-peak-04': 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=800&q=80',
  'prop-toulkork-05': 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
  'prop-chroy-06': 'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800&q=80',
  'prop-otres-07': 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
  'prop-kampot-08': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
};

function getPropertyThumbnail(property: Property): string {
  return PROPERTY_COVERS[property.id] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';
}

onMounted(() => {
  fetchProperties();
});
</script>

<template>
  <div class="properties-browse-page">
    <!-- Header Section -->
    <section class="page-header">
      <div class="header-container">
        <h1>Explore Available Properties</h1>
        <p class="header-subtitle">
          Discover verified apartments and residences with flexible leasing, clear terms, and interactive vector maps powered by OpenFreeMap.
        </p>
      </div>
    </section>

    <!-- Filter & Search Toolbar -->
    <section class="filter-toolbar card-flat">
      <form @submit.prevent="handleSearch" class="filter-form">
        <div class="search-box">
          <Search :size="16" class="search-icon" />
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="Search by title, street, or neighborhood..."
            class="filter-input"
          />
        </div>

        <div class="filter-controls">
          <div class="filter-group">
            <label class="filter-label">City</label>
            <select v-model="selectedCity" class="filter-select">
              <option value="">All Cities</option>
              <option v-for="c in availableCities" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">Min Rent</label>
            <input
              v-model.number="minPrice"
              type="number"
              placeholder="$ Any"
              class="filter-input-sm"
              min="0"
              step="50"
            />
          </div>

          <div class="filter-group">
            <label class="filter-label">Max Rent</label>
            <input
              v-model.number="maxPrice"
              type="number"
              placeholder="$ Any"
              class="filter-input-sm"
              min="0"
              step="50"
            />
          </div>

          <div class="filter-actions">
            <button type="submit" class="btn-primary filter-btn">
              <SlidersHorizontal :size="14" />
              <span>Apply Filters</span>
            </button>
            <button type="button" @click="resetFilters" class="btn-secondary filter-btn" title="Reset Filters">
              <RotateCcw :size="14" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </form>
    </section>

    <!-- View Mode Switcher Bar -->
    <section class="view-bar-row">
      <div class="results-count">
        <strong>{{ properties.length }}</strong> {{ properties.length === 1 ? 'property' : 'properties' }} found
      </div>

      <div class="view-modes-group">
        <button
          type="button"
          @click="viewMode = 'grid'"
          :class="['view-toggle-btn', { active: viewMode === 'grid' }]"
          title="Grid view of cards"
        >
          <LayoutGrid :size="14" />
          <span>Cards</span>
        </button>
        <button
          type="button"
          @click="viewMode = 'split'"
          :class="['view-toggle-btn', { active: viewMode === 'split' }]"
          title="Split cards and interactive map"
        >
          <Columns2 :size="14" />
          <span>Split Map</span>
        </button>
        <button
          type="button"
          @click="viewMode = 'map'"
          :class="['view-toggle-btn', { active: viewMode === 'map' }]"
          title="Full-screen OpenFreeMap view"
        >
          <MapIcon :size="14" />
          <span>Map View</span>
        </button>
      </div>
    </section>

    <!-- Error State -->
    <div v-if="errorMessage" class="alert-error">
      {{ errorMessage }}
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading available properties...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="properties.length === 0" class="empty-state card-flat">
      <div class="empty-icon-box">
        <Building :size="32" />
      </div>
      <h3>No Properties Found</h3>
      <p>No listings matched your active filter criteria. Try adjusting your search keywords or clearing filters.</p>
      <button @click="resetFilters" class="btn-secondary mt-2">
        <RotateCcw :size="14" />
        <span>Clear All Filters</span>
      </button>
    </div>

    <!-- 1. FULL MAP VIEW -->
    <div v-else-if="viewMode === 'map'" class="full-map-container">
      <ClientOnly>
        <PropertiesMapExplorer
          :properties="properties"
          :selected-id="activePropertyId"
          height="650px"
          @select="selectProperty"
        />
        <template #fallback>
          <div class="map-placeholder card-flat">Loading OpenFreeMap explorer...</div>
        </template>
      </ClientOnly>
    </div>

    <!-- 2. SPLIT VIEW (List on Left, Sticky Map on Right) -->
    <div v-else-if="viewMode === 'split'" class="split-view-layout">
      <!-- Left: Property Cards Column -->
      <div class="split-cards-col">
        <article
          v-for="property in paginatedProperties"
          :key="property.id"
          :class="['property-card card-flat', { 'is-active-card': activePropertyId === property.id }]"
          @mouseenter="selectProperty(property.id)"
          @click="selectProperty(property.id)"
        >
          <!-- Card Image Header -->
          <div class="card-hero-media">
            <img :src="getPropertyThumbnail(property)" :alt="property.title" class="card-hero-img" loading="lazy" />
            <div class="card-hero-overlay">
              <span :class="['badge', property.availableUnitsCount > 0 ? 'badge-success' : 'badge-warning']">
                {{ property.availableUnitsCount > 0 ? `${property.availableUnitsCount} Units` : 'Occupied' }}
              </span>
              <span class="city-pill">{{ property.city }}</span>
            </div>
          </div>

          <div class="property-card-content">
            <div class="property-body">
              <h2 class="property-title">
                <NuxtLink :to="`/properties/${property.id}`">{{ property.title }}</NuxtLink>
              </h2>

              <div class="property-location">
                <MapPin :size="13" class="loc-icon" />
                <span>{{ property.addressLine1 }}, {{ property.city }}</span>
              </div>

              <p class="property-description">
                {{ property.description }}
              </p>
            </div>

            <div class="property-footer">
              <div class="price-box">
                <span class="price-label">Starting From</span>
                <div class="price-val">
                  <template v-if="property.minRent > 0">
                    <span class="rent-highlight">${{ property.minRent.toLocaleString() }}</span>
                    <span class="price-period">/mo</span>
                  </template>
                  <template v-else>
                    <span class="price-inquire">Inquire</span>
                  </template>
                </div>
              </div>

              <NuxtLink :to="`/properties/${property.id}`" class="btn-primary card-cta">
                <span>View</span>
                <ArrowRight :size="13" />
              </NuxtLink>
            </div>
          </div>
        </article>

        <!-- Split View Pagination -->
        <div class="split-pagination card-flat mt-4">
          <AppPagination
            v-model:currentPage="currentPage"
            v-model:pageSize="pageSize"
            :pageSizeOptions="[4, 6, 8, 12]"
            :totalItems="properties.length"
            itemName="properties"
          />
        </div>
      </div>

      <!-- Right: Sticky OpenFreeMap Explorer -->
      <div class="split-map-col">
        <div class="sticky-map-wrapper">
          <ClientOnly>
            <PropertiesMapExplorer
              :properties="properties"
              :selected-id="activePropertyId"
              height="620px"
              @select="selectProperty"
            />
            <template #fallback>
              <div class="map-placeholder card-flat">Loading OpenFreeMap explorer...</div>
            </template>
          </ClientOnly>
        </div>
      </div>
    </div>

    <!-- 3. STANDARD GRID CARDS VIEW -->
    <div v-else class="properties-grid-container">
      <div class="properties-grid">
        <article
          v-for="property in paginatedProperties"
          :key="property.id"
          class="property-card card-flat"
        >
          <!-- Card Image Header -->
          <div class="card-hero-media">
            <img :src="getPropertyThumbnail(property)" :alt="property.title" class="card-hero-img" loading="lazy" />
            <div class="card-hero-overlay">
              <span :class="['badge', property.availableUnitsCount > 0 ? 'badge-success' : 'badge-warning']">
                {{ property.availableUnitsCount > 0 ? `${property.availableUnitsCount} Units Available` : 'Fully Occupied' }}
              </span>
              <span class="city-pill">{{ property.city }}</span>
            </div>
          </div>

          <div class="property-card-content">
            <div class="property-body">
              <h2 class="property-title">
                <NuxtLink :to="`/properties/${property.id}`">{{ property.title }}</NuxtLink>
              </h2>

              <div class="property-location">
                <MapPin :size="14" class="loc-icon" />
                <span>{{ property.addressLine1 }}, {{ property.city }}, {{ property.state }} {{ property.postalCode }}</span>
              </div>

              <p class="property-description">
                {{ property.description }}
              </p>

              <!-- Amenities list -->
              <div v-if="property.amenities?.length" class="amenities-row">
                <span
                  v-for="amenity in property.amenities.slice(0, 4)"
                  :key="amenity"
                  class="amenity-tag"
                >
                  <Check :size="12" class="tag-check" />
                  {{ amenity }}
                </span>
                <span v-if="property.amenities.length > 4" class="amenity-tag-more">
                  +{{ property.amenities.length - 4 }} more
                </span>
              </div>
            </div>

            <div class="property-footer">
              <div class="price-box">
                <span class="price-label">Starting From</span>
                <div class="price-val">
                  <template v-if="property.minRent > 0">
                    <span class="rent-highlight">${{ property.minRent.toLocaleString() }}</span>
                    <span v-if="property.maxRent > property.minRent" class="price-range">
                      – ${{ property.maxRent.toLocaleString() }}
                    </span>
                    <span class="price-period">/mo</span>
                  </template>
                  <template v-else>
                    <span class="price-inquire">Inquire for rates</span>
                  </template>
                </div>
              </div>

              <NuxtLink :to="`/properties/${property.id}`" class="btn-primary card-cta">
                <span>View Units</span>
                <ArrowRight :size="14" />
              </NuxtLink>
            </div>
          </div>
        </article>
      </div>

      <!-- Grid Cards Pagination -->
      <div class="grid-pagination-wrapper card-flat mt-4">
        <AppPagination
          v-model:currentPage="currentPage"
          v-model:pageSize="pageSize"
          :pageSizeOptions="[6, 12, 18, 24]"
          :totalItems="properties.length"
          itemName="properties"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.properties-browse-page {
  max-width: 1240px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 4rem;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.page-header {
  text-align: center;
}

.header-container {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.page-header h1 {
  font-size: 2.25rem;
  letter-spacing: -0.02em;
}

.header-subtitle {
  color: var(--text-muted);
  font-size: 1rem;
  line-height: 1.5;
}

.filter-toolbar {
  padding: 1.25rem 1.5rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
}

.filter-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.85rem;
  color: var(--text-dim);
  pointer-events: none;
}

.filter-input {
  width: 100%;
  background: var(--bg-input);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  padding: 0.65rem 0.85rem 0.65rem 2.5rem;
  color: var(--text-main);
  font-size: 0.9rem;
}

.filter-input:focus {
  outline: none;
  border-color: var(--border-focus);
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.85rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filter-label {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-dim);
}

.filter-select,
.filter-input-sm {
  background: var(--bg-input);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  padding: 0.55rem 0.75rem;
  color: var(--text-main);
  font-size: 0.875rem;
}

.filter-select:focus,
.filter-input-sm:focus {
  outline: none;
  border-color: var(--border-focus);
}

.filter-input-sm {
  width: 110px;
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}

.filter-btn {
  padding: 0.55rem 0.95rem;
  font-size: 0.85rem;
}

/* View Mode Bar */
.view-bar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-subtle);
  flex-wrap: wrap;
  gap: 12px;
}

.results-count {
  font-size: 0.88rem;
  color: var(--text-muted);
}

.results-count strong {
  color: var(--text-main);
}

.view-modes-group {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  padding: 3px;
  border-radius: var(--radius-sm);
}

.view-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--text-muted);
  background: transparent;
  border: none;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.view-toggle-btn:hover {
  color: var(--text-main);
}

.view-toggle-btn.active {
  background: var(--primary);
  color: #ffffff;
}

/* Split View Layout */
.split-view-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 992px) {
  .split-view-layout {
    grid-template-columns: 480px 1fr;
    align-items: start;
  }
}

.split-cards-col {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-height: 800px;
  overflow-y: auto;
  padding-right: 6px;
}

.split-cards-col::-webkit-scrollbar {
  width: 6px;
}

.split-cards-col::-webkit-scrollbar-track {
  background: var(--bg-surface);
}

.split-cards-col::-webkit-scrollbar-thumb {
  background: var(--border-default);
  border-radius: 3px;
}

.split-map-col {
  width: 100%;
}

.sticky-map-wrapper {
  position: sticky;
  top: 90px;
}

.full-map-container {
  width: 100%;
}

.is-active-card {
  border-color: #2563eb !important;
  background: var(--bg-surface-hover) !important;
  box-shadow: 0 0 0 1px #2563eb;
}

.rent-highlight {
  color: #10b981 !important;
  font-weight: 700;
}

.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.5rem;
}

.property-card {
  display: flex;
  flex-direction: column;
  padding: 0 !important;
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  cursor: pointer;
}

.property-card:hover {
  box-shadow: none;
}

.card-hero-media {
  position: relative;
  width: 100%;
  height: 180px;
  background: #0f172a;
  overflow: hidden;
}

.card-hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.25s ease;
}

.property-card:hover .card-hero-img {
  transform: scale(1.03);
}

.card-hero-overlay {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.city-pill {
  font-size: 0.7rem;
  font-weight: 600;
  background: rgba(15, 23, 42, 0.75);
  color: #ffffff;
  padding: 2px 7px;
  border-radius: 4px;
  backdrop-filter: blur(2px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.property-card-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.25rem 1.25rem;
  flex: 1;
}

.property-body {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  flex: 1;
}

.property-title {
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1.3;
}

.property-title a {
  color: var(--text-main);
  transition: color 0.15s ease;
}

.property-title a:hover {
  color: #818cf8;
}

.property-location {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.loc-icon {
  color: var(--text-dim);
  flex-shrink: 0;
}

.property-description {
  color: var(--text-muted);
  font-size: 0.875rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-top: 0.25rem;
}

.amenities-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.5rem;
}

.amenity-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.72rem;
  color: var(--text-muted);
}

.tag-check {
  color: var(--accent-emerald);
}

.amenity-tag-more {
  font-size: 0.72rem;
  color: var(--text-dim);
  align-self: center;
  padding: 0.2rem 0.4rem;
}

.property-footer {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.price-box {
  display: flex;
  flex-direction: column;
}

.price-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-dim);
  letter-spacing: 0.04em;
}

.price-val {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
  display: flex;
  align-items: baseline;
  gap: 0.2rem;
}

.price-range {
  font-size: 1.15rem;
}

.price-period {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-muted);
}

.price-inquire {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-dim);
}

.card-cta {
  padding: 0.55rem 0.95rem;
  font-size: 0.85rem;
}

.map-placeholder {
  padding: 3rem;
  text-align: center;
  color: var(--text-muted);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 4rem 1rem;
  color: var(--text-muted);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-subtle);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 3.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-muted);
}

.empty-icon-box {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-sm);
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-dim);
  margin-bottom: 0.5rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  color: var(--text-main);
}

.empty-state p {
  max-width: 480px;
  font-size: 0.9rem;
}

.mt-2 {
  margin-top: 0.5rem;
}
</style>
