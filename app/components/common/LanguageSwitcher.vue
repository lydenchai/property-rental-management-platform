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
  <div
    class="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white p-0.5 dark:border-neutral-700 dark:bg-neutral-800"
    role="group"
    aria-label="Language selection"
  >
    <div
      class="flex items-center justify-center pl-1.5 pr-0.5 text-neutral-400 dark:text-neutral-500"
      aria-hidden="true"
    >
      <Languages :size="13" />
    </div>
    <div class="inline-flex items-center gap-0.5">
      <button
        v-for="item in availableLocales"
        :key="item.code"
        type="button"
        :class="[
          'inline-flex cursor-pointer items-center justify-center rounded px-2 py-1 text-xs font-semibold leading-none transition-colors',
          locale === item.code
            ? 'shadow-xs bg-primary-600 text-white'
            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-white',
        ]"
        @click="setLocale(item.code as any)"
        :title="item.code === 'km' ? 'ភាសាខ្មែរ (Khmer)' : 'English'"
      >
        <span>{{ item.code === 'km' ? 'ខ្មែរ' : 'EN' }}</span>
      </button>
    </div>
  </div>
</template>
