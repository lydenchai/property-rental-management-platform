<script setup lang="ts">
import { Sun, Moon } from '@lucide/vue';
import { useTheme } from '../../composables/useTheme';

interface Props {
  showLabel?: boolean;
}

defineProps<Props>();

const { t } = useI18n();
const { isDark, toggleTheme } = useTheme();
</script>

<template>
  <button type="button" @click="toggleTheme" class="theme-toggle-btn"
    :title="isDark ? t('theme.light') : t('theme.dark')"
    :aria-label="isDark ? t('theme.light') : t('theme.dark')">
    <div class="icon-swap-container">
      <Sun v-if="isDark" :size="16" class="toggle-icon text-amber-400" />
      <Moon v-else :size="16" class="toggle-icon text-indigo-500" />
    </div>
    <span v-if="showLabel" class="theme-label">
      {{ isDark ? t('theme.light') : t('theme.dark') }}
    </span>
  </button>
</template>

<style scoped>
.theme-toggle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: var(--radius-full, 9999px);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  color: var(--text-main);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.theme-toggle-btn:hover {
  background: var(--bg-surface-hover);
  border-color: var(--border-default);
}

.icon-swap-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-icon {
  flex-shrink: 0;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.theme-toggle-btn:hover .toggle-icon {
  transform: rotate(20deg) scale(1.1);
}

.theme-label {
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--text-muted, #94a3b8);
}
</style>
