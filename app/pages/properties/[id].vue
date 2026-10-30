<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  MapPin,
  ArrowLeft,
  Check,
  Bed,
  Bath,
  Maximize2,
  CheckCircle2,
  FileSignature,
  LayoutGrid,
  List,
  Image as ImageIcon,
  AlertCircle,
  X,
} from '@lucide/vue';
import PropertyMap from '../../components/common/PropertyMap.vue';
import AppDataTable from '../../components/common/AppDataTable.vue';
import UnitGalleryModal, { type UnitDetail } from '../../components/units/UnitGalleryModal.vue';
import ApplyUnitModal, { type ApplyFormData } from '../../components/units/ApplyUnitModal.vue';
import { useAuth } from '../../composables/useAuth';
import type { ApiResponse } from '../../../shared/types/api';
import type { TableColumn } from '~~/shared/types';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const propertyId = route.params.id as string;
const { isAuthenticated } = useAuth();

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

const unitTableColumns = computed<TableColumn[]>(() => [
  { key: 'preview', label: t('properties.preview'), width: '80px' },
  { key: 'unitNumber', label: t('properties.col_unit_number') },
  { key: 'floor', label: t('properties.col_floor') },
  { key: 'size', label: t('properties.floor_area') },
  { key: 'bedroomsBath', label: t('properties.col_bedrooms_bath') },
  { key: 'monthlyRent', label: t('properties.col_monthly_rent') },
  { key: 'deposit', label: t('properties.security_deposit_label') },
  { key: 'status', label: t('common.status') },
  { key: 'actions', label: t('common.actions') },
]);

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

function handleApplyFromGallery(unit?: UnitDetail) {
  const target = selectedUnitForGallery.value;
  closeGalleryModal();
  if (target) {
    openApplyModal(target);
  }
}

function setCardThumbnail(unitId: string, index: number) {
  activeCardThumbnails.value[unitId] = index;
}

function getCardActiveImage(unit: Unit): string {
  const selectedIdx = activeCardThumbnails.value[unit.id] ?? 0;
  if (unit.images && unit.images.length > 0) {
    return unit.images[selectedIdx] || unit.images[0]!;
  }
  return 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80';
}

function getRoomLabel(index: number): string {
  const labels = [
    t('gallery.living_area'),
    t('gallery.master_bedroom'),
    t('gallery.modern_kitchen'),
    t('gallery.bathroom_balcony'),
  ];
  return labels[index % labels.length]!;
}

// Apply modal state
const selectedUnitForApply = ref<Unit | null>(null);
const applySuccessMessage = ref<string | null>(null);
const applyErrorMessage = ref<string | null>(null);
const isSubmittingApply = ref(false);

async function fetchProperty() {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    const res = await $fetch<ApiResponse<{ property: PropertyDetail }>>(
      `/api/v1/properties/${propertyId}`
    );
    if (res.success && res.data) {
      property.value = res.data.property;
    } else {
      errorMessage.value = res.error?.message || 'Property not found';
    }
  } catch (err: any) {
    errorMessage.value =
      err?.data?.error?.message || err?.message || 'Error loading property details';
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
}

async function submitApplication(formData: ApplyFormData) {
  if (!selectedUnitForApply.value) return;
  isSubmittingApply.value = true;
  applyErrorMessage.value = null;

  try {
    const res = await $fetch<ApiResponse<{ application: any; message: string }>>(
      '/api/v1/applications',
      {
        method: 'POST',
        body: {
          unitId: selectedUnitForApply.value.id,
          desiredMoveInDate: new Date(formData.desiredMoveInDate).toISOString(),
          proposedRent: formData.proposedRent,
          employmentDetails: formData.employmentDetails || 'Self-employed / Verified applicant',
          notes: formData.notes || null,
        },
      }
    );

    if (res.success) {
      applySuccessMessage.value = `Your application for Unit ${selectedUnitForApply.value.unitNumber} has been received! You can track the landlord's review under your dashboard.`;
    } else {
      applyErrorMessage.value = res.error?.message || 'Failed to submit application';
    }
  } catch (err: any) {
    const errorData = err?.data?.error;
    if (errorData?.details && typeof errorData.details === 'object') {
      const messages = Object.entries(errorData.details)
        .map(([_, msgs]) => (Array.isArray(msgs) ? msgs.join(', ') : String(msgs)))
        .filter(Boolean);
      applyErrorMessage.value = messages.join(' | ') || errorData.message || 'Validation error';
    } else {
      applyErrorMessage.value =
        errorData?.message || err?.message || 'Error submitting rental application';
    }
  } finally {
    isSubmittingApply.value = false;
  }
}

function formatUnitStatus(status: string) {
  switch (status) {
    case 'AVAILABLE':
      return t('properties.status.vacant');
    case 'OCCUPIED':
      return t('properties.status.occupied');
    case 'RESERVED':
      return t('properties.status.reserved');
    case 'MAINTENANCE':
      return t('properties.status.maintenance');
    default:
      return status
        ? status
            .replace(/_/g, ' ')
            .toLowerCase()
            .replace(/\b\w/g, (c) => c.toUpperCase())
        : 'Unknown';
  }
}

function getUnitBadgeClass(status: string) {
  switch (status) {
    case 'AVAILABLE':
      return 'badge-success';
    case 'OCCUPIED':
      return 'badge-warning';
    case 'RESERVED':
      return 'badge-info';
    case 'MAINTENANCE':
      return 'badge-danger';
    default:
      return 'badge-subtle';
  }
}

onMounted(() => {
  fetchProperty();
});
</script>

<template>
  <div class="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 pb-16 sm:px-6">
    <!-- Back Navigation -->
    <div class="flex items-center">
      <NuxtLink
        to="/properties"
        class="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white sm:text-sm"
      >
        <ArrowLeft :size="16" />
        <span>{{ t('properties.back_to_all_properties') }}</span>
      </NuxtLink>
    </div>

    <!-- Error State -->
    <div v-if="errorMessage" class="alert-error">
      {{ errorMessage }}
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

    <div v-else-if="property" class="flex flex-col gap-8">
      <!-- Property Header & Overview -->
      <section
        class="shadow-xs flex flex-col gap-6 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 sm:p-8"
      >
        <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div class="flex flex-col gap-2">
            <span
              class="inline-flex items-center text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400"
            >
              {{ t('properties.residential_complex') }}
            </span>
            <h1 class="text-2xl font-extrabold text-neutral-900 dark:text-white sm:text-3xl">
              {{ property.title }}
            </h1>
            <div
              class="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm"
            >
              <MapPin :size="15" class="shrink-0 text-emerald-500" />
              <span
                >{{ property.addressLine1 }}, {{ property.city }}, {{ property.state }}
                {{ property.postalCode }}, {{ property.country }}</span
              >
            </div>
          </div>

          <div class="shrink-0">
            <span v-if="property.availableUnitsCount > 0" class="badge badge-pill badge-success">
              <span class="badge-dot" />
              <span>{{
                t('properties.units_available_ratio', {
                  available: property.availableUnitsCount,
                  total: property.unitsCount,
                })
              }}</span>
            </span>
            <span v-else class="badge badge-pill badge-warning">
              <span class="badge-dot" />
              <span>{{ t('properties.all_units_leased') }}</span>
            </span>
          </div>
        </div>

        <div class="flex flex-col gap-2 border-t border-neutral-100 pt-6 dark:border-neutral-800">
          <h3
            class="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500"
          >
            {{ t('properties.about_property') }}
          </h3>
          <p class="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            {{ property.description }}
          </p>
        </div>

        <!-- Amenities -->
        <div
          v-if="property.amenities?.length"
          class="flex flex-col gap-3 border-t border-neutral-100 pt-6 dark:border-neutral-800"
        >
          <h3
            class="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500"
          >
            {{ t('properties.included_amenities') }}
          </h3>
          <div class="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            <div
              v-for="amenity in property.amenities"
              :key="amenity"
              class="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-2 text-xs text-neutral-700 dark:border-neutral-700/60 dark:bg-neutral-800/60 dark:text-neutral-300"
            >
              <Check :size="14" class="shrink-0 text-emerald-500" />
              <span>{{ amenity }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Location & Neighborhood Map (OpenFreeMap) -->
      <section
        class="shadow-xs overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
      >
        <ClientOnly>
          <PropertyMap
            :latitude="property.latitude ?? 11.5516"
            :longitude="property.longitude ?? 104.9224"
            :title="property.title"
            :address="property.addressLine1"
            :city="property.city"
          />
          <template #fallback>
            <div class="p-10 text-center text-sm text-neutral-400">
              {{ t('common.please_wait') }}
            </div>
          </template>
        </ClientOnly>
      </section>

      <!-- Units & Floor Plans Section -->
      <section class="flex flex-col gap-6">
        <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 class="text-xl font-bold text-neutral-900 dark:text-white sm:text-2xl">
              {{ t('properties.units_floor_plans') }}
            </h2>
            <p class="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm">
              {{ t('properties.units_floor_plans_desc') }}
            </p>
          </div>
          <div
            class="inline-flex items-center gap-1 self-start rounded-lg border border-neutral-200 bg-neutral-200/60 p-1 dark:border-neutral-700/60 dark:bg-neutral-800/60 sm:self-auto"
          >
            <button
              type="button"
              @click="unitViewMode = 'grid'"
              :class="[
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                unitViewMode === 'grid'
                  ? 'shadow-xs bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white',
              ]"
              :title="t('properties.visual_cards')"
            >
              <LayoutGrid :size="14" />
              <span>{{ t('properties.visual_cards') }}</span>
            </button>
            <button
              type="button"
              @click="unitViewMode = 'table'"
              :class="[
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                unitViewMode === 'table'
                  ? 'shadow-xs bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white',
              ]"
              :title="t('properties.table_view')"
            >
              <List :size="14" />
              <span>{{ t('properties.table_view') }}</span>
            </button>
          </div>
        </div>

        <div
          v-if="!property.units || property.units.length === 0"
          class="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <p>{{ t('properties.no_units_listed') }}</p>
        </div>

        <!-- Visual Cards Grid View -->
        <div
          v-else-if="unitViewMode === 'grid'"
          class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          <div
            v-for="unit in property.units"
            :key="unit.id"
            class="shadow-xs group flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
          >
            <!-- Card Image & Hero Thumbnail -->
            <div
              class="relative aspect-16/10 cursor-pointer overflow-hidden bg-neutral-100 dark:bg-neutral-800"
              @click="openGalleryModal(unit, activeCardThumbnails[unit.id] ?? 0)"
            >
              <img
                :src="getCardActiveImage(unit)"
                :alt="`Unit ${unit.unitNumber}`"
                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div
                class="backdrop-blur-xs absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-md bg-neutral-950/80 px-2 py-0.5 text-[11px] font-medium text-white"
              >
                <ImageIcon :size="12" />
                <span>{{ t('properties.photos_count', { count: unit.images?.length || 1 }) }}</span>
              </div>
              <div
                class="backdrop-blur-xs absolute bottom-2.5 right-2.5 rounded-md bg-neutral-950/80 px-2 py-0.5 text-[11px] font-semibold text-white"
              >
                {{ getRoomLabel(activeCardThumbnails[unit.id] ?? 0) }}
              </div>
            </div>

            <!-- Thumbnail Strip under Card Hero -->
            <div
              v-if="unit.images && unit.images.length > 1"
              class="flex items-center gap-1.5 overflow-x-auto border-b border-neutral-100 bg-neutral-50 p-2 dark:border-neutral-800 dark:bg-neutral-950/60"
            >
              <button
                v-for="(img, idx) in unit.images.slice(0, 4)"
                :key="idx"
                type="button"
                @mouseenter="setCardThumbnail(unit.id, idx)"
                @click="openGalleryModal(unit, idx)"
                :class="[
                  'h-9 w-12 shrink-0 overflow-hidden rounded border transition-colors',
                  (activeCardThumbnails[unit.id] ?? 0) === idx
                    ? 'border-blue-600 ring-1 ring-blue-600'
                    : 'border-neutral-200 hover:border-neutral-400 dark:border-neutral-700',
                ]"
                :title="`View ${getRoomLabel(idx)}`"
              >
                <img :src="img" :alt="`Thumbnail ${idx + 1}`" class="h-full w-full object-cover" />
              </button>
            </div>

            <!-- Card Details Content -->
            <div class="flex flex-1 flex-col justify-between gap-4 p-5">
              <div class="flex flex-col gap-3">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-base font-bold text-neutral-900 dark:text-white">
                      {{ t('properties.unit_label', { number: unit.unitNumber }) }}
                    </h3>
                    <span class="text-xs text-neutral-500 dark:text-neutral-400">{{
                      t('properties.level', { floor: unit.floor })
                    }}</span>
                  </div>
                  <span :class="['badge badge-pill', getUnitBadgeClass(unit.status)]">
                    <span class="badge-dot" />
                    <span>{{ formatUnitStatus(unit.status) }}</span>
                  </span>
                </div>

                <!-- Specs Badges -->
                <div
                  class="flex items-center gap-3 border-y border-neutral-100 py-2 text-xs text-neutral-600 dark:border-neutral-800 dark:text-neutral-300"
                >
                  <div class="flex items-center gap-1">
                    <Maximize2 :size="13" class="text-neutral-400" />
                    <span>{{ t('properties.sq_m', { size: unit.sizeSqFt }) }}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <Bed :size="13" class="text-neutral-400" />
                    <span>{{
                      unit.bedrooms === 0
                        ? t('properties.studio')
                        : t('properties.bed_short', { count: unit.bedrooms })
                    }}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <Bath :size="13" class="text-neutral-400" />
                    <span>{{ t('properties.bath_short', { count: unit.bathrooms }) }}</span>
                  </div>
                </div>
              </div>

              <!-- Price and Actions -->
              <div class="flex items-center justify-between pt-1">
                <div class="flex flex-col">
                  <div class="text-base font-extrabold text-neutral-900 dark:text-white">
                    ${{ unit.rentAmount.toLocaleString() }}
                    <span class="text-xs font-normal text-neutral-500">{{
                      t('properties.per_month_short')
                    }}</span>
                  </div>
                  <div class="text-[11px] text-neutral-400">
                    {{ t('properties.deposit') }}: ${{ unit.depositAmount.toLocaleString() }}
                  </div>
                </div>

                <div>
                  <button
                    v-if="unit.status === 'AVAILABLE'"
                    @click="openApplyModal(unit)"
                    class="btn-primary btn-sm"
                  >
                    <FileSignature :size="13" />
                    <span>{{ t('properties.apply') }}</span>
                  </button>
                  <span
                    v-else
                    class="text-xs font-semibold text-neutral-400 dark:text-neutral-500"
                    >{{ t('properties.unavailable') }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Table View -->
        <div v-else class="data-table-container">
          <AppDataTable
            :columns="unitTableColumns"
            :items="property?.units || []"
            :is-loading="isLoading"
            min-width="min-w-[700px]"
          >
            <template #cell-preview="slotProps">
              <button
                v-if="slotProps?.item?.id"
                type="button"
                class="relative h-9 w-12 overflow-hidden rounded border border-neutral-200 dark:border-neutral-700"
                @click="openGalleryModal(slotProps.item, 0)"
                :title="t('properties.photos')"
              >
                <img
                  :src="
                    slotProps?.item?.images?.[0] ||
                    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80'
                  "
                  :alt="`Unit ${slotProps?.item?.unitNumber || ''}`"
                  class="h-full w-full object-cover"
                />
                <span
                  class="absolute bottom-0 right-0 bg-black/75 px-1 text-[9px] font-bold text-white"
                  >{{ slotProps?.item?.images?.length || 1 }}</span
                >
              </button>
            </template>

            <template #cell-unitNumber="slotProps">
              <span class="font-medium text-neutral-900 dark:text-white">
                {{ t('properties.unit_label', { number: slotProps?.item?.unitNumber || '' }) }}
              </span>
            </template>

            <template #cell-floor="slotProps">
              <span>{{ t('properties.level', { floor: slotProps?.item?.floor ?? 0 }) }}</span>
            </template>

            <template #cell-size="slotProps">
              <span>{{ t('properties.sq_m', { size: slotProps?.item?.sizeSqFt ?? 0 }) }}</span>
            </template>

            <template #cell-bedroomsBath="slotProps">
              <span class="text-xs">
                {{
                  slotProps?.item?.bedrooms === 0
                    ? t('properties.studio')
                    : t('properties.bed_short', { count: slotProps?.item?.bedrooms ?? 1 })
                }}
                / {{ t('properties.bath_short', { count: slotProps?.item?.bathrooms ?? 1 }) }}
              </span>
            </template>

            <template #cell-monthlyRent="slotProps">
              <span class="font-semibold text-neutral-900 dark:text-white">
                ${{
                  slotProps?.item?.rentAmount ? slotProps.item.rentAmount.toLocaleString() : '0'
                }}
                {{ t('properties.per_month_short') }}
              </span>
            </template>

            <template #cell-deposit="slotProps">
              <span
                >${{
                  slotProps?.item?.depositAmount
                    ? slotProps.item.depositAmount.toLocaleString()
                    : '0'
                }}</span
              >
            </template>

            <template #cell-status="slotProps">
              <span
                v-if="slotProps?.item?.status"
                :class="['badge badge-pill', getUnitBadgeClass(slotProps.item.status)]"
              >
                <span class="badge-dot" />
                <span>{{ formatUnitStatus(slotProps.item.status) }}</span>
              </span>
              <span v-else>—</span>
            </template>

            <template #cell-actions="slotProps">
              <div v-if="slotProps?.item?.id" class="flex items-center gap-1.5">
                <button
                  type="button"
                  @click="openGalleryModal(slotProps.item, 0)"
                  class="btn-secondary btn-sm"
                  :title="t('properties.photos')"
                >
                  <ImageIcon :size="13" />
                  <span>{{ t('properties.photos') }}</span>
                </button>
                <button
                  v-if="slotProps.item.status === 'AVAILABLE'"
                  @click="openApplyModal(slotProps.item)"
                  class="btn-primary btn-sm"
                >
                  <FileSignature :size="13" />
                  <span>{{ t('properties.apply') }}</span>
                </button>
                <span v-else class="text-xs font-medium text-neutral-400 dark:text-neutral-500">{{
                  t('properties.unavailable')
                }}</span>
              </div>
            </template>
          </AppDataTable>
        </div>
      </section>
    </div>

    <!-- Application Modal -->
    <ApplyUnitModal
      :unit="selectedUnitForApply"
      :property-title="property?.title"
      :is-submitting="isSubmittingApply"
      :success-message="applySuccessMessage"
      :error-message="applyErrorMessage"
      @close="selectedUnitForApply = null"
      @submit="submitApplication"
    />

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
