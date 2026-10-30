<script setup lang="ts">
import { computed, useSlots } from 'vue';
import { ArrowUp, ArrowDown, ArrowUpDown, Inbox } from '@lucide/vue';
import type { TableColumn, ColumnAlign } from '~/../shared/types/table';
import AppPagination from './AppPagination.vue';

interface Props {
  columns: TableColumn[];
  items?: any[];
  keyField?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc' | null;
  minWidth?: string;
  hoverable?: boolean;
  striped?: boolean;
  bordered?: boolean;
  isLoading?: boolean;
  loadingRows?: number;
  showEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: any;
  showPagination?: boolean;
  currentPage?: number;
  pageSize?: number;
  totalItems?: number;
  pageSizeOptions?: number[];
  itemName?: string;
  caption?: string;
  tableClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  columns: () => [],
  items: () => [],
  keyField: 'id',
  sortBy: '',
  sortOrder: null,
  minWidth: 'min-w-full',
  hoverable: true,
  striped: false,
  bordered: false,
  isLoading: false,
  loadingRows: 5,
  showEmpty: false,
  emptyTitle: 'No records found',
  emptyDescription: 'There are no items to display at this time.',
  emptyIcon: Inbox,
  showPagination: false,
  currentPage: 1,
  pageSize: 10,
  totalItems: 0,
  itemName: 'records',
  caption: '',
  tableClass: '',
});

const emit = defineEmits<{
  (e: 'update:sortBy', key: string): void;
  (e: 'update:sortOrder', order: 'asc' | 'desc' | null): void;
  (e: 'sort', payload: { key: string; order: 'asc' | 'desc' | null }): void;
  (e: 'row-click', item: any, index: number): void;
  (e: 'update:currentPage', page: number): void;
  (e: 'update:pageSize', size: number): void;
}>();

const slots = useSlots();

const safeItems = computed<any[]>(() => {
  return Array.isArray(props.items) ? props.items : [];
});

const safeColumns = computed<TableColumn[]>(() => {
  return Array.isArray(props.columns) ? props.columns : [];
});

function getAlignmentClass(align?: ColumnAlign): string {
  if (align === 'center') return 'text-center';
  if (align === 'right') return 'text-right';
  return 'text-left';
}

function getHeaderJustifyClass(align?: ColumnAlign): string {
  if (align === 'center') return 'justify-center';
  if (align === 'right') return 'justify-end';
  return 'justify-start';
}

function handleSort(col: TableColumn) {
  if (!col.sortable) return;

  let nextOrder: 'asc' | 'desc' | null = 'asc';

  if (props.sortBy === col.key) {
    if (props.sortOrder === 'asc') {
      nextOrder = 'desc';
    } else if (props.sortOrder === 'desc') {
      nextOrder = null;
    } else {
      nextOrder = 'asc';
    }
  }

  const nextKey = nextOrder ? col.key : '';
  emit('update:sortBy', nextKey);
  emit('update:sortOrder', nextOrder);
  emit('sort', { key: nextKey, order: nextOrder });
}

function onRowClick(item: any, index: number) {
  emit('row-click', item, index);
}

function getItemKey(item: any, index: number): string | number {
  if (item && props.keyField && item[props.keyField] !== undefined) {
    return item[props.keyField];
  }
  return index;
}

function getHeaderSlotName(colKey: string): string | null {
  if (slots[`header-${colKey}`]) return `header-${colKey}`;
  if (slots[`header(${colKey})`]) return `header(${colKey})`;
  return null;
}

function getCellSlotName(colKey: string): string | null {
  if (slots[`cell-${colKey}`]) return `cell-${colKey}`;
  if (slots[`cell(${colKey})`]) return `cell(${colKey})`;
  return null;
}
</script>

<template>
  <div class="flex w-full flex-col">
    <!-- Table Horizontal Scroll Container -->
    <div class="overflow-x-auto scroll-smooth">
      <table
        :class="[
          'w-full border-collapse text-left text-sm text-neutral-700 dark:text-neutral-200',
          minWidth,
          bordered ? 'border border-neutral-200 dark:border-neutral-800' : '',
          tableClass,
        ]"
      >
        <caption v-if="caption" class="sr-only">
          {{
            caption
          }}
        </caption>

        <!-- Table Header -->
        <thead
          class="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-400"
        >
          <tr>
            <th
              v-for="col in safeColumns"
              :key="col.key"
              scope="col"
              :class="[
                'px-4 py-3',
                getAlignmentClass(col.align),
                col.headerClass || col.class || '',
                col.sortable
                  ? 'cursor-pointer select-none transition-colors hover:text-neutral-900 dark:hover:text-white'
                  : '',
              ]"
              @click="handleSort(col)"
            >
              <div :class="['inline-flex items-center gap-1.5', getHeaderJustifyClass(col.align)]">
                <!-- Direct slot resolution: header-key -> header(key) -> label -->
                <slot
                  v-if="getHeaderSlotName(col.key)"
                  :name="getHeaderSlotName(col.key)!"
                  :column="col"
                />
                <span v-else>{{ col.label || col.key }}</span>

                <!-- Sorting indicator icon -->
                <template v-if="col.sortable">
                  <ArrowUp
                    v-if="sortBy === col.key && sortOrder === 'asc'"
                    :size="13"
                    class="text-primary-600 dark:text-primary-400"
                  />
                  <ArrowDown
                    v-else-if="sortBy === col.key && sortOrder === 'desc'"
                    :size="13"
                    class="text-primary-600 dark:text-primary-400"
                  />
                  <ArrowUpDown
                    v-else
                    :size="13"
                    class="text-neutral-400 opacity-60 transition-opacity hover:opacity-100"
                  />
                </template>
              </div>
            </th>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
          <!-- Loading State (Skeleton Rows) -->
          <template v-if="isLoading">
            <slot name="loading" :item="{}" :columns="safeColumns">
              <tr
                v-for="rowIndex in loadingRows"
                :key="`skeleton-${rowIndex}`"
                class="animate-pulse"
              >
                <td
                  v-for="col in safeColumns"
                  :key="`skel-col-${col.key}`"
                  :class="['px-4 py-3.5', getAlignmentClass(col.align)]"
                >
                  <div
                    :class="[
                      'h-4 rounded-md bg-neutral-200 dark:bg-neutral-800',
                      col.align === 'center'
                        ? 'mx-auto w-16'
                        : col.align === 'right'
                          ? 'ml-auto w-20'
                          : 'w-28',
                    ]"
                  />
                </td>
              </tr>
            </slot>
          </template>

          <!-- Empty State (when showEmpty=true) -->
          <template v-else-if="safeItems.length === 0 && showEmpty">
            <tr>
              <td :colspan="safeColumns.length" class="px-4 py-12 text-center">
                <slot name="empty" :item="{}" :columns="safeColumns">
                  <div class="flex flex-col items-center justify-center space-y-2">
                    <div
                      v-if="emptyIcon"
                      class="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400 dark:bg-neutral-800"
                    >
                      <component :is="emptyIcon" :size="20" />
                    </div>
                    <h4 class="text-sm font-semibold text-neutral-900 dark:text-white">
                      {{ emptyTitle }}
                    </h4>
                    <p
                      v-if="emptyDescription"
                      class="max-w-sm text-xs text-neutral-500 dark:text-neutral-400"
                    >
                      {{ emptyDescription }}
                    </p>
                  </div>
                </slot>
              </td>
            </tr>
          </template>

          <!-- Data Rows -->
          <template v-else>
            <tr
              v-for="(item, rowIndex) in safeItems"
              :key="getItemKey(item, rowIndex)"
              :class="[
                'transition-colors',
                hoverable ? 'hover:bg-neutral-50 dark:hover:bg-neutral-800/40' : '',
                striped && rowIndex % 2 === 1
                  ? 'bg-neutral-50/50 dark:bg-neutral-800/20'
                  : 'bg-white dark:bg-neutral-900',
              ]"
              @click="onRowClick(item, rowIndex)"
            >
              <!-- If parent defined #row, render custom row content -->
              <slot
                v-if="slots.row"
                name="row"
                :item="item || {}"
                :index="rowIndex"
                :columns="safeColumns"
              />

              <!-- Standard row rendering with dynamic cell slots -->
              <template v-else>
                <td
                  v-for="col in safeColumns"
                  :key="col.key"
                  :class="[
                    'px-4 py-3.5',
                    getAlignmentClass(col.align),
                    col.cellClass || col.class || '',
                  ]"
                >
                  <slot
                    v-if="getCellSlotName(col.key)"
                    :name="getCellSlotName(col.key)!"
                    :item="item || {}"
                    :value="item ? item[col.key] : undefined"
                    :index="rowIndex"
                    :column="col"
                  />
                  <span v-else>
                    {{
                      item && item[col.key] !== undefined && item[col.key] !== null
                        ? item[col.key]
                        : '—'
                    }}
                  </span>
                </td>
              </template>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Optional Integrated Pagination -->
    <slot name="pagination" :item="{}">
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
    </slot>
  </div>
</template>
