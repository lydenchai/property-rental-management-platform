<script setup lang="ts">
import { computed } from 'vue';
import { Languages } from '@lucide/vue';

interface LocaleItem {
  code: string;
  name?: string;
  iso?: string;
}

const { locale, setLocale, locales } = useI18n();

const availableLocales = computed<LocaleItem[]>(() => {
  return (locales.value || []).map((l: any) => {
    if (typeof l === 'string') {
      return { code: l, name: l.toUpperCase() };
    }
    return l;
  });
});
</script>

<template>
  <div class="lang-segmented-group" role="group" aria-label="Language selection">
    <div class="lang-icon-badge" aria-hidden="true">
      <Languages :size="13" class="lang-icon" />
    </div>
    <div class="lang-buttons">
      <button
        v-for="item in availableLocales"
        :key="item.code"
        type="button"
        :class="['lang-segment-btn', { active: locale === item.code }]"
        @click="setLocale(item.code as any)"
        :title="item.code === 'km' ? 'ភាសាខ្មែរ (Khmer)' : 'English'"
      >
        <span>{{ item.code === 'km' ? 'ខ្មែរ' : 'EN' }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.lang-segmented-group {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 2px 3px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm, 6px);
  height: 32px;
}

.lang-icon-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.25rem 0 0.35rem;
  color: var(--text-muted, #94a3b8);
}

.lang-buttons {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.lang-segment-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem 0.5rem;
  height: 24px;
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-muted, #94a3b8);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  line-height: 1;
}

.lang-segment-btn:hover {
  color: var(--text-main);
  background: var(--bg-surface-hover);
}

.lang-segment-btn.active {
  color: #ffffff;
  background: var(--primary, #4f46e5);
  font-weight: 700;
}
</style>
