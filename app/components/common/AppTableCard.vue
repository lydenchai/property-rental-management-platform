<script setup lang="ts">
import { computed } from 'vue';
import { Search, FileText, X } from '@lucide/vue';
import AppPagination from './AppPagination.vue';

interface Props {
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  search?: string;
  showSearch?: boolean;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: any;
  currentPage?: number;
  pageSize?: number;
  totalItems?: number;
  pageSizeOptions?: number[];
  itemName?: string;
  showPagination?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
  searchPlaceholder: 'Search records...',
  search: '',
  showSearch: true,
  isLoading: false,
  isEmpty: false,
  emptyTitle: 'No records found',
  emptyDescription: 'Try adjusting your search terms or filters to find what you are looking for.',
  emptyIcon: FileText,
  currentPage: 1,
  pageSize: 5,
  totalItems: 0,
  pageSizeOptions: () => [5, 10, 20, 50],
  itemName: 'records',
  showPagination: true,
});

const emit = defineEmits<{
  (e: 'update:search', value: string): void;
  (e: 'update:currentPage', page: number): void;
  (e: 'update:pageSize', size: number): void;
}>();

function onSearchInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit('update:search', target.value);
}
</script>

<template>
  <div
    class="shadow-xs flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
  >
    <!-- Header / Title (Optional) -->
    <div
      v-if="title || subtitle || $slots.header"
      class="border-b border-neutral-200 px-6 py-4 dark:border-neutral-800"
    >
      <slot name="header">
        <div>
          <h3 v-if="title" class="text-base font-semibold text-neutral-900 dark:text-white">
            {{ title }}
          </h3>
          <p v-if="subtitle" class="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            {{ subtitle }}
          </p>
        </div>
      </slot>
    </div>

    <!-- Toolbar: Search + Filter Tabs (Left) + Actions (Right) -->
    <div
      v-if="showSearch || $slots['toolbar-start'] || $slots['toolbar-end']"
      class="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-white px-5 py-3.5 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div class="flex min-w-[240px] flex-1 flex-wrap items-center gap-3">
        <!-- Search Input -->
        <div v-if="showSearch" class="relative flex w-full items-center sm:w-64">
          <Search :size="14" class="pointer-events-none absolute left-2.5 text-neutral-400" />
          <input
            type="text"
            :value="search"
            @input="onSearchInput"
            :placeholder="searchPlaceholder"
            class="focus:outline-hidden w-full rounded-lg border border-neutral-300 bg-white py-1.5 pl-8 pr-7 text-xs text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
          <button
            v-if="search"
            type="button"
            class="absolute right-2 cursor-pointer text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            @click="emit('update:search', '')"
            :aria-label="$t('common.clear')"
          >
            <X :size="13" />
          </button>
        </div>

        <!-- Custom filters / tabs slot -->
        <slot name="toolbar-start" />
      </div>

      <!-- Action buttons slot -->
      <div v-if="$slots['toolbar-end']" class="flex items-center gap-2">
        <slot name="toolbar-end" />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center space-y-2 px-4 py-12">
      <slot name="loading">
        <div
          class="h-7 w-7 animate-spin rounded-full border-2 border-neutral-200 border-t-primary-600 dark:border-neutral-700"
        ></div>
        <p class="text-xs text-neutral-500 dark:text-neutral-400">{{ $t('common.loading') }}</p>
      </slot>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="isEmpty"
      class="flex flex-col items-center justify-center space-y-2 px-4 py-12 text-center"
    >
      <slot name="empty">
        <div
          class="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400 dark:bg-neutral-800"
        >
          <component :is="emptyIcon" :size="20" />
        </div>
        <h4 class="text-sm font-semibold text-neutral-900 dark:text-white">{{ emptyTitle }}</h4>
        <p class="max-w-sm text-xs text-neutral-500 dark:text-neutral-400">
          {{ emptyDescription }}
        </p>
        <div v-if="$slots['empty-action']" class="pt-2">
          <slot name="empty-action" />
        </div>
      </slot>
    </div>

    <!-- Table Container (Horizontal Scrolling wrapper) -->
    <div v-else class="flex flex-col">
      <div class="overflow-x-auto">
        <slot />
      </div>

      <!-- Integrated Pagination Footer -->
      <AppPagination
        v-if="showPagination && totalItems > 0"
        :current-page="currentPage"
        :page-size="pageSize"
        :total-items="totalItems"
        :page-size-options="pageSizeOptions"
        :item-name="itemName"
        @update:current-page="emit('update:currentPage', $event)"
        @update:page-size="emit('update:pageSize', $event)"
      />
    </div>
  </div>
</template>
