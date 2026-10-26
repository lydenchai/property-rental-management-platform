<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import {
  MapPin,
  Layers,
  Maximize2,
  Minimize2,
  RefreshCw,
  ExternalLink,
  Building,
  ArrowRight,
} from '@lucide/vue';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTheme } from '../../composables/useTheme';

interface PropertyItem {
  id: string;
  title: string;
  addressLine1: string;
  city: string;
  state?: string;
  minRent?: number;
  maxRent?: number;
  unitsCount?: number;
  availableUnitsCount?: number;
  latitude?: number;
  longitude?: number;
}

interface Props {
  properties: PropertyItem[];
  selectedId?: string | null;
  height?: string;
}

const props = withDefaults(defineProps<Props>(), {
  selectedId: null,
  height: '560px',
});

const emit = defineEmits<{
  (e: 'select', propertyId: string): void;
}>();

const { isDark } = useTheme();
const isUserStyleChoice = ref(false);

const mapContainer = ref<HTMLDivElement | null>(null);
const mapWrapper = ref<HTMLDivElement | null>(null);
const isLoading = ref(true);
const isFullscreen = ref(false);

const MAP_STYLES = [
  { id: 'bright', name: 'Bright', url: 'https://tiles.openfreemap.org/styles/bright' },
  { id: 'liberty', name: 'Liberty', url: 'https://tiles.openfreemap.org/styles/liberty' },
  { id: 'positron', name: 'Positron', url: 'https://tiles.openfreemap.org/styles/positron' },
  { id: 'dark', name: 'Dark', url: 'https://tiles.openfreemap.org/styles/dark' },
];

const selectedStyle = ref<string>('bright');

watch(isDark, (newDark) => {
  if (!isUserStyleChoice.value) {
    const newStyle = newDark ? 'dark' : 'bright';
    changeStyle(newStyle, false);
  }
});

let mapInstance: any = null;
let markersMap = new Map<string, any>();
let resizeObserver: ResizeObserver | null = null;

// Property coordinate fallback lookup for Cambodia properties if lat/lng is missing
const DEFAULT_COORDS: Record<string, [number, number]> = {
  'prop-skyline-01': [104.9224, 11.5516],
  'prop-oakwood-02': [104.9352, 11.5458],
  'prop-metropolitan-03': [103.859, 13.3671],
  'prop-peak-04': [104.9388, 11.5528],
  'prop-toulkork-05': [104.8967, 11.5762],
  'prop-chroy-06': [104.9312, 11.5878],
  'prop-otres-07': [103.5512, 10.5758],
  'prop-kampot-08': [104.1818, 10.6085],
};

function getCoords(prop: PropertyItem): [number, number] | null {
  if (prop.longitude !== undefined && prop.latitude !== undefined) {
    const lng = Number(prop.longitude);
    const lat = Number(prop.latitude);
    if (!isNaN(lng) && !isNaN(lat)) return [lng, lat];
  }
  if (DEFAULT_COORDS[prop.id]) {
    return DEFAULT_COORDS[prop.id];
  }
  // Default to Phnom Penh
  return [104.9224, 11.5516];
}

async function initMap() {
  if (typeof window === 'undefined' || !mapContainer.value) return;

  try {
    isLoading.value = true;
    const maplibregl = (await import('maplibre-gl')).default;

    if (mapInstance) {
      mapInstance.remove();
      mapInstance = null;
      markersMap.clear();
    }

    const currentStyleUrl =
      MAP_STYLES.find((s) => s.id === selectedStyle.value)?.url ||
      'https://tiles.openfreemap.org/styles/bright';

    // Default center on Phnom Penh
    const map = new maplibregl.Map({
      container: mapContainer.value,
      style: currentStyleUrl,
      center: [104.9224, 11.5516],
      zoom: 12,
      attributionControl: true,
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false, showZoom: true }),
      'top-left'
    );

    const renderMarkers = () => {
      // Clear old markers
      markersMap.forEach((m) => m.remove());
      markersMap.clear();

      if (!props.properties || props.properties.length === 0) return;

      const bounds = new maplibregl.LngLatBounds();
      let hasValidCoords = false;

      props.properties.forEach((item) => {
        const coords = getCoords(item);
        if (!coords) return;

        bounds.extend(coords);
        hasValidCoords = true;

        const isSelected = props.selectedId === item.id;
        const priceLabel = item.minRent ? `$${item.minRent}+` : 'View';

        // Custom marker DOM element
        const el = document.createElement('div');
        el.className = `browse-map-pin ${isSelected ? 'is-selected' : ''}`;
        el.id = `map-marker-${item.id}`;
        el.innerHTML = `
          <div class="pin-badge">
            <span class="pin-price">${priceLabel}</span>
          </div>
          <div class="pin-pointer"></div>
        `;

        // Interactive Popup
        const popupContent = `
          <div class="browse-popup-card">
            <div class="popup-header-row">
              <span class="popup-city-tag">${item.city || 'Cambodia'}</span>
              ${item.availableUnitsCount ? `<span class="popup-avail-tag">${item.availableUnitsCount} available</span>` : ''}
            </div>
            <div class="popup-title">${item.title}</div>
            <div class="popup-addr">${item.addressLine1}</div>
            <div class="popup-bottom-row">
              <div class="popup-price-txt">
                ${item.minRent ? `From <strong style="color: #10b981;">$${item.minRent.toLocaleString()}</strong>/mo` : ''}
              </div>
              <a href="/properties/${item.id}" class="popup-cta-btn">
                <span>Details &rarr;</span>
              </a>
            </div>
          </div>
        `;

        const popup = new maplibregl.Popup({ offset: 16, closeButton: true }).setHTML(popupContent);

        el.addEventListener('click', () => {
          emit('select', item.id);
        });

        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat(coords)
          .setPopup(popup)
          .addTo(map);

        markersMap.set(item.id, marker);

        if (isSelected) {
          marker.togglePopup();
        }
      });

      // Fit map bounds if multiple properties
      if (hasValidCoords && props.properties.length > 1) {
        map.fitBounds(bounds, { padding: 60, maxZoom: 14 });
      }
    };

    map.on('load', () => {
      isLoading.value = false;
      renderMarkers();
      map.resize();
    });

    map.on('style.load', () => {
      isLoading.value = false;
      renderMarkers();
      map.resize();
    });

    map.on('error', (e) => {
      console.warn('MapLibre event:', e);
    });

    mapInstance = map;

    nextTick(() => {
      setTimeout(() => {
        if (mapInstance) mapInstance.resize();
      }, 250);
    });
  } catch (err) {
    console.error('Error initializing OpenFreeMap explorer:', err);
    isLoading.value = false;
  }
}

function changeStyle(styleId: string, fromUser: boolean = true) {
  if (fromUser) isUserStyleChoice.value = true;
  selectedStyle.value = styleId;
  const target = MAP_STYLES.find((s) => s.id === styleId);
  if (!mapInstance || !target) return;

  try {
    isLoading.value = true;
    if (typeof mapInstance.isStyleLoaded === 'function' && !mapInstance.isStyleLoaded()) {
      mapInstance.once('style.load', () => {
        try {
          if (mapInstance && selectedStyle.value === styleId) {
            mapInstance.setStyle(target.url);
          }
        } catch (err) {
          console.warn('Explorer map deferred style update caught:', err);
          isLoading.value = false;
        }
      });
    } else {
      mapInstance.setStyle(target.url);
    }
  } catch (err) {
    console.warn('Explorer map style change caught:', err);
    isLoading.value = false;
  }
}

function fitAllProperties() {
  if (!mapInstance || !props.properties.length) return;
  import('maplibre-gl').then(({ default: maplibregl }) => {
    const bounds = new maplibregl.LngLatBounds();
    let hasCoords = false;
    props.properties.forEach((p) => {
      const c = getCoords(p);
      if (c) {
        bounds.extend(c);
        hasCoords = true;
      }
    });
    if (hasCoords) {
      mapInstance.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 800 });
    }
  });
}

function flyToProperty(propertyId: string) {
  const p = props.properties.find((x) => x.id === propertyId);
  if (!p || !mapInstance) return;
  const coords = getCoords(p);
  if (!coords) return;

  mapInstance.flyTo({
    center: coords,
    zoom: 15,
    duration: 1000,
    essential: true,
  });

  const marker = markersMap.get(propertyId);
  if (marker) {
    marker.togglePopup();
  }
}

function toggleFullscreen() {
  if (!mapWrapper.value) return;
  if (!isFullscreen.value) {
    if (mapWrapper.value.requestFullscreen) {
      mapWrapper.value.requestFullscreen();
    }
    isFullscreen.value = true;
  } else {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen();
    }
    isFullscreen.value = false;
  }
}

function handleFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement;
  if (mapInstance) {
    setTimeout(() => {
      mapInstance.resize();
    }, 150);
  }
}

onMounted(() => {
  initMap();

  document.addEventListener('fullscreenchange', handleFullscreenChange);

  if (mapContainer.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      if (mapInstance) {
        mapInstance.resize();
      }
    });
    resizeObserver.observe(mapContainer.value);
  }
});

watch(
  () => props.properties,
  () => {
    initMap();
  },
  { deep: true }
);

watch(
  () => props.selectedId,
  (newId) => {
    if (newId) {
      flyToProperty(newId);
    }
  }
);

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
});
</script>

<template>
  <div ref="mapWrapper" :class="['properties-map-explorer', { 'is-fullscreen': isFullscreen }]">
    <!-- Map Control Bar -->
    <div class="explorer-header">
      <div class="explorer-header-left">
        <div class="map-badge-row">
          <MapPin :size="15" class="text-emerald-400" />
          <span class="text-sm font-semibold text-slate-100">Cambodia Rental Map</span>
          <span class="count-pill">{{ properties.length }} Properties</span>
        </div>
      </div>

      <div class="explorer-header-actions">
        <!-- Style Switcher -->
        <div class="style-switcher">
          <button
            v-for="st in MAP_STYLES"
            :key="st.id"
            type="button"
            @click="changeStyle(st.id)"
            :class="['style-pill', { active: selectedStyle === st.id }]"
            :title="`OpenFreeMap style: ${st.name}`"
          >
            {{ st.name }}
          </button>
        </div>

        <button
          type="button"
          @click="fitAllProperties"
          class="header-btn"
          title="Fit all properties on map"
        >
          <RefreshCw :size="13" />
          <span>Fit All</span>
        </button>

        <button
          type="button"
          @click="toggleFullscreen"
          class="header-btn"
          title="Toggle fullscreen view"
        >
          <Minimize2 v-if="isFullscreen" :size="13" />
          <Maximize2 v-else :size="13" />
        </button>
      </div>
    </div>

    <!-- Map Viewport -->
    <div
      class="explorer-canvas-box"
      :style="{ height: isFullscreen ? 'calc(100vh - 84px)' : height }"
    >
      <div v-show="isLoading" class="map-loading-overlay">
        <div class="map-spinner"></div>
        <span>Loading OpenFreeMap tiles...</span>
      </div>

      <div ref="mapContainer" class="maplibre-container"></div>
    </div>

    <!-- Map Footer -->
    <div class="explorer-footer">
      <span class="attribution-text">
        Vector map by
        <a
          href="https://openfreemap.org"
          target="_blank"
          rel="noopener noreferrer"
          class="font-medium text-emerald-400"
          >OpenFreeMap</a
        >
        &bull; &copy;
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer"
          >OpenStreetMap</a
        >
        contributors
      </span>
      <span class="status-indicator">
        <span class="status-dot"></span>
        Live Vector Tiles
      </span>
    </div>
  </div>
</template>

<style scoped>
.properties-map-explorer {
  background: var(--bg-surface, #141c2e);
  border: 1px solid var(--border-default, #334155);
  border-radius: var(--radius-md, 8px);
  overflow: hidden;
  box-shadow: none;
  display: flex;
  flex-direction: column;
}

.properties-map-explorer.is-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  border-radius: 0;
  height: 100vh;
  width: 100vw;
}

.explorer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: var(--bg-subtle, #1e293b);
  border-bottom: 1px solid var(--border-subtle, #1e293b);
  flex-wrap: wrap;
  gap: 10px;
}

.explorer-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.map-badge-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.count-pill {
  font-size: 0.72rem;
  font-weight: 600;
  background: rgba(16, 185, 129, 0.15);
  color: var(--accent-emerald, #10b981);
  padding: 2px 8px;
  border-radius: 12px;
}

.explorer-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.style-switcher {
  display: flex;
  align-items: center;
  background: var(--bg-surface, #141c2e);
  border: 1px solid var(--border-default, #334155);
  border-radius: 5px;
  padding: 2px;
  gap: 2px;
}

.style-pill {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-muted, #94a3b8);
  background: transparent;
  border: none;
  padding: 3px 7px;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.style-pill:hover {
  color: var(--text-main, #f8fafc);
}

.style-pill.active {
  background: #2563eb;
  color: #ffffff;
}

.header-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.76rem;
  font-weight: 500;
  color: var(--text-muted, #94a3b8);
  background: var(--bg-surface, #141c2e);
  border: 1px solid var(--border-default, #334155);
  padding: 4px 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.header-btn:hover {
  background: var(--bg-surface-hover, #1a243b);
  border-color: #64748b;
  color: var(--text-main, #f8fafc);
}

.explorer-canvas-box {
  position: relative;
  width: 100%;
  background: #0f172a;
}

.maplibre-container {
  width: 100%;
  height: 100%;
}

.map-loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  background: rgba(15, 23, 42, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 0.85rem;
  color: #94a3b8;
}

.map-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #334155;
  border-top-color: var(--accent-emerald, #10b981);
  border-radius: 50%;
  animation: map-spin 0.8s linear infinite;
}

@keyframes map-spin {
  to {
    transform: rotate(360deg);
  }
}

.explorer-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 16px;
  background: var(--bg-subtle, #1e293b);
  border-top: 1px solid var(--border-subtle, #1e293b);
  font-size: 0.72rem;
  color: var(--text-dim, #64748b);
  flex-wrap: wrap;
  gap: 8px;
}

.attribution-text a {
  color: #38bdf8;
  text-decoration: none;
}

.attribution-text a:hover {
  text-decoration: underline;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--accent-emerald, #10b981);
  font-weight: 600;
  font-size: 0.7rem;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent-emerald, #10b981);
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.8);
}
</style>
