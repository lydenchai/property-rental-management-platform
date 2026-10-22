<script setup lang="ts">
import { computed } from 'vue';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from '@lucide/vue';

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
  <div class="pagination-container" v-if="totalItems > 0">
    <!-- Left: Items Info & Per-Page Selector -->
    <div class="pagination-info-group">
      <span class="pagination-summary">
        Showing <strong class="summary-highlight">{{ startItem }}–{{ endItem }}</strong> of <strong class="summary-highlight">{{ totalItems }}</strong> {{ itemName }}
      </span>

      <div v-if="showPageSize" class="page-size-selector">
        <label for="page-size-select" class="page-size-label">Per page</label>
        <select
          id="page-size-select"
          :value="pageSize"
          @change="onPageSizeChange"
          class="page-size-select"
        >
          <option v-for="opt in pageSizeOptions" :key="opt" :value="opt">
            {{ opt }}
          </option>
        </select>
      </div>
    </div>

    <!-- Right: Page Navigation Buttons -->
    <nav class="pagination-nav" aria-label="Pagination Navigation">
      <!-- First Page -->
      <button
        type="button"
        class="pagination-btn pagination-arrow"
        :disabled="currentPage <= 1"
        @click="goToPage(1)"
        title="First Page"
        aria-label="First Page"
      >
        <ChevronsLeft :size="15" />
      </button>

      <!-- Previous Page -->
      <button
        type="button"
        class="pagination-btn pagination-arrow"
        :disabled="currentPage <= 1"
        @click="goToPage(currentPage - 1)"
        title="Previous Page"
        aria-label="Previous Page"
      >
        <ChevronLeft :size="15" />
      </button>

      <!-- Page Numbers -->
      <template v-for="(item, idx) in displayedPages" :key="idx">
        <span v-if="item === '...'" class="pagination-ellipsis">
          &hellip;
        </span>
        <button
          v-else
          type="button"
          :class="['pagination-btn', 'pagination-num', { active: item === currentPage }]"
          :aria-current="item === currentPage ? 'page' : undefined"
          @click="goToPage(Number(item))"
        >
          {{ item }}
        </button>
      </template>

      <!-- Next Page -->
      <button
        type="button"
        class="pagination-btn pagination-arrow"
        :disabled="currentPage >= totalPages"
        @click="goToPage(currentPage + 1)"
        title="Next Page"
        aria-label="Next Page"
      >
        <ChevronRight :size="15" />
      </button>

      <!-- Last Page -->
      <button
        type="button"
        class="pagination-btn pagination-arrow"
        :disabled="currentPage >= totalPages"
        @click="goToPage(totalPages)"
        title="Last Page"
        aria-label="Last Page"
      >
        <ChevronsRight :size="15" />
      </button>
    </nav>
  </div>
</template>

<style scoped>
.pagination-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 1.15rem;
  background: var(--bg-surface);
  border-top: 1px solid var(--border-subtle);
  border-bottom-left-radius: inherit;
  border-bottom-right-radius: inherit;
  font-size: 0.825rem;
  color: var(--text-muted);
  position: sticky;
  bottom: 0;
  z-index: 10;
}

@media (min-width: 640px) {
  .pagination-container {
    flex-direction: row;
    gap: 1rem;
  }
}

.pagination-info-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.pagination-summary {
  font-size: 0.825rem;
  color: var(--text-muted);
}

.summary-highlight {
  color: var(--text-main);
  font-weight: 600;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.page-size-label {
  font-size: 0.775rem;
  color: var(--text-dim);
}

.page-size-select {
  padding: 0.25rem 0.55rem;
  font-size: 0.775rem;
  font-weight: 500;
  color: var(--text-main);
  background: var(--bg-primary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.page-size-select:focus {
  border-color: var(--border-focus);
}

.pagination-nav {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.pagination-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 0.4rem;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-muted);
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  user-select: none;
  transition: all 0.15s ease;
  box-shadow: none;
}

.pagination-btn:hover:not(:disabled) {
  color: var(--text-main);
  background: var(--bg-surface-hover);
  border-color: var(--border-subtle);
}

.pagination-btn.active {
  background: var(--primary);
  color: #ffffff;
  border-color: var(--primary);
  font-weight: 600;
}

html.dark .pagination-btn.active {
  background: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
}

.pagination-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  pointer-events: none;
}

.pagination-arrow {
  color: var(--text-muted);
}

.pagination-arrow:hover:not(:disabled) {
  color: var(--text-main);
  background: var(--bg-primary);
  border-color: var(--border-subtle);
}

.pagination-ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 32px;
  color: var(--text-dim);
  font-size: 0.85rem;
  letter-spacing: 0.1em;
}
</style>
