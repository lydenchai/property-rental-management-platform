<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  Building, 
  MapPin, 
  ArrowLeft, 
  Check, 
  Bed, 
  Bath, 
  Maximize2, 
  DollarSign, 
  ShieldAlert, 
  CheckCircle2,
  FileSignature,
  LayoutGrid,
  List,
  Image as ImageIcon,
  Eye,
  Navigation,
  AlertCircle
} from '@lucide/vue';
import PropertyMap from '../../components/common/PropertyMap.vue';
import UnitGalleryModal from '../../components/units/UnitGalleryModal.vue';
import { useAuth } from '../../composables/useAuth';
import type { ApiResponse } from '../../../shared/types/api';

const route = useRoute();
const router = useRouter();
const propertyId = route.params.id as string;
const { isAuthenticated, isTenant } = useAuth();

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
  images: string[];
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
  latitude?: number;
  longitude?: number;
  units: Unit[];
  unitsCount: number;
  availableUnitsCount: number;
  landlord?: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
  };
}

const property = ref<PropertyDetail | null>(null);
const isLoading = ref<boolean>(true);
const errorMessage = ref<string | null>(null);

// Unit view mode (grid cards vs table)
const unitViewMode = ref<'grid' | 'table'>('grid');

// Gallery modal state
const selectedUnitForGallery = ref<Unit | null>(null);
const initialGalleryIndex = ref<number>(0);

// Active thumbnail selection on individual cards before modal opening
const activeCardThumbnails = ref<Record<string, number>>({});

function openGalleryModal(unit: Unit, initialIndex: number = 0) {
  selectedUnitForGallery.value = unit;
  initialGalleryIndex.value = initialIndex;
}

function closeGalleryModal() {
  selectedUnitForGallery.value = null;
}

function handleApplyFromGallery(unit: Unit) {
  closeGalleryModal();
  openApplyModal(unit);
}

function setCardThumbnail(unitId: string, index: number) {
  activeCardThumbnails.value[unitId] = index;
}

function getCardActiveImage(unit: Unit): string {
  const selectedIdx = activeCardThumbnails.value[unit.id] ?? 0;
  if (unit.images && unit.images.length > 0) {
    return unit.images[selectedIdx] || unit.images[0];
  }
  return 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80';
}

function getRoomLabel(index: number): string {
  const labels = ['Living Area', 'Master Bedroom', 'Modern Kitchen', 'Bathroom & Balcony'];
  return labels[index % labels.length];
}

// Apply modal state
const selectedUnitForApply = ref<Unit | null>(null);
const applySuccessMessage = ref<string | null>(null);
const applyErrorMessage = ref<string | null>(null);
const isSubmittingApply = ref(false);

const applyForm = ref({
  desiredMoveInDate: '',
  proposedRent: 0,
  employmentDetails: '',
  notes: '',
});

async function fetchProperty() {
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
    errorMessage.value = err?.data?.error?.message || err?.message || 'Error loading property details';
  } finally {
    isLoading.value = false;
  }
}

function openApplyModal(unit: Unit) {
  if (!isAuthenticated.value) {
    router.push({ path: '/login', query: { redirect: `/properties/${propertyId}` } });
    return;
  }
  selectedUnitForApply.value = unit;
  applySuccessMessage.value = null;
  applyErrorMessage.value = null;

  // Set default move in date 14 days from now in YYYY-MM-DD
  const d = new Date();
  d.setDate(d.getDate() + 14);
  const dateStr = d.toISOString().split('T')[0];

  applyForm.value = {
    desiredMoveInDate: dateStr,
    proposedRent: unit.rentAmount,
    employmentDetails: '',
    notes: '',
  };
}

async function submitApplication() {
  if (!selectedUnitForApply.value) return;
  isSubmittingApply.value = true;
  applyErrorMessage.value = null;

  try {
    const res = await $fetch<ApiResponse<{ application: any; message: string }>>('/api/v1/applications', {
      method: 'POST',
      body: {
        unitId: selectedUnitForApply.value.id,
        desiredMoveInDate: new Date(applyForm.value.desiredMoveInDate).toISOString(),
        proposedRent: applyForm.value.proposedRent,
        employmentDetails: applyForm.value.employmentDetails,
        notes: applyForm.value.notes || null,
      },
    });

    if (res.success) {
      applySuccessMessage.value = `Your application for Unit ${selectedUnitForApply.value.unitNumber} has been received! You can track the landlord's review under your dashboard.`;
    } else {
      applyErrorMessage.value = res.error?.message || 'Failed to submit application';
    }
  } catch (err: any) {
    applyErrorMessage.value = err?.data?.error?.message || err?.message || 'Error submitting rental application';
  } finally {
    isSubmittingApply.value = false;
  }
}

onMounted(() => {
  fetchProperty();
});
</script>

<template>
  <div class="property-detail-page">
    <!-- Back Navigation -->
    <div class="nav-back-bar">
      <NuxtLink to="/properties" class="back-btn">
        <ArrowLeft :size="16" />
        <span>Back to All Properties</span>
      </NuxtLink>
    </div>

    <!-- Error State -->
    <div v-if="errorMessage" class="alert-error">
      {{ errorMessage }}
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading property details...</p>
    </div>

    <div v-else-if="property" class="property-content-layout">
      <!-- Property Header & Overview -->
      <section class="property-overview card-flat">
        <div class="overview-header">
          <div class="title-block">
            <span class="property-type-pill">Residential Complex</span>
            <h1>{{ property.title }}</h1>
            <div class="address-row">
              <MapPin :size="15" class="loc-icon" />
              <span>{{ property.addressLine1 }}, {{ property.city }}, {{ property.state }} {{ property.postalCode }}, {{ property.country }}</span>
            </div>
          </div>

          <div class="units-badge-block">
            <span v-if="property.availableUnitsCount > 0" class="badge badge-success">
              {{ property.availableUnitsCount }} of {{ property.unitsCount }} Units Available
            </span>
            <span v-else class="badge badge-warning">
              All Units Currently Leased
            </span>
          </div>
        </div>

        <div class="overview-description">
          <h3>About This Property</h3>
          <p>{{ property.description }}</p>
        </div>

        <!-- Amenities -->
        <div v-if="property.amenities?.length" class="amenities-section">
          <h3>Included Amenities & Features</h3>
          <div class="amenities-grid">
            <div
              v-for="amenity in property.amenities"
              :key="amenity"
              class="amenity-item"
            >
              <Check :size="14" class="amenity-check" />
              <span>{{ amenity }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Location & Neighborhood Map (OpenFreeMap) -->
      <section class="location-map-section">
        <ClientOnly>
          <PropertyMap
            :latitude="property.latitude ?? 11.5516"
            :longitude="property.longitude ?? 104.9224"
            :title="property.title"
            :address="property.addressLine1"
            :city="property.city"
          />
          <template #fallback>
            <div class="map-placeholder card-flat">
              <p>Loading OpenFreeMap vector tiles...</p>
            </div>
          </template>
        </ClientOnly>
      </section>

      <!-- Units & Floor Plans Section -->
      <section class="units-section">
        <div class="section-title-row">
          <div>
            <h2>Units & Floor Plans</h2>
            <p class="section-desc">Review individual unit room photos, specifications, pricing, and current leasing availability.</p>
          </div>
          <div class="view-toggle-bar">
            <button
              type="button"
              @click="unitViewMode = 'grid'"
              :class="['toggle-btn', { active: unitViewMode === 'grid' }]"
              title="Visual cards with photo galleries"
            >
              <LayoutGrid :size="14" />
              <span>Visual Cards</span>
            </button>
            <button
              type="button"
              @click="unitViewMode = 'table'"
              :class="['toggle-btn', { active: unitViewMode === 'table' }]"
              title="Compact table view"
            >
              <List :size="14" />
              <span>Table View</span>
            </button>
          </div>
        </div>

        <div v-if="!property.units || property.units.length === 0" class="empty-units card-flat">
          <p>No individual units have been listed for this property yet.</p>
        </div>

        <!-- Visual Cards Grid View -->
        <div v-else-if="unitViewMode === 'grid'" class="unit-cards-grid">
          <div 
            v-for="unit in property.units" 
            :key="unit.id" 
            class="unit-card card-flat"
          >
            <!-- Card Image & Hero Thumbnail -->
            <div class="unit-card-media">
              <img 
                :src="getCardActiveImage(unit)" 
                :alt="`Unit ${unit.unitNumber}`" 
                class="unit-card-hero-img"
                @click="openGalleryModal(unit, activeCardThumbnails[unit.id] ?? 0)"
              />
              <div class="unit-media-badge">
                <ImageIcon :size="12" />
                <span>{{ unit.images?.length || 1 }} Photos</span>
              </div>
              <div class="room-indicator">
                {{ getRoomLabel(activeCardThumbnails[unit.id] ?? 0) }}
              </div>
            </div>

            <!-- Thumbnail Strip under Card Hero -->
            <div v-if="unit.images && unit.images.length > 1" class="unit-card-thumbs">
              <button
                v-for="(img, idx) in unit.images.slice(0, 4)"
                :key="idx"
                type="button"
                @mouseenter="setCardThumbnail(unit.id, idx)"
                @click="openGalleryModal(unit, idx)"
                :class="['unit-mini-thumb', { active: (activeCardThumbnails[unit.id] ?? 0) === idx }]"
                :title="`View ${getRoomLabel(idx)}`"
              >
                <img :src="img" :alt="`Thumbnail ${idx + 1}`" />
              </button>
            </div>

            <!-- Card Details Content -->
            <div class="unit-card-body">
              <div class="unit-card-header">
                <div>
                  <h3 class="unit-number-title">Unit {{ unit.unitNumber }}</h3>
                  <span class="unit-floor-text">Level {{ unit.floor }}</span>
                </div>
                <span
                  :class="[
                    'badge',
                    unit.status === 'AVAILABLE' ? 'badge-success' :
                    unit.status === 'OCCUPIED' ? 'badge-warning' : 'badge-danger'
                  ]"
                >
                  {{ unit.status }}
                </span>
              </div>

              <!-- Specs Badges -->
              <div class="unit-card-specs">
                <div class="spec-item">
                  <Maximize2 :size="13" class="spec-icon" />
                  <span>{{ unit.sizeSqFt }} sq m</span>
                </div>
                <div class="spec-item">
                  <Bed :size="13" class="spec-icon" />
                  <span>{{ unit.bedrooms === 0 ? 'Studio' : `${unit.bedrooms} Bed` }}</span>
                </div>
                <div class="spec-item">
                  <Bath :size="13" class="spec-icon" />
                  <span>{{ unit.bathrooms }} Bath</span>
                </div>
              </div>

              <!-- Price and Actions -->
              <div class="unit-card-footer">
                <div class="unit-pricing">
                  <div class="unit-price-amount">${{ unit.rentAmount.toLocaleString() }} <span class="unit-price-period">/ mo</span></div>
                  <div class="unit-deposit-text">Deposit: ${{ unit.depositAmount.toLocaleString() }}</div>
                </div>

                <div class="unit-actions">
                  <button
                    v-if="unit.status === 'AVAILABLE'"
                    @click="openApplyModal(unit)"
                    class="btn-primary btn-sm"
                  >
                    <FileSignature :size="13" />
                    <span>Apply</span>
                  </button>
                  <span v-else class="unavailable-text">Unavailable</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Table View -->
        <div v-else class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 80px;">Preview</th>
                <th>Unit #</th>
                <th>Floor</th>
                <th>Floor Area</th>
                <th>Bedrooms / Bath</th>
                <th>Monthly Rent</th>
                <th>Security Deposit</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="unit in property.units" :key="unit.id">
                <td>
                  <button 
                    type="button" 
                    class="table-unit-thumb-btn"
                    @click="openGalleryModal(unit, 0)"
                    title="Open photo gallery"
                  >
                    <img 
                      :src="unit.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80'" 
                      :alt="`Unit ${unit.unitNumber}`" 
                    />
                    <span class="table-thumb-count">{{ unit.images?.length || 1 }}</span>
                  </button>
                </td>
                <td class="font-medium">Unit {{ unit.unitNumber }}</td>
                <td>Level {{ unit.floor }}</td>
                <td>{{ unit.sizeSqFt }} sq m</td>
                <td>
                  <span class="spec-text">
                    {{ unit.bedrooms === 0 ? 'Studio' : `${unit.bedrooms} Bed` }} / {{ unit.bathrooms }} Bath
                  </span>
                </td>
                <td class="rent-cell">${{ unit.rentAmount.toLocaleString() }} / mo</td>
                <td>${{ unit.depositAmount.toLocaleString() }}</td>
                <td>
                  <span
                    :class="[
                      'badge',
                      unit.status === 'AVAILABLE' ? 'badge-success' :
                      unit.status === 'OCCUPIED' ? 'badge-warning' : 'badge-danger'
                    ]"
                  >
                    {{ unit.status }}
                  </span>
                </td>
                <td>
                  <div class="flex items-center gap-1.5">
                    <button
                      type="button"
                      @click="openGalleryModal(unit, 0)"
                      class="btn-secondary btn-sm"
                      title="View Photos"
                    >
                      <ImageIcon :size="13" />
                      <span>Photos</span>
                    </button>
                    <button
                      v-if="unit.status === 'AVAILABLE'"
                      @click="openApplyModal(unit)"
                      class="btn-primary btn-sm"
                    >
                      <FileSignature :size="13" />
                      <span>Apply</span>
                    </button>
                    <span v-else class="unavailable-text">Unavailable</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <!-- Application Modal -->
    <div v-if="selectedUnitForApply" class="modal-backdrop">
      <div class="modal-card card-flat">
        <div class="modal-header">
          <h3>Apply for Unit {{ selectedUnitForApply.unitNumber }}</h3>
          <button @click="selectedUnitForApply = null" class="modal-close">&times;</button>
        </div>

        <div v-if="applySuccessMessage" class="alert-success">
          <div class="success-content">
            <div class="success-row">
              <CheckCircle2 :size="18" />
              <span>{{ applySuccessMessage }}</span>
            </div>
            <div class="modal-actions mt-3">
              <NuxtLink to="/dashboard/applications" class="btn-primary">
                <span>View My Applications</span>
              </NuxtLink>
              <button @click="selectedUnitForApply = null" class="btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>

        <form v-else @submit.prevent="submitApplication" class="modal-body">
          <div v-if="applyErrorMessage" class="alert-error">
            <AlertCircle :size="15" />
            <span>{{ applyErrorMessage }}</span>
          </div>

          <div class="unit-summary-pill">
            <div><strong>Unit:</strong> Unit {{ selectedUnitForApply.unitNumber }} ({{ property.title }})</div>
            <div><strong>Base Rent:</strong> ${{ selectedUnitForApply.rentAmount.toLocaleString() }}/mo &bull; <strong>Deposit:</strong> ${{ selectedUnitForApply.depositAmount.toLocaleString() }}</div>
            <div><strong>Specs:</strong> {{ selectedUnitForApply.bedrooms === 0 ? 'Studio' : `${selectedUnitForApply.bedrooms} Bed` }} / {{ selectedUnitForApply.bathrooms }} Bath ({{ selectedUnitForApply.sizeSqFt }} sq m)</div>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Desired Move-in Date *</label>
              <input
                v-model="applyForm.desiredMoveInDate"
                type="date"
                required
                class="input-field"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Proposed Monthly Rent ($) *</label>
              <input
                v-model.number="applyForm.proposedRent"
                type="number"
                min="1"
                required
                class="input-field"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Employment & Income Credentials *</label>
            <textarea
              v-model="applyForm.employmentDetails"
              rows="3"
              placeholder="e.g. Current employer, job title, annual/monthly gross income, duration of employment..."
              required
              class="input-field"
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Additional Notes (Optional)</label>
            <input
              v-model="applyForm.notes"
              type="text"
              placeholder="e.g. Preferred lease duration, vehicle details, co-occupants..."
              class="input-field"
            />
          </div>

          <div class="modal-actions">
            <button type="button" @click="selectedUnitForApply = null" class="btn-secondary">
              Cancel
            </button>
            <button type="submit" :disabled="isSubmittingApply" class="btn-primary">
              <FileSignature :size="14" />
              <span>{{ isSubmittingApply ? 'Submitting Application...' : 'Submit Application' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Unit Photo Gallery Modal -->
    <UnitGalleryModal
      v-if="selectedUnitForGallery"
      :unit="selectedUnitForGallery"
      :initial-index="initialGalleryIndex"
      @close="closeGalleryModal"
      @apply="handleApplyFromGallery"
    />
  </div>
</template>

<style scoped>
.property-detail-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.nav-back-bar {
  display: flex;
  align-items: center;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-muted);
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.15s ease;
}

.back-btn:hover {
  color: var(--text-main);
}

.property-content-layout {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.property-overview {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.75rem;
}

.overview-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 1.25rem;
}

@media (min-width: 768px) {
  .overview-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }
}

.title-block {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.property-type-pill {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #818cf8;
}

.title-block h1 {
  font-size: 2rem;
  line-height: 1.2;
}

.address-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-top: 0.2rem;
}

.loc-icon {
  color: var(--text-dim);
  flex-shrink: 0;
}

.overview-description h3,
.amenities-section h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.overview-description p {
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.6;
}

.amenities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.65rem;
}

.amenity-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  color: var(--text-main);
}

.amenity-check {
  color: var(--accent-emerald);
  flex-shrink: 0;
}

.units-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title-row h2 {
  font-size: 1.4rem;
}

.section-desc {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin-top: 0.2rem;
}

.font-medium {
  font-weight: 600;
}

.rent-cell {
  font-weight: 700;
  color: #10b981 !important;
}

.spec-text {
  color: var(--text-muted);
}

.btn-sm {
  padding: 0.4rem 0.75rem;
  font-size: 0.8rem;
  gap: 0.35rem;
}

.unavailable-text {
  font-size: 0.8rem;
  color: var(--text-dim);
}

.empty-units {
  padding: 2.5rem;
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

/* Modal styles */
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
  max-width: 500px;
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

.modal-header h3 {
  font-size: 1.2rem;
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.unit-summary-pill {
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.apply-notice {
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

/* Location Map Section */
.location-map-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.map-placeholder {
  height: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 0.9rem;
}

/* View Toggle Bar */
.view-toggle-bar {
  margin-top: 16px;
  display: flex;
  gap: 6px;
  background: var(--bg-subtle, #f1f5f9);
  padding: 4px;
  border-radius: 6px;
  border: 1px solid var(--border-default, #e2e8f0);
}

.toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--text-muted, #64748b);
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.toggle-btn.active {
  background: var(--bg-surface, #ffffff);
  color: var(--text-main, #0f172a);
  font-weight: 600;
  border: 1px solid var(--border-default, #cbd5e1);
  box-shadow: none;
}

/* Visual Cards Grid */
.unit-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.25rem;
}

.unit-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: var(--radius-md, 8px);
  background: var(--bg-surface, #ffffff);
  transition: border-color 0.15s ease;
}

.unit-card:hover {
  box-shadow: none;
}

.unit-card-media {
  position: relative;
  height: 210px;
  background: #0f172a;
  cursor: pointer;
  overflow: hidden;
}

.unit-card-hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.unit-card:hover .unit-card-hero-img {
  transform: scale(1.04);
}

.unit-media-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(15, 23, 42, 0.75);
  color: #ffffff;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  backdrop-filter: blur(2px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.expand-gallery-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(15, 23, 42, 0.75);
  color: #ffffff;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  cursor: pointer;
  opacity: 0;
  transform: translateY(-3px);
  transition: all 0.2s ease;
}

.unit-card:hover .expand-gallery-btn {
  opacity: 1;
  transform: translateY(0);
}

.room-indicator {
  position: absolute;
  bottom: 8px;
  left: 10px;
  background: rgba(15, 23, 42, 0.75);
  color: #f8fafc;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  backdrop-filter: blur(2px);
}

.unit-card-thumbs {
  display: flex;
  gap: 6px;
  padding: 8px 12px 12px 0;
  background: var(--bg-surface, #141c2e);
  border-bottom: 1px solid var(--border-subtle, #1e293b);
}

.unit-mini-thumb {
  width: 52px;
  height: 36px;
  border-radius: 4px;
  overflow: hidden;
  border: 2px solid transparent;
  padding: 0;
  cursor: pointer;
  background: var(--bg-subtle, #1e293b);
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.unit-mini-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.8;
  transition: opacity 0.15s ease;
}

.unit-mini-thumb:hover img,
.unit-mini-thumb.active img {
  opacity: 1;
}

.unit-mini-thumb.active {
  border-color: #38bdf8;
  transform: scale(1.05);
}

.unit-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  flex: 1;
}

.unit-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.unit-number-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-main, #f8fafc);
  margin: 0;
}

.unit-floor-text {
  font-size: 0.78rem;
  color: var(--text-muted, #94a3b8);
}

.unit-card-specs {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: var(--bg-subtle, #1e293b);
  border: 1px solid var(--border-subtle, #1e293b);
  border-radius: 6px;
  font-size: 0.8rem;
  color: var(--text-main, #f8fafc);
}

.spec-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.spec-icon {
  color: var(--text-muted, #94a3b8);
}

.unit-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: auto;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-subtle, #1e293b);
}

.unit-pricing {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.unit-price-amount {
  font-size: 1.35rem;
  font-weight: 800;
  color: #10b981 !important; /* Luminous emerald green for high contrast on dark card */
  line-height: 1.2;
  display: flex;
  align-items: baseline;
  gap: 4px;
  letter-spacing: -0.01em;
}

.unit-price-period {
  font-size: 0.82rem;
  font-weight: 500;
  color: #94a3b8 !important;
}

.unit-deposit-text {
  font-size: 0.76rem;
  color: #94a3b8 !important;
  margin-top: 2px;
}

.unit-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.table-unit-thumb-btn {
  position: relative;
  width: 56px;
  height: 38px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--border-default, #cbd5e1);
  background: #f1f5f9;
  cursor: pointer;
  padding: 0;
  display: block;
  transition: transform 0.15s ease;
}

.table-unit-thumb-btn:hover {
  transform: scale(1.08);
  border-color: #0284c7;
}

.table-unit-thumb-btn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.table-thumb-count {
  position: absolute;
  bottom: 1px;
  right: 1px;
  background: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  font-size: 0.58rem;
  font-weight: 600;
  padding: 0 3px;
  border-radius: 2px;
}
</style>

