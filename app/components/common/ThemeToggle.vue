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
  <button
    type="button"
    @click="toggleTheme"
    class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white p-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
    :class="{ 'h-8 w-8': !showLabel, 'px-3 py-1.5': showLabel }"
    :title="isDark ? t('theme.light') : t('theme.dark')"
    :aria-label="isDark ? t('theme.light') : t('theme.dark')"
  >
    <div class="flex shrink-0 items-center justify-center">
      <Sun v-if="isDark" :size="16" class="text-amber-400" />
      <Moon v-else :size="16" class="text-indigo-500" />
    </div>
    <span v-if="showLabel">
      {{ isDark ? t('theme.light') : t('theme.dark') }}
    </span>
  </button>
</template>
