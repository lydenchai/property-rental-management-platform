<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { 
  MapPin, 
  Navigation, 
  ExternalLink, 
  RefreshCw, 
  Layers, 
  Maximize2, 
  Minimize2,
  Copy,
  Check
} from '@lucide/vue';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTheme } from '../../composables/useTheme';

interface Props {
  latitude?: number;
  longitude?: number;
  title: string;
  address?: string;
  city?: string;
  zoom?: number;
  height?: string;
}

const props = withDefaults(defineProps<Props>(), {
  latitude: 11.5516,
  longitude: 104.9224,
  zoom: 15,
  height: '420px',
});

const { isDark } = useTheme();
const isUserStyleChoice = ref(false);

const mapContainer = ref<HTMLDivElement | null>(null);
const mapWrapper = ref<HTMLDivElement | null>(null);
const isLoading = ref(true);
const mapError = ref<string | null>(null);
const isFullscreen = ref(false);
const copiedCoords = ref(false);

// OpenFreeMap vector tile style endpoints (all free, keyless, production-grade)
const MAP_STYLES = [
  { id: 'liberty', name: 'Liberty', url: 'https://tiles.openfreemap.org/styles/liberty' },
  { id: 'bright', name: 'Bright', url: 'https://tiles.openfreemap.org/styles/bright' },
  { id: 'positron', name: 'Positron', url: 'https://tiles.openfreemap.org/styles/positron' },
  { id: 'dark', name: 'Dark', url: 'https://tiles.openfreemap.org/styles/dark' },
];

const selectedStyle = ref<string>(isDark.value ? 'dark' : 'liberty');

watch(isDark, (newDark) => {
  if (!isUserStyleChoice.value) {
    const newStyle = newDark ? 'dark' : 'liberty';
    changeStyle(newStyle, false);
  }
});

let mapInstance: any = null;
let markerInstance: any = null;
let resizeObserver: ResizeObserver | null = null;

// Formatted coordinates string
const formattedCoords = computed(() => {
  if (props.latitude === undefined || props.longitude === undefined) return '';
  const lat = Number(props.latitude);
  const lng = Number(props.longitude);
  if (isNaN(lat) || isNaN(lng)) return '';
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
});

const osmUrl = computed(() => {
  return `https://www.openstreetmap.org/?mlat=${props.latitude}&mlon=${props.longitude}#map=16/${props.latitude}/${props.longitude}`;
});

const googleMapsUrl = computed(() => {
  return `https://www.google.com/maps/search/?api=1&query=${props.latitude},${props.longitude}`;
});

function copyCoordinates() {
  if (!formattedCoords.value) return;
  const text = `${props.latitude}, ${props.longitude}`;
  navigator.clipboard?.writeText(text);
  copiedCoords.value = true;
  setTimeout(() => {
    copiedCoords.value = false;
  }, 2000);
}

function createMarkerElement(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'custom-map-marker';
  el.innerHTML = `
    <div class="marker-pulse"></div>
    <div class="marker-icon">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    </div>
  `;
  return el;
}

function createPopupContent(): string {
  const addr = props.address || props.city || '';
  return `
    <div class="map-popup-card">
      <div class="popup-title">${props.title}</div>
      ${addr ? `<div class="popup-address">${addr}</div>` : ''}
      <div class="popup-actions">
        <a href="${googleMapsUrl.value}" target="_blank" rel="noopener noreferrer" class="popup-link">
          Directions &rarr;
        </a>
      </div>
    </div>
  `;
}

async function initMap() {
  if (typeof window === 'undefined' || !mapContainer.value) return;

  const lat = Number(props.latitude);
  const lng = Number(props.longitude);

  if (isNaN(lat) || isNaN(lng)) {
    mapError.value = 'Geographic coordinates are not available for this property.';
    isLoading.value = false;
    return;
  }

  try {
    isLoading.value = true;
    mapError.value = null;

    const maplibregl = (await import('maplibre-gl')).default;

    // Clean up previous instance
    if (mapInstance) {
      mapInstance.remove();
      mapInstance = null;
      markerInstance = null;
    }

    const currentStyleUrl = MAP_STYLES.find(s => s.id === selectedStyle.value)?.url 
      || 'https://tiles.openfreemap.org/styles/liberty';

    const map = new maplibregl.Map({
      container: mapContainer.value,
      style: currentStyleUrl,
      center: [lng, lat],
      zoom: props.zoom,
      attributionControl: false, // We render a clean custom attribution
    });

    // Add navigation controls (zoom & pitch/compass)
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');

    const addMarkerAndPopup = () => {
      if (markerInstance) {
        markerInstance.remove();
      }

      const el = createMarkerElement();
      const popup = new maplibregl.Popup({ offset: 25, closeButton: true })
        .setHTML(createPopupContent());

      markerInstance = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);

      // Open popup by default
      markerInstance.togglePopup();
    };

    map.on('load', () => {
      isLoading.value = false;
      addMarkerAndPopup();
      map.resize();
    });

    map.on('style.load', () => {
      isLoading.value = false;
      addMarkerAndPopup();
      map.resize();
    });

    // Log non-fatal tile warnings without breaking the map view
    map.on('error', (e: any) => {
      console.warn('MapLibre event:', e);
    });

    mapInstance = map;

    // Trigger resize after DOM layout completes
    nextTick(() => {
      setTimeout(() => {
        if (mapInstance) mapInstance.resize();
      }, 250);
    });

  } catch (err: any) {
    console.error('Error initializing OpenFreeMap:', err);
    mapError.value = 'Map rendering is currently unavailable. Please use the direct map links below.';
    isLoading.value = false;
  }
}

function changeStyle(styleId: string, fromUser: boolean = true) {
  if (fromUser) isUserStyleChoice.value = true;
  selectedStyle.value = styleId;
  const target = MAP_STYLES.find(s => s.id === styleId);
  if (mapInstance && target) {
    isLoading.value = true;
    mapInstance.setStyle(target.url);
  }
}

function resetView() {
  if (mapInstance && props.latitude && props.longitude) {
    mapInstance.flyTo({
      center: [Number(props.longitude), Number(props.latitude)],
      zoom: props.zoom,
      essential: true,
    });
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

watch(() => [props.latitude, props.longitude], () => {
  initMap();
});

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
  <div ref="mapWrapper" :class="['property-map-wrapper', { 'is-fullscreen': isFullscreen }]">
    <!-- Map Control Header -->
    <div class="map-header">
      <div class="map-header-left">
        <div class="map-title-row">
          <MapPin :size="16" class="pin-icon" />
          <span class="map-title-text">Location & Neighborhood</span>
        </div>
        <button 
          v-if="formattedCoords" 
          type="button" 
          @click="copyCoordinates" 
          class="coord-badge" 
          title="Click to copy latitude and longitude"
        >
          <span>{{ formattedCoords }}</span>
          <Check v-if="copiedCoords" :size="12" class="text-emerald-400" />
          <Copy v-else :size="11" class="text-slate-400" />
        </button>
      </div>

      <div class="map-header-actions">
        <!-- Style Switcher Pills -->
        <div class="style-switcher">
          <button
            v-for="st in MAP_STYLES"
            :key="st.id"
            type="button"
            @click="changeStyle(st.id)"
            :class="['style-pill-btn', { active: selectedStyle === st.id }]"
            :title="`Switch map style to ${st.name}`"
          >
            {{ st.name }}
          </button>
        </div>

        <button type="button" @click="resetView" class="map-btn" title="Reset to center">
          <RefreshCw :size="13" />
          <span>Reset</span>
        </button>

        <button type="button" @click="toggleFullscreen" class="map-btn" title="Toggle full-screen map">
          <Minimize2 v-if="isFullscreen" :size="13" />
          <Maximize2 v-else :size="13" />
        </button>

        <a :href="googleMapsUrl" target="_blank" rel="noopener noreferrer" class="map-btn map-btn-primary"
          title="Open in Google Maps for directions">
          <Navigation :size="13" />
          <span>Directions</span>
        </a>
      </div>
    </div>

    <!-- Map Viewport -->
    <div class="map-viewport-box" :style="{ height: isFullscreen ? 'calc(100vh - 84px)' : height }">
      <!-- Loading Indicator -->
      <div v-show="isLoading" class="map-loading-overlay">
        <div class="map-spinner"></div>
        <span>Loading OpenFreeMap tiles...</span>
      </div>

      <!-- Fallback when WebGL or network completely fails -->
      <div v-if="mapError" class="map-fallback-view">
        <MapPin :size="36" class="text-slate-400 mb-2" />
        <h4 class="font-semibold text-slate-200 mb-1">Map View Unavailable</h4>
        <p class="text-sm text-slate-400 mb-4 max-w-sm text-center">
          {{ address || city || title }} <span v-if="formattedCoords">({{ formattedCoords }})</span>
        </p>
        <div class="flex gap-2">
          <a :href="googleMapsUrl" target="_blank" rel="noopener noreferrer" class="btn-primary btn-sm">
            <ExternalLink :size="14" />
            <span>Open in Google Maps</span>
          </a>
          <a :href="osmUrl" target="_blank" rel="noopener noreferrer" class="btn-secondary btn-sm">
            <ExternalLink :size="14" />
            <span>Open in OpenStreetMap</span>
          </a>
        </div>
      </div>

      <!-- MapLibre GL Canvas Container -->
      <div ref="mapContainer" class="maplibre-container"></div>
    </div>

    <!-- Map Footer with OpenFreeMap & OpenStreetMap Attributions -->
    <div class="map-footer">
      <span class="map-attribution">
        Map data &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer"
          class="hover:underline">OpenStreetMap</a> contributors &bull; Vector tiles by <a
          href="https://openfreemap.org" target="_blank" rel="noopener noreferrer"
          class="hover:underline font-medium text-emerald-400">OpenFreeMap</a>
      </span>
      <div class="footer-pills">
        <span class="map-status-pill">Free & Open Source</span>
        <a :href="osmUrl" target="_blank" rel="noopener noreferrer" class="map-sublink">
          <ExternalLink :size="11" />
          <span>OSM</span>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.property-map-wrapper {
  background: var(--bg-surface, #141c2e);
  border: 1px solid var(--border-default, #334155);
  border-radius: var(--radius-md, 8px);
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.property-map-wrapper.is-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  border-radius: 0;
  height: 100vh;
  width: 100vw;
}

.map-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: var(--bg-subtle, #1e293b);
  border-bottom: 1px solid var(--border-subtle, #1e293b);
  flex-wrap: wrap;
  gap: 10px;
}

.map-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.map-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pin-icon {
  color: var(--accent-emerald, #10b981);
}

.map-title-text {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--text-main, #f8fafc);
}

.coord-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.74rem;
  font-family: var(--font-mono, ui-monospace, monospace);
  background: var(--bg-surface, #141c2e);
  color: var(--text-muted, #94a3b8);
  border: 1px solid var(--border-default, #334155);
  padding: 3px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.coord-badge:hover {
  border-color: var(--accent-emerald, #10b981);
  color: var(--text-main, #f8fafc);
}

.map-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* Style Switcher */
.style-switcher {
  display: flex;
  align-items: center;
  background: var(--bg-surface, #141c2e);
  border: 1px solid var(--border-default, #334155);
  border-radius: 5px;
  padding: 2px;
  gap: 2px;
}

.style-pill-btn {
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

.style-pill-btn:hover {
  color: var(--text-main, #f8fafc);
}

.style-pill-btn.active {
  background: #2563eb;
  color: #ffffff;
}

.map-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--text-muted, #94a3b8);
  background: var(--bg-surface, #141c2e);
  border: 1px solid var(--border-default, #334155);
  padding: 5px 10px;
  border-radius: 5px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.map-btn:hover {
  background: var(--bg-surface-hover, #1a243b);
  border-color: #64748b;
  color: var(--text-main, #f8fafc);
}

.map-btn-primary {
  background: #0284c7;
  color: #ffffff;
  border-color: #0284c7;
}

.map-btn-primary:hover {
  background: #0369a1;
  border-color: #0369a1;
  color: #ffffff;
}

.map-viewport-box {
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
  background: rgba(15, 23, 42, 0.75);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 0.85rem;
  color: #94a3b8;
  backdrop-filter: blur(2px);
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

.map-fallback-view {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--bg-surface, #141c2e);
}

.map-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: var(--bg-subtle, #1e293b);
  border-top: 1px solid var(--border-subtle, #1e293b);
  font-size: 0.72rem;
  color: var(--text-dim, #64748b);
  flex-wrap: wrap;
  gap: 8px;
}

.map-attribution a {
  color: #38bdf8;
}

.footer-pills {
  display: flex;
  align-items: center;
  gap: 8px;
}

.map-status-pill {
  background: rgba(16, 185, 129, 0.15);
  color: var(--accent-emerald, #10b981);
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 4px;
  font-size: 0.7rem;
}

.map-sublink {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: var(--text-muted, #94a3b8);
  text-decoration: none;
}

.map-sublink:hover {
  color: var(--text-main, #f8fafc);
  text-decoration: underline;
}
</style>

<style>
/* Global styles for MapLibre marker and popup */
.custom-map-marker {
  position: relative;
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.marker-pulse {
  position: absolute;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.35);
  animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
}

.marker-icon {
  position: relative;
  z-index: 2;
  width: 32px;
  height: 32px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  background: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.5);
  border: 2px solid #ffffff;
  transition: transform 0.15s ease;
}

.marker-icon svg {
  transform: rotate(45deg);
}

.custom-map-marker:hover .marker-icon {
  transform: rotate(-45deg) scale(1.15);
  background: #059669;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.6);
    opacity: 1;
  }

  100% {
    transform: scale(1.8);
    opacity: 0;
  }
}

.maplibregl-popup-content {
  background: #141c2e !important;
  color: #f8fafc !important;
  border-radius: 8px !important;
  padding: 12px 14px !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5) !important;
  border: 1px solid #334155 !important;
  font-family: inherit !important;
}

.maplibregl-popup-anchor-bottom .maplibregl-popup-tip {
  border-top-color: #141c2e !important;
}

.maplibregl-popup-anchor-top .maplibregl-popup-tip {
  border-bottom-color: #141c2e !important;
}

.maplibregl-popup-anchor-left .maplibregl-popup-tip {
  border-right-color: #141c2e !important;
}

.maplibregl-popup-anchor-right .maplibregl-popup-tip {
  border-left-color: #141c2e !important;
}

.maplibregl-popup-close-button {
  color: #94a3b8 !important;
  font-size: 16px !important;
  padding: 4px 8px !important;
}

.maplibregl-popup-close-button:hover {
  color: #ffffff !important;
  background: transparent !important;
}

.map-popup-card {
  min-width: 180px;
}

.popup-title {
  font-weight: 600;
  font-size: 0.88rem;
  color: #f8fafc;
  margin-bottom: 3px;
}

.popup-address {
  font-size: 0.78rem;
  color: #94a3b8;
  margin-bottom: 8px;
}

.popup-actions {
  display: flex;
  gap: 8px;
}

.popup-link {
  font-size: 0.75rem;
  font-weight: 600;
  color: #38bdf8;
  text-decoration: none;
}

.popup-link:hover {
  text-decoration: underline;
  color: #7dd3fc;
}
</style>
