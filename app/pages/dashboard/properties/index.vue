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
  Calendar,
  X,
} from '@lucide/vue';
import { usePropertyStore } from '../../../stores/property.store';
import type { PropertyItem, TableColumn } from '~~/shared/types';
import AppTableCard from '../../../components/common/AppTableCard.vue';
import AppDataTable from '../../../components/common/AppDataTable.vue';
import AppModal from '../../../components/common/AppModal.vue';

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
  occupancyRate,
} = propertyStore;

const successMessage = ref<string | null>(null);
const searchQuery = ref('');
const activeFilter = ref<'ALL' | 'AVAILABLE' | 'FULL'>('ALL');

// Delete confirmation modal state
const propertyToDelete = ref<PropertyItem | null>(null);
const isDeleting = ref(false);

const availableCount = computed(() => {
  return (properties.value || []).filter((p) => (p?.availableUnitsCount ?? 0) > 0).length;
});

const fullCount = computed(() => {
  return (properties.value || []).filter(
    (p) => (p?.unitsCount ?? 0) > 0 && (p?.availableUnitsCount ?? 0) === 0
  ).length;
});

const filteredProperties = computed(() => {
  let list = properties.value || [];

  // Filter tab
  if (activeFilter.value === 'AVAILABLE') {
    list = list.filter((p) => (p?.availableUnitsCount ?? 0) > 0);
  } else if (activeFilter.value === 'FULL') {
    list = list.filter((p) => (p?.unitsCount ?? 0) > 0 && (p?.availableUnitsCount ?? 0) === 0);
  }

  // Search filter
  if (!searchQuery.value.trim()) return list;
  const q = searchQuery.value.toLowerCase();
  return list.filter(
    (p) =>
      p?.title?.toLowerCase().includes(q) ||
      p?.city?.toLowerCase().includes(q) ||
      p?.addressLine1?.toLowerCase().includes(q)
  );
});

// Pagination state
const currentPage = ref(1);
const pageSize = ref(5);

const paginatedProperties = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredProperties.value.slice(start, start + pageSize.value);
});

const columns = computed<TableColumn[]>(() => [
  { key: 'property', label: t('properties.col_property'), class: 'min-w-[250px]' },
  { key: 'location', label: t('properties.col_location'), class: 'min-w-[240px]' },
  { key: 'units', label: t('properties.col_units_breakdown'), class: 'min-w-[170px]' },
  { key: 'rent', label: t('properties.col_rent_range'), class: 'min-w-[140px]' },
  { key: 'created', label: t('properties.col_created_date'), class: 'min-w-[130px]' },
  { key: 'actions', label: t('properties.col_actions'), align: 'right', class: 'min-w-[140px]' },
]);

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
  <div class="flex flex-col gap-6">
    <!-- Header with Action -->
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {{ t('properties.management_title') }}
        </h1>
        <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm">
          {{ t('properties.management_subtitle') }}
        </p>
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
        <NuxtLink
          v-if="errorMessage.toLowerCase().includes('logged in')"
          :to="{ path: '/login', query: { redirect: $route.fullPath } }"
          class="alert-action-btn"
        >
          {{ t('nav.sign_in') }}
        </NuxtLink>
      </div>
    </div>

    <!-- Overview Metrics Row -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
      <div
        class="shadow-xs flex flex-col gap-1 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <span class="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{{
          t('properties.total_properties')
        }}</span>
        <div class="text-2xl font-extrabold text-neutral-900 dark:text-white">
          {{ totalProperties }}
        </div>
        <span class="text-[11px] text-neutral-400">{{ t('properties.active_in_portfolio') }}</span>
      </div>

      <div
        class="shadow-xs flex flex-col gap-1 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <span class="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{{
          t('properties.total_units_label')
        }}</span>
        <div class="text-2xl font-extrabold text-neutral-900 dark:text-white">{{ totalUnits }}</div>
        <span class="text-[11px] text-neutral-400">{{
          t('properties.currently_available', { count: totalAvailable })
        }}</span>
      </div>

      <div
        class="shadow-xs flex flex-col gap-1 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <span class="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{{
          t('properties.portfolio_occupancy')
        }}</span>
        <div class="text-2xl font-extrabold text-neutral-900 dark:text-white">
          {{ occupancyRate }}%
        </div>
        <span class="text-[11px] text-neutral-400">{{ t('properties.leased_vs_capacity') }}</span>
      </div>
    </div>

    <!-- Properties Table using shared AppTableCard -->
    <AppTableCard
      v-model:search="searchQuery"
      :search-placeholder="t('properties.filter_by_title_location')"
      :is-loading="isLoading"
      :is-empty="filteredProperties.length === 0"
      :empty-title="t('properties.no_properties')"
      :empty-description="t('properties.first_property_desc')"
      :empty-icon="Building"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total-items="filteredProperties.length"
      :item-name="t('nav.properties').toLowerCase()"
    >
      <!-- Quick Filter Pills -->
      <template #toolbar-start>
        <div class="inline-flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            :class="[
              'inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
              activeFilter === 'ALL'
                ? 'shadow-xs border-primary-600 bg-primary-600 font-semibold text-white'
                : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700',
            ]"
            @click="activeFilter = 'ALL'"
          >
            <span>{{ t('properties.filter_all_short') }}</span>
            <span
              :class="[
                'rounded-full px-1.5 py-0.5 text-[10px]',
                activeFilter === 'ALL'
                  ? 'bg-primary-700 text-white'
                  : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300',
              ]"
              >{{ properties?.length || 0 }}</span
            >
          </button>
          <button
            type="button"
            :class="[
              'inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
              activeFilter === 'AVAILABLE'
                ? 'shadow-xs border-primary-600 bg-primary-600 font-semibold text-white'
                : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700',
            ]"
            @click="activeFilter = 'AVAILABLE'"
          >
            <span>{{ t('properties.filter_available_short') }}</span>
            <span
              :class="[
                'rounded-full px-1.5 py-0.5 text-[10px]',
                activeFilter === 'AVAILABLE'
                  ? 'bg-primary-700 text-white'
                  : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
              ]"
              >{{ availableCount }}</span
            >
          </button>
          <button
            type="button"
            :class="[
              'inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
              activeFilter === 'FULL'
                ? 'shadow-xs border-primary-600 bg-primary-600 font-semibold text-white'
                : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700',
            ]"
            @click="activeFilter = 'FULL'"
          >
            <span>{{ t('properties.filter_full_short') }}</span>
            <span
              :class="[
                'rounded-full px-1.5 py-0.5 text-[10px]',
                activeFilter === 'FULL'
                  ? 'bg-primary-700 text-white'
                  : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300',
              ]"
              >{{ fullCount }}</span
            >
          </button>
        </div>
      </template>

      <template #empty-action>
        <NuxtLink to="/dashboard/properties/create" class="btn-primary mt-2">
          <Plus :size="15" />
          <span>{{ t('properties.add_first_property') }}</span>
        </NuxtLink>
      </template>

      <AppDataTable :columns="columns" :items="paginatedProperties" :is-loading="isLoading">
        <!-- Property Details -->
        <template #cell-property="slotProps">
          <div class="flex items-center gap-3">
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-800/40 dark:bg-blue-950/40 dark:text-blue-400"
            >
              <Building :size="16" />
            </div>
            <div class="flex min-w-0 flex-col">
              <NuxtLink
                v-if="slotProps?.item?.id"
                :to="`/dashboard/properties/${slotProps.item.id}`"
                class="truncate text-sm font-semibold text-neutral-900 transition-colors hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
              >
                {{ slotProps?.item?.title || '—' }}
              </NuxtLink>
              <span v-else class="text-sm font-semibold text-neutral-900 dark:text-white">—</span>
              <span v-if="slotProps?.item?.id" class="font-mono text-[10px] text-neutral-400"
                >#{{ slotProps.item.id.slice(0, 8) }}</span
              >
            </div>
          </div>
        </template>

        <!-- Location -->
        <template #cell-location="slotProps">
          <div class="flex flex-col gap-0.5">
            <div
              class="flex items-center gap-1.5 text-xs text-neutral-700 dark:text-neutral-300"
              :title="slotProps?.item?.addressLine1"
            >
              <MapPin :size="13" class="shrink-0 text-emerald-500" />
              <span class="truncate">{{ slotProps?.item?.addressLine1 || '—' }}</span>
            </div>
            <span class="text-[11px] text-neutral-400">
              {{ slotProps?.item ? formatLocation(slotProps.item) : '—' }}
            </span>
          </div>
        </template>

        <!-- Units Breakdown -->
        <template #cell-units="slotProps">
          <div class="flex flex-col gap-1">
            <div class="flex items-baseline gap-1 text-xs">
              <span class="font-bold text-neutral-900 dark:text-white">{{
                slotProps?.item?.unitsCount ?? 0
              }}</span>
              <span class="text-neutral-400">{{
                slotProps?.item?.unitsCount === 1
                  ? t('properties.unit_singular')
                  : t('properties.unit_plural')
              }}</span>
            </div>
            <div>
              <span
                v-if="(slotProps?.item?.availableUnitsCount ?? 0) > 0"
                class="badge badge-pill badge-success"
              >
                <span class="badge-dot" />
                <span>{{
                  t('properties.unit_available_badge', {
                    count: slotProps?.item?.availableUnitsCount,
                  })
                }}</span>
              </span>
              <span
                v-else-if="(slotProps?.item?.unitsCount ?? 0) > 0"
                class="badge badge-pill badge-subtle"
              >
                <span class="badge-dot" />
                <span>{{ t('properties.unit_fully_leased_badge') }}</span>
              </span>
              <span v-else class="badge badge-pill badge-warning">
                <span class="badge-dot" />
                <span>{{ t('properties.unit_no_units_badge') }}</span>
              </span>
            </div>
          </div>
        </template>

        <!-- Rent Range -->
        <template #cell-rent="slotProps">
          <div v-if="slotProps?.item?.minRent && slotProps.item.minRent > 0" class="flex flex-col">
            <div class="text-xs font-bold text-neutral-900 dark:text-white">
              ${{ slotProps.item.minRent.toLocaleString()
              }}<span
                v-if="slotProps.item.maxRent && slotProps.item.maxRent > slotProps.item.minRent"
                class="text-neutral-400"
              >
                – ${{ slotProps.item.maxRent.toLocaleString() }}</span
              >
            </div>
            <span class="text-[10px] text-neutral-400">{{ t('properties.per_month_short') }}</span>
          </div>
          <div v-else>
            <span class="text-xs text-neutral-400">—</span>
          </div>
        </template>

        <!-- Created Date -->
        <template #cell-created="slotProps">
          <div class="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
            <Calendar :size="13" class="shrink-0 text-neutral-400" />
            <span>{{
              slotProps?.item?.createdAt ? formatDate(slotProps.item.createdAt) : '—'
            }}</span>
          </div>
        </template>

        <!-- Actions -->
        <template #cell-actions="slotProps">
          <div v-if="slotProps?.item?.id" class="flex items-center justify-end gap-1.5">
            <NuxtLink
              :to="`/dashboard/properties/${slotProps.item.id}`"
              class="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              :title="t('properties.manage_units')"
            >
              <Layers :size="13" />
              <span>{{ t('properties.manage_units') }}</span>
            </NuxtLink>
            <NuxtLink
              :to="`/dashboard/properties/${slotProps.item.id}/edit`"
              class="rounded-md p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
              :title="t('properties.edit_property_title')"
            >
              <Edit3 :size="14" />
            </NuxtLink>
            <button
              @click="confirmDelete(slotProps.item)"
              class="rounded-md p-1.5 text-neutral-500 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-neutral-400 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
              :title="t('properties.delete_property')"
            >
              <Trash2 :size="14" />
            </button>
          </div>
        </template>
      </AppDataTable>
    </AppTableCard>

    <!-- Delete Confirmation Modal using AppModal -->
    <AppModal
      :model-value="!!propertyToDelete"
      :title="t('properties.delete_modal_title')"
      :icon="Trash2"
      size="md"
      @update:model-value="if (!$event) propertyToDelete = null;"
    >
      <div v-if="propertyToDelete" class="flex flex-col gap-3">
        <p class="text-sm text-neutral-700 dark:text-neutral-300">
          {{ t('properties.delete_modal_confirm', { title: propertyToDelete.title }) }}
        </p>
        <p class="text-xs text-neutral-500 dark:text-neutral-400">
          {{ t('properties.delete_modal_warning') }}
        </p>
      </div>

      <template #footer>
        <div v-if="propertyToDelete" class="flex items-center justify-end gap-2">
          <button @click="propertyToDelete = null" class="btn-secondary">
            {{ t('common.cancel') }}
          </button>
          <button @click="executeDelete" :disabled="isDeleting" class="btn-danger">
            <Trash2 :size="14" />
            <span>{{
              isDeleting ? t('properties.deleting') : t('properties.confirm_deletion')
            }}</span>
          </button>
        </div>
      </template>
    </AppModal>
  </div>
</template>
