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
  <div class="table-card-shell card-flat">
    <!-- Header / Title (Optional) -->
    <div v-if="title || subtitle || $slots.header" class="table-card-header">
      <slot name="header">
        <div class="header-titles">
          <h3 v-if="title" class="table-card-title">{{ title }}</h3>
          <p v-if="subtitle" class="table-card-subtitle">{{ subtitle }}</p>
        </div>
      </slot>
    </div>

    <!-- Toolbar: Search + Filter Tabs (Left) + Actions (Right) -->
    <div v-if="showSearch || $slots['toolbar-start'] || $slots['toolbar-end']" class="table-card-toolbar">
      <div class="toolbar-left">
        <!-- Search Input -->
        <div v-if="showSearch" class="table-search-box">
          <Search :size="15" class="search-box-icon" />
          <input type="text" :value="search" @input="onSearchInput" :placeholder="searchPlaceholder"
            class="table-search-control" />
          <button v-if="search" type="button" class="search-clear-btn" @click="emit('update:search', '')"
            :aria-label="$t('common.clear')">
            <X :size="13" />
          </button>
        </div>

        <!-- Custom filters / tabs slot -->
        <slot name="toolbar-start" />
      </div>

      <!-- Action buttons slot -->
      <div v-if="$slots['toolbar-end']" class="toolbar-right">
        <slot name="toolbar-end" />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="table-card-loading">
      <slot name="loading">
        <div class="loading-spinner"></div>
        <p class="loading-label">{{ $t('common.loading') }}</p>
      </slot>
    </div>

    <!-- Empty State -->
    <div v-else-if="isEmpty" class="table-card-empty">
      <slot name="empty">
        <div class="empty-icon-wrap">
          <component :is="emptyIcon" :size="24" class="empty-icon-svg" />
        </div>
        <h4 class="empty-title">{{ emptyTitle }}</h4>
        <p class="empty-desc">{{ emptyDescription }}</p>
        <div v-if="$slots['empty-action']" class="empty-action-wrap">
          <slot name="empty-action" />
        </div>
      </slot>
    </div>

    <!-- Table Container (Horizontal Scrolling wrapper) -->
    <div v-else class="table-card-content">
      <div class="data-table-container">
        <slot />
      </div>

      <!-- Integrated Pagination Footer -->
      <AppPagination v-if="showPagination && totalItems > 0" :current-page="currentPage" :page-size="pageSize"
        :total-items="totalItems" :page-size-options="pageSizeOptions" :item-name="itemName"
        @update:current-page="emit('update:currentPage', $event)" @update:page-size="emit('update:pageSize', $event)" />
    </div>
  </div>
</template>

<style scoped>
.table-card-shell {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  transition: border-color 0.15s ease;
  padding: 0;
}

.table-card-header {
  padding: 1.25rem 1.5rem 0.5rem;
  border-bottom: 1px solid var(--border-subtle);
}

.table-card-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-main);
  letter-spacing: -0.01em;
}

.table-card-subtitle {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 0.2rem;
}

.table-card-toolbar {
  padding: 0.85rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-surface);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  flex-wrap: wrap;
  min-width: 240px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.table-search-box {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 240px;
  max-width: 380px;
  flex: 1;
}

.search-box-icon {
  position: absolute;
  left: 0.75rem;
  color: var(--text-dim);
  pointer-events: none;
}

.table-search-control {
  width: 100%;
  padding: 0.45rem 2rem 0.45rem 2.2rem;
  font-size: 0.825rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  color: var(--text-main);
  outline: none;
  transition: all 0.15s ease;
}

.table-search-control:focus {
  border-color: var(--border-focus);
  background: var(--bg-surface);
}

.table-search-control::placeholder {
  color: var(--text-dim);
}

.search-clear-btn {
  position: absolute;
  right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: transparent;
  border: none;
  color: var(--text-dim);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.15s ease;
}

.search-clear-btn:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}

/* Loading State */
.table-card-loading {
  padding: 3.5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: var(--text-muted);
}

.loading-label {
  font-size: 0.825rem;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-subtle);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Empty State */
.table-card-empty {
  padding: 3.5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.4rem;
}

.empty-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
  border: 1px solid var(--border-subtle);
  color: var(--text-dim);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.empty-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-main);
}

.empty-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
  max-width: 400px;
  line-height: 1.5;
}

.empty-action-wrap {
  margin-top: 0.75rem;
}

/* Content & Data Table */
.table-card-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.data-table-container {
  width: 100%;
  overflow-x: auto;
  overflow-y: auto;
  max-height: clamp(240px, calc(100vh - 380px), 520px);
  border: none;
  border-radius: 0;
  background: transparent;
  scrollbar-width: thin;
  scrollbar-color: var(--border-subtle) transparent;
}

.data-table-container::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.data-table-container::-webkit-scrollbar-track {
  background: transparent;
}

.data-table-container::-webkit-scrollbar-thumb {
  background: var(--border-subtle);
  border-radius: var(--radius-full);
}
</style>
