<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Bed,
  Bath,
  Maximize2,
  DollarSign,
  FileSignature,
  Image as ImageIcon,
} from '@lucide/vue';

export interface UnitDetail {
  id: string;
  propertyId?: string;
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

interface Props {
  unit: UnitDetail;
  initialIndex?: number;
}

const props = withDefaults(defineProps<Props>(), {
  initialIndex: 0,
});

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'apply', unit: UnitDetail): void;
}>();

const { t } = useI18n();
const activeIndex = ref(props.initialIndex);

const currentImages = computed(() => {
  if (props.unit.images && props.unit.images.length > 0) {
    return props.unit.images;
  }
  // Default fallback if no images attached
  return [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
  ];
});

const activeImage = computed(() => {
  return currentImages.value[activeIndex.value] || currentImages.value[0];
});

function prevImage() {
  if (activeIndex.value > 0) {
    activeIndex.value--;
  } else {
    activeIndex.value = currentImages.value.length - 1;
  }
}

function nextImage() {
  if (activeIndex.value < currentImages.value.length - 1) {
    activeIndex.value++;
  } else {
    activeIndex.value = 0;
  }
}

function selectIndex(index: number) {
  activeIndex.value = index;
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close');
  } else if (e.key === 'ArrowLeft') {
    prevImage();
  } else if (e.key === 'ArrowRight') {
    nextImage();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

// Room label heuristics based on image index
function getImageLabel(index: number): string {
  const labels: any[] = [
    t('gallery.living_area'),
    t('gallery.master_bedroom'),
    t('gallery.modern_kitchen'),
    t('gallery.bathroom_balcony'),
  ];
  return labels[index % labels.length];
}
</script>

<template>
  <Teleport to="body">
    <div
      class="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      @click.self="emit('close')"
    >
      <div
        class="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
      >
        <!-- Modal Header -->
        <div
          class="flex items-center justify-between border-b border-neutral-800 bg-neutral-900 px-5 py-3.5 text-white"
        >
          <div>
            <h3 class="text-sm font-semibold text-neutral-100">
              {{ t('properties.unit_label', { number: unit.unitNumber }) }} &bull;
              {{ t('gallery.interior_gallery') }}
            </h3>
            <span class="mt-0.5 flex items-center gap-1.5 text-xs text-neutral-400">
              <ImageIcon :size="13" />
              {{
                t('gallery.photo_counter', {
                  current: activeIndex + 1,
                  total: currentImages.length,
                  label: getImageLabel(activeIndex),
                })
              }}
            </span>
          </div>
          <button
            type="button"
            @click="emit('close')"
            class="cursor-pointer rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
            :title="t('gallery.close')"
          >
            <X :size="18" />
          </button>
        </div>

        <!-- Main Stage -->
        <div
          class="relative flex max-h-[480px] min-h-[300px] flex-1 select-none items-center justify-center overflow-hidden bg-black/95"
        >
          <button
            v-if="currentImages.length > 1"
            type="button"
            @click="prevImage"
            class="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/80"
            :title="t('common.prev_page')"
          >
            <ChevronLeft :size="24" />
          </button>

          <div class="relative flex h-full w-full items-center justify-center p-2">
            <img
              :src="activeImage"
              :alt="`Unit ${unit.unitNumber} - ${getImageLabel(activeIndex)}`"
              class="mx-auto max-h-[460px] w-auto max-w-full object-contain"
            />
            <div
              class="backdrop-blur-xs absolute bottom-4 left-4 rounded-lg bg-black/60 px-3 py-1 text-xs font-medium text-white"
            >
              {{ getImageLabel(activeIndex) }}
            </div>
          </div>

          <button
            v-if="currentImages.length > 1"
            type="button"
            @click="nextImage"
            class="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/80"
            :title="t('common.next_page')"
          >
            <ChevronRight :size="24" />
          </button>
        </div>

        <!-- Thumbnails Strip -->
        <div
          v-if="currentImages.length > 1"
          class="overflow-x-auto border-t border-neutral-800 bg-neutral-900 px-4 py-3"
        >
          <div class="flex items-center gap-2">
            <button
              v-for="(img, idx) in currentImages"
              :key="idx"
              type="button"
              @click="selectIndex(idx)"
              :class="[
                'relative h-14 w-20 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition-all',
                idx === activeIndex
                  ? 'scale-105 border-primary-500'
                  : 'border-transparent opacity-60 hover:opacity-100',
              ]"
            >
              <img :src="img" :alt="`Thumbnail ${idx + 1}`" class="h-full w-full object-cover" />
            </button>
          </div>
        </div>

        <!-- Footer Info & Action Bar -->
        <div
          class="flex flex-col items-center justify-between gap-4 border-t border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:flex-row"
        >
          <div class="flex flex-wrap items-center gap-2 text-xs">
            <div
              class="rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
            >
              <span class="mr-1 text-neutral-400">{{ t('properties.floor') }}:</span>
              <strong>{{ t('properties.level', { floor: unit.floor }) }}</strong>
            </div>
            <div
              class="flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
            >
              <Maximize2 :size="13" class="text-neutral-400" />
              <strong>{{ t('properties.sq_m', { size: unit.sizeSqFt }) }}</strong>
            </div>
            <div
              class="flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
            >
              <Bed :size="13" class="text-neutral-400" />
              <strong>{{
                unit.bedrooms === 0
                  ? t('properties.studio')
                  : t('properties.bed_short', { count: unit.bedrooms })
              }}</strong>
            </div>
            <div
              class="flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
            >
              <Bath :size="13" class="text-neutral-400" />
              <strong>{{ t('properties.bath_short', { count: unit.bathrooms }) }}</strong>
            </div>
            <div
              class="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1 font-mono font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
            >
              <span>${{ unit.rentAmount.toLocaleString() }}</span>
              <span class="ml-1 text-[10px] font-normal text-emerald-600 dark:text-emerald-400">{{
                t('properties.per_month_short')
              }}</span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="emit('close')"
              class="cursor-pointer rounded-lg border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
            >
              {{ t('common.close') }}
            </button>
            <button
              v-if="unit.status === 'AVAILABLE'"
              type="button"
              @click="emit('apply', unit)"
              class="shadow-xs inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-700"
            >
              <FileSignature :size="14" />
              <span>{{ t('gallery.apply_for_unit') }}</span>
            </button>
            <span
              v-else
              class="rounded-lg bg-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
            >
              {{ unit.status }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
