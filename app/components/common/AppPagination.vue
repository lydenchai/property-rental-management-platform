<script setup lang="ts">
import { computed } from 'vue';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from '@lucide/vue';

interface Props {
  currentPage: number;
  totalItems: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  showPageSize?: boolean;
  itemName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  pageSize: 5,
  pageSizeOptions: () => [5, 10, 20, 50],
  showPageSize: true,
  itemName: 'items',
});

const emit = defineEmits<{
  (e: 'update:currentPage', page: number): void;
  (e: 'update:pageSize', size: number): void;
}>();

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(props.totalItems / props.pageSize));
});

const startItem = computed(() => {
  if (props.totalItems === 0) return 0;
  return (props.currentPage - 1) * props.pageSize + 1;
});

const endItem = computed(() => {
  return Math.min(props.totalItems, props.currentPage * props.pageSize);
});

// Calculate visible page buttons with ellipsis windowing
const displayedPages = computed(() => {
  const current = props.currentPage;
  const total = totalPages.value;
  const pages: (number | string)[] = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // Always include page 1
    pages.push(1);

    if (current > 3) {
      pages.push('...');
    }

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 2) {
      pages.push('...');
    }

    // Always include last page
    pages.push(total);
  }

  return pages;
});

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value || page === props.currentPage) return;
  emit('update:currentPage', page);
}

function onPageSizeChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  const newSize = Number(target.value);
  emit('update:pageSize', newSize);
  emit('update:currentPage', 1); // Reset to first page
}
</script>

<template>
  <div
    v-if="totalItems > 0"
    class="flex flex-col items-center justify-between gap-3 border-t border-neutral-200 bg-white px-5 py-3 text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 sm:flex-row"
  >
    <!-- Left: Items Info & Per-Page Selector -->
    <div class="flex flex-wrap items-center gap-3">
      <span>
        {{ $t('common.showing') }}
        <strong class="font-medium text-neutral-900 dark:text-white"
          >{{ startItem }}–{{ endItem }}</strong
        >
        {{ $t('common.of') }}
        <strong class="font-medium text-neutral-900 dark:text-white">{{ totalItems }}</strong>
        {{ itemName }}
      </span>

      <div
        v-if="showPageSize"
        class="flex items-center gap-1.5 border-l border-neutral-200 pl-2 dark:border-neutral-700"
      >
        <label for="page-size-select" class="text-[11px] text-neutral-400">{{
          $t('common.per_page')
        }}</label>
        <select
          id="page-size-select"
          :value="pageSize"
          @change="onPageSizeChange"
          class="focus:outline-hidden rounded border border-neutral-300 bg-white px-2 py-0.5 text-xs text-neutral-800 focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
        >
          <option v-for="opt in pageSizeOptions" :key="opt" :value="opt">
            {{ opt }}
          </option>
        </select>
      </div>
    </div>

    <!-- Right: Page Navigation Buttons -->
    <nav class="inline-flex items-center gap-1" aria-label="Pagination Navigation">
      <!-- First Page -->
      <button
        type="button"
        :disabled="currentPage <= 1"
        @click="goToPage(1)"
        class="flex h-7 w-7 cursor-pointer items-center justify-center rounded border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        :title="$t('common.first_page')"
        :aria-label="$t('common.first_page')"
      >
        <ChevronsLeft :size="14" />
      </button>

      <!-- Previous Page -->
      <button
        type="button"
        :disabled="currentPage <= 1"
        @click="goToPage(currentPage - 1)"
        class="flex h-7 w-7 cursor-pointer items-center justify-center rounded border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        :title="$t('common.prev_page')"
        :aria-label="$t('common.prev_page')"
      >
        <ChevronLeft :size="14" />
      </button>

      <!-- Page Numbers -->
      <template v-for="(item, idx) in displayedPages" :key="idx">
        <span v-if="item === '...'" class="px-1 text-neutral-400"> &hellip; </span>
        <button
          v-else
          type="button"
          :class="[
            'flex h-7 min-w-[28px] cursor-pointer items-center justify-center rounded border px-2 text-xs transition-colors',
            item === currentPage
              ? 'shadow-xs border-neutral-900 bg-neutral-900 font-semibold text-white dark:border-blue-600 dark:bg-blue-600'
              : 'border border-neutral-200 bg-white font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700',
          ]"
          :aria-current="item === currentPage ? 'page' : undefined"
          @click="goToPage(Number(item))"
        >
          {{ item }}
        </button>
      </template>

      <!-- Next Page -->
      <button
        type="button"
        :disabled="currentPage >= totalPages"
        @click="goToPage(currentPage + 1)"
        class="flex h-7 w-7 cursor-pointer items-center justify-center rounded border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        :title="$t('common.next_page')"
        :aria-label="$t('common.next_page')"
      >
        <ChevronRight :size="14" />
      </button>

      <!-- Last Page -->
      <button
        type="button"
        :disabled="currentPage >= totalPages"
        @click="goToPage(totalPages)"
        class="flex h-7 w-7 cursor-pointer items-center justify-center rounded border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        :title="$t('common.last_page')"
        :aria-label="$t('common.last_page')"
      >
        <ChevronsRight :size="14" />
      </button>
    </nav>
  </div>
</template>
