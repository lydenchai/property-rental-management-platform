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
  LayoutGrid,
  Map as MapIcon,
  Columns2,
  Bed,
  DollarSign,
  ChevronDown,
  X,
} from '@lucide/vue';
import PropertiesMapExplorer from '../../components/common/PropertiesMapExplorer.vue';
import AppPagination from '../../components/common/AppPagination.vue';
import PropertyCardSkeleton from '../../components/properties/PropertyCardSkeleton.vue';

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

const { t } = useI18n();
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
    errorMessage.value =
      err?.data?.error?.message || err?.message || 'Network error loading properties';
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

const hasActiveFilters = computed(() => {
  return Boolean(
    searchKeyword.value ||
    selectedCity.value ||
    selectedBeds.value !== '' ||
    minPrice.value !== '' ||
    maxPrice.value !== ''
  );
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
  'prop-skyline-01':
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
  'prop-oakwood-02':
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
  'prop-metropolitan-03':
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  'prop-peak-04':
    'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=800&q=80',
  'prop-toulkork-05':
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
  'prop-chroy-06':
    'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800&q=80',
  'prop-otres-07':
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
  'prop-kampot-08':
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
};

function getPropertyThumbnail(property: Property): string {
  return (
    PROPERTY_COVERS[property.id] ||
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'
  );
}

onMounted(() => {
  const route = useRoute();
  if (route.query.city) selectedCity.value = String(route.query.city);
  if (route.query.search) searchKeyword.value = String(route.query.search);
  if (route.query.minRent) minPrice.value = Number(route.query.minRent) || '';
  if (route.query.maxRent) maxPrice.value = Number(route.query.maxRent) || '';
  if (route.query.bedrooms) selectedBeds.value = Number(route.query.bedrooms) || '';
  fetchProperties();
});
</script>

<template>
  <div class="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 pb-16 sm:px-6">
    <!-- Header Section -->
    <section class="mx-auto mb-2 max-w-2xl text-center">
      <h1 class="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
        {{ t('properties.explore_title') }}
      </h1>
      <p class="mt-2 text-sm text-neutral-500 dark:text-neutral-400 sm:text-base">
        {{ t('properties.explore_subtitle') }}
      </p>
    </section>

    <!-- Filter & Search Toolbar -->
    <section
      class="shadow-xs rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:p-5">
      <form @submit.prevent="handleSearch" class="flex flex-col gap-4">
        <!-- Search Bar Row -->
        <div class="relative">
          <Search :size="18"
            class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
          <input v-model="searchKeyword" type="text" :placeholder="t('properties.search_input_placeholder')"
            class="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50/70 pl-10 pr-24 text-sm text-neutral-900 transition-all placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:border-neutral-800 dark:bg-neutral-950/70 dark:text-white dark:focus:border-neutral-600 dark:focus:bg-neutral-900" />
          <div class="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
            <button v-if="searchKeyword" type="button" @click="
              searchKeyword = '';
            handleSearch();
            " class="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-200/60 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              :title="t('common.clear')">
              <X :size="14" />
            </button>
            <button type="submit"
              class="hidden items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 sm:inline-flex">
              <Search :size="12" />
              <span>{{ t('common.search') }}</span>
            </button>
          </div>
        </div>

        <!-- Filter Controls Grid -->
        <div class="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-12">
          <!-- City Filter -->
          <div class="flex flex-col gap-1.5 lg:col-span-3">
            <label
              class="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              <MapPin :size="13" class="text-neutral-400 dark:text-neutral-500" />
              <span>{{ t('properties.city_filter') }}</span>
            </label>
            <div class="relative">
              <select v-model="selectedCity"
                class="h-10 w-full appearance-none rounded-lg border border-neutral-200 bg-neutral-50/70 px-3 pr-8 text-sm font-medium text-neutral-900 transition-colors focus:border-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:border-neutral-800 dark:bg-neutral-950/70 dark:text-white dark:focus:border-neutral-600 dark:focus:bg-neutral-900">
                <option value="">{{ t('properties.all_cities') }}</option>
                <option v-for="c in availableCities" :key="c" :value="c">{{ c }}</option>
              </select>
              <ChevronDown :size="14"
                class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
            </div>
          </div>

          <!-- Bedrooms Filter -->
          <div class="flex flex-col gap-1.5 lg:col-span-2">
            <label
              class="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              <Bed :size="13" class="text-neutral-400 dark:text-neutral-500" />
              <span>{{ t('properties.bedrooms') }}</span>
            </label>
            <div class="relative">
              <select v-model="selectedBeds"
                class="h-10 w-full appearance-none rounded-lg border border-neutral-200 bg-neutral-50/70 px-3 pr-8 text-sm font-medium text-neutral-900 transition-colors focus:border-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:border-neutral-800 dark:bg-neutral-950/70 dark:text-white dark:focus:border-neutral-600 dark:focus:bg-neutral-900">
                <option value="">{{ t('properties.any_beds') }}</option>
                <option :value="1">1 Bed</option>
                <option :value="2">2 Beds</option>
                <option :value="3">3+ Beds</option>
              </select>
              <ChevronDown :size="14"
                class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
            </div>
          </div>

          <!-- Price Range (Combined Min - Max) -->
          <div class="flex flex-col gap-1.5 lg:col-span-4">
            <label
              class="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              <DollarSign :size="13" class="text-neutral-400 dark:text-neutral-500" />
              <span>{{ t('properties.rent_range') }}</span>
            </label>
            <div
              class="flex h-10 items-center rounded-lg border border-neutral-200 bg-neutral-50/70 px-3 transition-colors focus-within:border-neutral-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-neutral-900/10 dark:border-neutral-800 dark:bg-neutral-950/70 dark:focus-within:border-neutral-600 dark:focus-within:bg-neutral-900">
              <span class="text-xs font-semibold text-neutral-400 dark:text-neutral-500">$</span>
              <input v-model.number="minPrice" type="number" placeholder="Min" min="0" step="50"
                aria-label="Minimum Rent"
                class="w-full bg-transparent px-1.5 text-sm font-medium text-neutral-900 [appearance:textfield] placeholder:text-neutral-400 focus:outline-none dark:text-white [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
              <span class="px-1 text-xs text-neutral-300 dark:text-neutral-600">—</span>
              <span class="text-xs font-semibold text-neutral-400 dark:text-neutral-500">$</span>
              <input v-model.number="maxPrice" type="number" placeholder="Max" min="0" step="50"
                aria-label="Maximum Rent"
                class="w-full bg-transparent px-1.5 text-sm font-medium text-neutral-900 [appearance:textfield] placeholder:text-neutral-400 focus:outline-none dark:text-white [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 lg:col-span-3">
            <button type="submit"
              class="shadow-xs inline-flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100">
              <SlidersHorizontal :size="14" />
              <span>{{ t('properties.apply_filters') }}</span>
            </button>
            <button type="button" @click="resetFilters" :disabled="!hasActiveFilters" :class="[
              'inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900',
              hasActiveFilters
                ? 'cursor-pointer border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700'
                : 'cursor-not-allowed border-neutral-200/60 bg-neutral-100/50 text-neutral-400 opacity-60 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-600',
            ]" :title="t('properties.reset_filters')">
              <RotateCcw :size="14" />
              <span>{{ t('common.reset') }}</span>
            </button>
          </div>
        </div>
      </form>
    </section>

    <!-- View Mode Switcher Bar -->
    <section class="flex flex-col items-start justify-between gap-3 py-1 sm:flex-row sm:items-center">
      <div class="text-xs text-neutral-600 dark:text-neutral-400 sm:text-sm">
        <strong class="text-neutral-900 dark:text-white">{{ properties.length }}</strong>
        {{
          properties.length === 1
            ? t('properties.property_found_singular')
            : t('properties.properties_found', { count: properties.length })
        }}
      </div>

      <div
        class="inline-flex max-w-full items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-200/60 p-1 dark:border-neutral-700/60 dark:bg-neutral-800/60">
        <button type="button" @click="viewMode = 'grid'" :class="[
          'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors sm:px-3',
          viewMode === 'grid'
            ? 'shadow-xs bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white'
            : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white',
        ]" :title="t('properties.view_cards')">
          <LayoutGrid :size="14" />
          <span class="hidden sm:inline">{{ t('properties.view_cards') }}</span>
        </button>
        <button type="button" @click="viewMode = 'split'" :class="[
          'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors sm:px-3',
          viewMode === 'split'
            ? 'shadow-xs bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white'
            : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white',
        ]" :title="t('properties.view_split_map')">
          <Columns2 :size="14" />
          <span class="hidden sm:inline">{{ t('properties.view_split_map') }}</span>
        </button>
        <button type="button" @click="viewMode = 'map'" :class="[
          'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors sm:px-3',
          viewMode === 'map'
            ? 'shadow-xs bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white'
            : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white',
        ]" :title="t('properties.view_map')">
          <MapIcon :size="14" />
          <span class="hidden sm:inline">{{ t('properties.view_map') }}</span>
        </button>
      </div>
    </section>

    <!-- Error State -->
    <div v-if="errorMessage" class="alert-error">
      {{ errorMessage }}
    </div>

    <!-- Loading Skeleton State -->
    <div v-if="isLoading" class="w-full">
      <!-- 1. Map View Skeleton -->
      <div
        v-if="viewMode === 'map'"
        class="shadow-xs flex h-[650px] w-full animate-pulse flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-100 p-8 text-neutral-400 dark:border-neutral-800 dark:bg-neutral-800/60"
      >
        <MapIcon :size="40" class="mb-3 opacity-40" />
        <div class="h-4 w-40 rounded bg-neutral-200 dark:bg-neutral-700" />
      </div>

      <!-- 2. Split View Skeleton -->
      <div v-else-if="viewMode === 'split'" class="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div class="flex flex-col gap-4 lg:col-span-6">
          <PropertyCardSkeleton v-for="i in 3" :key="i" />
        </div>
        <div class="hidden lg:col-span-6 lg:block">
          <div
            class="shadow-xs sticky top-24 flex h-[620px] w-full animate-pulse flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-100 p-8 text-neutral-400 dark:border-neutral-800 dark:bg-neutral-800/60"
          >
            <MapIcon :size="40" class="mb-3 opacity-40" />
            <div class="h-4 w-40 rounded bg-neutral-200 dark:bg-neutral-700" />
          </div>
        </div>
      </div>

      <!-- 3. Standard Grid Cards Skeleton -->
      <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <PropertyCardSkeleton v-for="i in 6" :key="i" />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="properties.length === 0"
      class="flex flex-col items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-16 text-center dark:border-neutral-800 dark:bg-neutral-900">
      <div
        class="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500">
        <Building :size="32" />
      </div>
      <h3 class="text-lg font-bold text-neutral-900 dark:text-white">
        {{ t('properties.no_properties') }}
      </h3>
      <p class="max-w-sm text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm">
        {{ t('properties.no_properties_desc') }}
      </p>
      <button @click="resetFilters" class="btn-secondary mt-2">
        <RotateCcw :size="14" />
        <span>{{ t('properties.clear_all_filters') }}</span>
      </button>
    </div>

    <!-- 1. FULL MAP VIEW -->
    <div v-else-if="viewMode === 'map'"
      class="shadow-xs overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <ClientOnly>
        <PropertiesMapExplorer :properties="properties" :selected-id="activePropertyId" height="650px"
          @select="selectProperty" />
        <template #fallback>
          <div class="p-10 text-center text-sm text-neutral-400">{{ t('common.please_wait') }}</div>
        </template>
      </ClientOnly>
    </div>

    <!-- 2. SPLIT VIEW (List on Left, Sticky Map on Right) -->
    <div v-else-if="viewMode === 'split'" class="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
      <!-- Left: Property Cards Column -->
      <div class="flex flex-col gap-4 lg:col-span-6">
        <article v-for="property in paginatedProperties" :key="property.id" :class="[
          'shadow-xs group flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white transition-all dark:bg-neutral-900',
          activePropertyId === property.id
            ? 'border-blue-600 ring-1 ring-blue-600 dark:border-blue-500'
            : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700',
        ]" @mouseenter="selectProperty(property.id)" @click="selectProperty(property.id)">
          <!-- Card Image Header -->
          <div class="relative aspect-16/10 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
            <img :src="getPropertyThumbnail(property)" :alt="property.title"
              class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy" />
            <div class="absolute inset-x-3 top-3 flex items-center justify-between">
              <span :class="[
                'badge badge-pill',
                property.availableUnitsCount > 0 ? 'badge-success' : 'badge-warning',
              ]">
                <span class="badge-dot" />
                <span>{{
                  property.availableUnitsCount > 0
                    ? t('properties.unit_available_badge', { count: property.availableUnitsCount })
                    : t('properties.unit_fully_leased_badge')
                }}</span>
              </span>
              <span
                class="backdrop-blur-xs rounded-md bg-neutral-950/80 px-2 py-0.5 text-[11px] font-semibold text-white">{{
                  property.city }}</span>
            </div>
          </div>

          <div class="flex flex-1 flex-col justify-between gap-3 p-5">
            <div class="flex flex-col gap-1.5">
              <h2
                class="text-base font-bold text-neutral-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 sm:text-lg">
                <NuxtLink :to="`/properties/${property.id}`">{{ property.title }}</NuxtLink>
              </h2>

              <div class="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                <MapPin :size="13" class="shrink-0 text-emerald-500" />
                <span>{{ property.addressLine1 }}, {{ property.city }}</span>
              </div>

              <p class="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
                {{ property.description }}
              </p>
            </div>

            <div class="flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
              <div class="flex flex-col">
                <span class="text-[10px] font-bold uppercase text-neutral-400 dark:text-neutral-500">{{
                  t('properties.starting_from') }}</span>
                <div class="flex items-baseline gap-1">
                  <template v-if="property.minRent > 0">
                    <span class="text-base font-extrabold text-neutral-900 dark:text-white">${{
                      property.minRent.toLocaleString() }}</span>
                    <span class="text-xs text-neutral-500 dark:text-neutral-400">{{
                      t('properties.per_month_short')
                    }}</span>
                  </template>
                  <template v-else>
                    <span class="text-xs font-semibold text-neutral-500">{{
                      t('properties.inquire_rates')
                    }}</span>
                  </template>
                </div>
              </div>

              <NuxtLink :to="`/properties/${property.id}`" class="btn-primary btn-sm">
                <span>{{ t('properties.view_cta') }}</span>
                <ArrowRight :size="13" />
              </NuxtLink>
            </div>
          </div>
        </article>

        <!-- Split View Pagination -->
        <div class="pt-2">
          <AppPagination v-model:currentPage="currentPage" v-model:pageSize="pageSize" :pageSizeOptions="[4, 6, 8, 12]"
            :totalItems="properties.length" :itemName="t('properties.units')" :bordered="false" />
        </div>
      </div>

      <!-- Right: Sticky OpenFreeMap Explorer -->
      <div class="lg:sticky lg:top-20 lg:col-span-6">
        <div
          class="shadow-xs overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <ClientOnly>
            <PropertiesMapExplorer :properties="properties" :selected-id="activePropertyId" height="620px"
              @select="selectProperty" />
            <template #fallback>
              <div class="p-10 text-center text-sm text-neutral-400">
                {{ t('common.please_wait') }}
              </div>
            </template>
          </ClientOnly>
        </div>
      </div>
    </div>

    <!-- 3. STANDARD GRID CARDS VIEW -->
    <div v-else class="flex flex-col gap-6">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <article v-for="property in paginatedProperties" :key="property.id"
          class="shadow-xs group flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700">
          <!-- Card Image Header -->
          <div class="relative aspect-16/10 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
            <img :src="getPropertyThumbnail(property)" :alt="property.title"
              class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy" />
            <div class="absolute inset-x-3 top-3 flex items-center justify-between">
              <span :class="[
                'badge badge-pill',
                property.availableUnitsCount > 0 ? 'badge-success' : 'badge-warning',
              ]">
                <span class="badge-dot" />
                <span>{{
                  property.availableUnitsCount > 0
                    ? t('properties.unit_available_badge', { count: property.availableUnitsCount })
                    : t('properties.unit_fully_leased_badge')
                }}</span>
              </span>
              <span
                class="backdrop-blur-xs rounded-md bg-neutral-950/80 px-2 py-0.5 text-[11px] font-semibold text-white">{{
                  property.city }}</span>
            </div>
          </div>

          <div class="flex flex-1 flex-col justify-between gap-3 p-5">
            <div class="flex flex-col gap-1.5">
              <h2
                class="text-base font-bold text-neutral-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 sm:text-lg">
                <NuxtLink :to="`/properties/${property.id}`">{{ property.title }}</NuxtLink>
              </h2>

              <div class="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                <MapPin :size="14" class="shrink-0 text-emerald-500" />
                <span>{{ property.addressLine1 }}, {{ property.city }}, {{ property.state }}
                  {{ property.postalCode }}</span>
              </div>

              <p class="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
                {{ property.description }}
              </p>

              <!-- Amenities list -->
              <div v-if="property.amenities?.length" class="mt-2 flex flex-wrap gap-1">
                <span v-for="amenity in property.amenities.slice(0, 4)" :key="amenity"
                  class="inline-flex items-center gap-1 rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                  <Check :size="11" class="text-emerald-500" />
                  {{ amenity }}
                </span>
                <span v-if="property.amenities.length > 4"
                  class="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500 dark:bg-neutral-800">
                  {{ t('properties.more_amenities', { count: property.amenities.length - 4 }) }}
                </span>
              </div>
            </div>

            <div class="flex items-center justify-between border-t border-neutral-100 pt-4 dark:border-neutral-800">
              <div class="flex flex-col">
                <span class="text-[10px] font-bold uppercase text-neutral-400 dark:text-neutral-500">{{
                  t('properties.starting_from') }}</span>
                <div class="flex items-baseline gap-1">
                  <template v-if="property.minRent > 0">
                    <span class="text-base font-extrabold text-neutral-900 dark:text-white sm:text-lg">${{
                      property.minRent.toLocaleString() }}</span>
                    <span v-if="property.maxRent > property.minRent" class="text-xs text-neutral-500">
                      – ${{ property.maxRent.toLocaleString() }}
                    </span>
                    <span class="text-xs text-neutral-500 dark:text-neutral-400">{{
                      t('properties.per_month_short')
                    }}</span>
                  </template>
                  <template v-else>
                    <span class="text-xs font-semibold text-neutral-500">{{
                      t('properties.inquire_rates')
                    }}</span>
                  </template>
                </div>
              </div>

              <NuxtLink :to="`/properties/${property.id}`" class="btn-primary">
                <span>{{ t('properties.view_units') }}</span>
                <ArrowRight :size="14" />
              </NuxtLink>
            </div>
          </div>
        </article>
      </div>

      <!-- Grid Cards Pagination -->
      <AppPagination v-model:currentPage="currentPage" v-model:pageSize="pageSize" :pageSizeOptions="[6, 12, 18, 24]"
        :totalItems="properties.length" :itemName="t('properties.units')" :bordered="false" />
    </div>
  </div>
</template>
