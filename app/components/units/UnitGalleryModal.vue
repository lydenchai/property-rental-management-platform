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
  Image as ImageIcon
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
  return ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'];
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
    t('gallery.bathroom_balcony')
  ];
  return labels[index % labels.length];
}
</script>

<template>
  <div class="gallery-modal-backdrop" @click.self="emit('close')">
    <div class="gallery-modal-container">
      <!-- Modal Header -->
      <div class="gallery-header">
        <div class="header-info">
          <h3 class="unit-title">{{ t('properties.unit_label', { number: unit.unitNumber }) }} &bull; {{ t('gallery.interior_gallery') }}</h3>
          <span class="photo-counter">
            <ImageIcon :size="13" />
            {{ t('gallery.photo_counter', { current: activeIndex + 1, total: currentImages.length, label: getImageLabel(activeIndex) }) }}
          </span>
        </div>
        <button type="button" @click="emit('close')" class="close-button" :title="t('gallery.close')">
          <X :size="18" />
        </button>
      </div>

      <!-- Main Stage -->
      <div class="gallery-stage">
        <button v-if="currentImages.length > 1" type="button" @click="prevImage" class="nav-arrow nav-prev"
          :title="t('common.prev_page')">
          <ChevronLeft :size="24" />
        </button>

        <div class="active-image-wrapper">
          <img :src="activeImage" :alt="`Unit ${unit.unitNumber} - ${getImageLabel(activeIndex)}`"
            class="active-image" />
          <div class="room-tag">
            {{ getImageLabel(activeIndex) }}
          </div>
        </div>

        <button v-if="currentImages.length > 1" type="button" @click="nextImage" class="nav-arrow nav-next"
          :title="t('common.next_page')">
          <ChevronRight :size="24" />
        </button>
      </div>

      <!-- Thumbnails Strip -->
      <div v-if="currentImages.length > 1" class="thumbnails-bar">
        <div class="thumbnails-track">
          <button v-for="(img, idx) in currentImages" :key="idx" type="button" @click="selectIndex(idx)"
            :class="['thumbnail-item', { active: idx === activeIndex }]">
            <img :src="img" :alt="`Thumbnail ${idx + 1}`" />
            <span class="thumbnail-label">{{ getImageLabel(idx) }}</span>
          </button>
        </div>
      </div>

      <!-- Footer Info & Action Bar -->
      <div class="gallery-footer">
        <div class="unit-specs-summary">
          <div class="spec-pill">
            <span class="text-slate-400">{{ t('properties.floor') }}:</span>
            <strong>{{ t('properties.level', { floor: unit.floor }) }}</strong>
          </div>
          <div class="spec-pill">
            <Maximize2 :size="13" class="text-slate-400" />
            <strong>{{ t('properties.sq_m', { size: unit.sizeSqFt }) }}</strong>
          </div>
          <div class="spec-pill">
            <Bed :size="13" class="text-slate-400" />
            <strong>{{ unit.bedrooms === 0 ? t('properties.studio') : t('properties.bed_short', { count: unit.bedrooms }) }}</strong>
          </div>
          <div class="spec-pill">
            <Bath :size="13" class="text-slate-400" />
            <strong>{{ t('properties.bath_short', { count: unit.bathrooms }) }}</strong>
          </div>
          <div class="spec-pill rent-pill">
            <span class="rent-amount-text">${{ unit.rentAmount.toLocaleString() }}</span>
            <span class="text-xs text-slate-400">{{ t('properties.per_month_short') }}</span>
          </div>
        </div>

        <div class="action-buttons">
          <button type="button" @click="emit('close')" class="btn-secondary btn-sm">
            {{ t('common.close') }}
          </button>
          <button v-if="unit.status === 'AVAILABLE'" type="button" @click="emit('apply', unit)"
            class="btn-primary btn-sm">
            <FileSignature :size="14" />
            <span>{{ t('gallery.apply_for_unit') }}</span>
          </button>
          <span v-else class="unavailable-badge">
            {{ unit.status }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gallery-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.gallery-modal-container {
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  max-width: 960px;
  width: 100%;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
}

.gallery-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  background: #0f172a;
  color: #ffffff;
}

.unit-title {
  font-size: 0.98rem;
  font-weight: 600;
  margin: 0;
  color: #f8fafc;
}

.photo-counter {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.76rem;
  color: #94a3b8;
  margin-top: 2px;
}

.close-button {
  background: transparent;
  border: none;
  color: #cbd5e1;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.gallery-stage {
  position: relative;
  background: #090d16;
  height: 480px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.active-image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.active-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: opacity 0.2s ease;
}

.room-tag {
  position: absolute;
  bottom: 12px;
  left: 16px;
  background: rgba(15, 23, 42, 0.75);
  color: #ffffff;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background: rgba(15, 23, 42, 0.65);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.15);
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.nav-arrow:hover {
  background: rgba(15, 23, 42, 0.95);
  border-color: rgba(255, 255, 255, 0.4);
}

.nav-prev {
  left: 14px;
}

.nav-next {
  right: 14px;
}

.thumbnails-bar {
  background: #0f172a;
  padding: 10px 16px;
  border-top: 1px solid #1e293b;
  overflow-x: auto;
}

.thumbnails-track {
  display: flex;
  gap: 10px;
  align-items: center;
}

.thumbnail-item {
  position: relative;
  width: 90px;
  height: 60px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
  border: 2px solid #334155;
  background: #1e293b;
  cursor: pointer;
  padding: 0;
  transition: all 0.15s ease;
}

.thumbnail-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.75;
  transition: opacity 0.15s ease;
}

.thumbnail-item:hover img {
  opacity: 1;
}

.thumbnail-item.active {
  border-color: #0284c7;
  transform: scale(1.03);
}

.thumbnail-item.active img {
  opacity: 1;
}

.thumbnail-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.75);
  color: #f1f5f9;
  font-size: 0.58rem;
  padding: 1px 3px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gallery-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  background: var(--bg-surface, #ffffff);
  border-top: 1px solid var(--border-subtle, #e2e8f0);
  flex-wrap: wrap;
  gap: 12px;
}

.unit-specs-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 0.8rem;
}

.spec-pill {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-muted, #475569);
}

.rent-pill {
  background: var(--accent-emerald-subtle, rgba(16, 185, 129, 0.12));
  padding: 4px 10px;
  border-radius: 4px;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.rent-amount-text {
  color: var(--accent-emerald, #10b981);
  font-weight: 800;
  font-size: 0.98rem;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
}

.unavailable-badge {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-dim, #64748b);
  background: var(--bg-subtle, #e2e8f0);
  padding: 5px 10px;
  border-radius: 4px;
}

@media (max-width: 640px) {
  .gallery-stage {
    height: 320px;
  }

  .unit-specs-summary {
    gap: 8px;
  }

  .thumbnail-item {
    width: 70px;
    height: 48px;
  }
}
</style>
