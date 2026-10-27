<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  Building,
  Plus,
  MapPin,
  ArrowLeft,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Layers,
  ExternalLink,
  X,
} from '@lucide/vue';
import { usePropertyStore } from '../../../../stores/property.store';
import AppTableCard from '../../../../components/common/AppTableCard.vue';
import PropertyMap from '../../../../components/common/PropertyMap.vue';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  title: 'Manage Property Units',
});

const { t } = useI18n();
const route = useRoute();
const propertyId = route.params.id as string;

const propertyStore = usePropertyStore();
const { isLoading, errorMessage } = propertyStore;
const { fetchPropertyById, createUnit, updateUnit, deleteUnit } = propertyStore;

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
  unitsCount: number;
  availableUnitsCount: number;
  latitude?: number;
  longitude?: number;
  units?: Unit[];
}

const property = ref<PropertyDetail | null>(null);
const successMessage = ref<string | null>(null);

// Unit Form Modal state
const isUnitModalOpen = ref(false);
const editingUnitId = ref<string | null>(null);
const isSubmittingUnit = ref(false);

const unitForm = ref({
  unitNumber: '',
  floor: 1,
  sizeSqFt: 60,
  bedrooms: 1,
  bathrooms: 1,
  rentAmount: 500,
  depositAmount: 500,
  status: 'AVAILABLE',
});

// Unit Delete Modal state
const unitToDelete = ref<Unit | null>(null);
const isDeleting = ref(false);

// Pagination state for units table
const currentUnitPage = ref(1);
const unitPageSize = ref(8);

const paginatedUnits = computed(() => {
  const units = property.value?.units || [];
  const start = (currentUnitPage.value - 1) * unitPageSize.value;
  return units.slice(start, start + unitPageSize.value);
});

async function loadProperty() {
  const res = await fetchPropertyById(propertyId);
  if (res.success && res.property) {
    property.value = res.property as any;
  }
}

function openAddUnitModal() {
  editingUnitId.value = null;
  unitForm.value = {
    unitNumber: '',
    floor: 1,
    sizeSqFt: 60,
    bedrooms: 1,
    bathrooms: 1,
    rentAmount: 500,
    depositAmount: 500,
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

const toast = useToast();

async function handleSaveUnit() {
  isSubmittingUnit.value = true;
  try {
    if (editingUnitId.value) {
      const res = await updateUnit(propertyId, editingUnitId.value, unitForm.value);
      if (res.success) {
        toast.success(`Unit ${unitForm.value.unitNumber} updated successfully.`);
        isUnitModalOpen.value = false;
        await loadProperty();
      } else {
        toast.error(res.error || 'Failed to update unit.');
      }
    } else {
      const res = await createUnit(propertyId, unitForm.value);
      if (res.success) {
        toast.success(`Unit ${unitForm.value.unitNumber} added to property.`);
        isUnitModalOpen.value = false;
        await loadProperty();
      } else {
        toast.error(res.error || 'Failed to create unit.');
      }
    }
  } catch (err: any) {
    toast.error(err?.message || 'Failed to save unit.');
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
    const res = await deleteUnit(propertyId, unitToDelete.value.id);
    if (res.success) {
      toast.success(`Unit ${unitToDelete.value.unitNumber} removed.`);
      unitToDelete.value = null;
      await loadProperty();
    } else {
      toast.error(res.error || 'Failed to delete unit.');
    }
  } catch (err: any) {
    toast.error(err?.message || 'Failed to delete unit.');
  } finally {
    isDeleting.value = false;
  }
}

onMounted(() => {
  loadProperty();
});
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center">
      <NuxtLink
        to="/dashboard/properties"
        class="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white sm:text-sm"
      >
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
    <div v-if="isLoading" class="flex flex-col items-center gap-3 py-20 text-center">
      <div
        class="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-blue-600"
      />
      <p class="text-sm text-neutral-500 dark:text-neutral-400">
        {{ t('properties.loading_property_units') }}
      </p>
    </div>

    <div v-else-if="property" class="flex flex-col gap-6">
      <!-- Property Summary Card -->
      <div
        class="shadow-xs flex flex-col justify-between gap-6 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 md:flex-row md:items-center"
      >
        <div class="flex flex-col gap-1.5">
          <span
            class="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400"
            >{{ t('properties.residential_asset') }}</span
          >
          <h2 class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {{ property.title }}
          </h2>
          <div class="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            <MapPin :size="14" class="shrink-0 text-emerald-500" />
            <span
              >{{ property.addressLine1 }}, {{ property.city }}, {{ property.state }}
              {{ property.postalCode }}</span
            >
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <div
            class="flex min-w-20 flex-col items-center rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 dark:border-neutral-700/60 dark:bg-neutral-800/60"
          >
            <span class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{{
              t('properties.total_units_label')
            }}</span>
            <span class="text-lg font-extrabold text-neutral-900 dark:text-white">{{
              property.unitsCount
            }}</span>
          </div>
          <div
            class="flex min-w-20 flex-col items-center rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 dark:border-neutral-700/60 dark:bg-neutral-800/60"
          >
            <span class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{{
              t('properties.filter_available_short')
            }}</span>
            <span class="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{{
              property.availableUnitsCount
            }}</span>
          </div>
          <div class="flex items-center gap-2">
            <NuxtLink
              :to="`/properties/${property.id}`"
              target="_blank"
              class="btn-secondary btn-sm"
              :title="t('properties.public_view')"
            >
              <ExternalLink :size="13" />
              <span>{{ t('properties.public_view') }}</span>
            </NuxtLink>
            <NuxtLink
              :to="`/dashboard/properties/${property.id}/edit`"
              class="btn-secondary btn-sm"
            >
              <Edit3 :size="13" />
              <span>{{ t('properties.edit_property_title') }}</span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Property Location Map (OpenFreeMap) -->
      <div
        class="shadow-xs overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
      >
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
            <div class="p-10 text-center text-sm text-neutral-400">
              {{ t('common.please_wait') }}
            </div>
          </template>
        </ClientOnly>
      </div>

      <!-- Units Management Section using shared AppTableCard -->
      <AppTableCard
        :title="t('properties.unit_inventory')"
        :subtitle="t('properties.unit_inventory_desc')"
        :show-search="false"
        :is-empty="!property.units || property.units.length === 0"
        :empty-title="t('properties.no_units_yet')"
        :empty-description="t('properties.no_units_yet_desc')"
        :empty-icon="Layers"
        v-model:current-page="currentUnitPage"
        v-model:page-size="unitPageSize"
        :total-items="property.units?.length || 0"
        :item-name="t('properties.units')"
      >
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
              <td class="font-semibold text-neutral-900 dark:text-white">
                {{ t('properties.unit_label', { number: unit.unitNumber }) }}
              </td>
              <td>{{ t('properties.level', { floor: unit.floor }) }}</td>
              <td>{{ t('properties.sq_m', { size: unit.sizeSqFt }) }}</td>
              <td>
                {{
                  unit.bedrooms === 0
                    ? t('properties.studio')
                    : t('properties.bed_short', { count: unit.bedrooms })
                }}
                / {{ t('properties.bath_short', { count: unit.bathrooms }) }}
              </td>
              <td class="font-semibold text-neutral-900 dark:text-white">
                ${{ unit.rentAmount.toLocaleString() }}
              </td>
              <td>${{ unit.depositAmount.toLocaleString() }}</td>
              <td>
                <span :class="['badge badge-pill', getUnitBadgeClass(unit.status)]">
                  <span class="badge-dot" />
                  <span>{{ formatUnitStatus(unit.status) }}</span>
                </span>
              </td>
              <td class="text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    @click="openEditUnitModal(unit)"
                    class="btn-secondary btn-sm"
                    :title="t('common.edit')"
                  >
                    <Edit3 :size="13" />
                    <span>{{ t('common.edit') }}</span>
                  </button>
                  <button
                    @click="confirmDeleteUnit(unit)"
                    class="rounded-md p-1.5 text-neutral-500 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-neutral-400 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                    :title="t('properties.remove_unit')"
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

    <!-- Fallback when property is not found -->
    <div
      v-else-if="!isLoading && !property"
      class="flex flex-col items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-16 text-center dark:border-neutral-800 dark:bg-neutral-900"
    >
      <Building :size="36" class="text-neutral-400" />
      <h3 class="text-lg font-bold text-neutral-900 dark:text-white">
        {{ t('properties.property_not_found') }}
      </h3>
      <p class="max-w-sm text-xs text-neutral-500 sm:text-sm">
        {{ t('properties.property_not_found_desc') }}
      </p>
      <NuxtLink to="/dashboard/properties" class="btn-primary mt-2">
        <ArrowLeft :size="15" />
        <span>{{ t('properties.return_to_properties') }}</span>
      </NuxtLink>
    </div>

    <!-- Unit Add / Edit Modal -->
    <Teleport to="body">
      <div
        v-if="isUnitModalOpen"
        class="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      >
        <div
          class="flex w-full max-w-lg flex-col gap-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800"
          >
            <h3 class="text-lg font-bold text-neutral-900 dark:text-white">
              {{ editingUnitId ? t('properties.edit_unit') : t('properties.add_unit_to_property') }}
            </h3>
            <button
              @click="isUnitModalOpen = false"
              class="cursor-pointer text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            >
              <X :size="18" />
            </button>
          </div>

          <form @submit.prevent="handleSaveUnit" class="flex flex-col gap-4">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="flex flex-col gap-1.5">
                <label
                  for="u-number"
                  class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
                  >{{ t('properties.unit_number_label') }}</label
                >
                <input
                  id="u-number"
                  v-model="unitForm.unitNumber"
                  type="text"
                  placeholder="e.g. 101A"
                  required
                  class="input-field"
                />
              </div>

              <div class="flex flex-col gap-1.5">
                <label
                  for="u-floor"
                  class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
                  >{{ t('properties.floor_level_label') }}</label
                >
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

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div class="flex flex-col gap-1.5">
                <label
                  for="u-size"
                  class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
                  >{{ t('properties.area_sqm_label') }}</label
                >
                <input
                  id="u-size"
                  v-model.number="unitForm.sizeSqFt"
                  type="number"
                  min="10"
                  required
                  class="input-field"
                />
              </div>

              <div class="flex flex-col gap-1.5">
                <label
                  for="u-beds"
                  class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
                  >{{ t('properties.bedrooms') }} *</label
                >
                <input
                  id="u-beds"
                  v-model.number="unitForm.bedrooms"
                  type="number"
                  min="0"
                  required
                  class="input-field"
                />
              </div>

              <div class="flex flex-col gap-1.5">
                <label
                  for="u-baths"
                  class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
                  >{{ t('properties.bathrooms') }} *</label
                >
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

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="flex flex-col gap-1.5">
                <label
                  for="u-rent"
                  class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
                  >{{ t('properties.monthly_rent_label') }}</label
                >
                <input
                  id="u-rent"
                  v-model.number="unitForm.rentAmount"
                  type="number"
                  min="1"
                  required
                  class="input-field"
                />
              </div>

              <div class="flex flex-col gap-1.5">
                <label
                  for="u-deposit"
                  class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
                  >{{ t('properties.security_deposit_label') }}</label
                >
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

            <div class="flex flex-col gap-1.5">
              <label
                for="u-status"
                class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
                >{{ t('properties.unit_status_label') }}</label
              >
              <select id="u-status" v-model="unitForm.status" class="input-field">
                <option value="AVAILABLE">{{ t('properties.status.vacant') }}</option>
                <option value="RESERVED">{{ t('properties.status.reserved') }}</option>
                <option value="OCCUPIED">{{ t('properties.status.occupied') }}</option>
                <option value="MAINTENANCE">{{ t('properties.status.maintenance') }}</option>
              </select>
            </div>

            <div
              class="flex items-center justify-end gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800"
            >
              <button type="button" @click="isUnitModalOpen = false" class="btn-secondary">
                {{ t('common.cancel') }}
              </button>
              <button type="submit" :disabled="isSubmittingUnit" class="btn-primary">
                <span>{{
                  isSubmittingUnit ? t('properties.saving') : t('properties.save_unit')
                }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Unit Delete Confirmation Modal -->
    <Teleport to="body">
      <div
        v-if="unitToDelete"
        class="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      >
        <div
          class="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800"
          >
            <h3 class="text-lg font-bold text-neutral-900 dark:text-white">
              {{ t('properties.remove_unit') }}
            </h3>
            <button
              @click="unitToDelete = null"
              class="cursor-pointer text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            >
              <X :size="18" />
            </button>
          </div>
          <div class="flex flex-col gap-3">
            <p class="text-sm text-neutral-700 dark:text-neutral-300">
              {{ t('properties.remove_unit_confirm', { number: unitToDelete.unitNumber }) }}
            </p>
            <div
              class="flex items-center justify-end gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800"
            >
              <button @click="unitToDelete = null" class="btn-secondary">
                {{ t('common.cancel') }}
              </button>
              <button @click="executeDeleteUnit" :disabled="isDeleting" class="btn-danger">
                <span>{{
                  isDeleting ? t('properties.removing') : t('properties.confirm_remove')
                }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
