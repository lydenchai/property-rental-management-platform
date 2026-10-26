<script setup lang="ts">
import type { Component } from 'vue';

interface Props {
  title: string;
  description: string;
  icon?: Component;
  badge?: string;
  to?: string;
  iconColor?: 'blue' | 'indigo' | 'emerald' | 'amber' | 'rose';
}

const props = withDefaults(defineProps<Props>(), {
  iconColor: 'blue',
});

const colorClasses = computed(() => {
  switch (props.iconColor) {
    case 'indigo':
      return 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800';
    case 'emerald':
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';
    case 'amber':
      return 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
    case 'rose':
      return 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800';
    default:
      return 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
  }
});
</script>

<template>
  <component
    :is="to ? 'NuxtLink' : 'div'"
    :to="to"
    class="group flex h-full flex-col items-start rounded-xl border border-neutral-200 bg-white p-6 text-left no-underline transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-500 dark:border-neutral-800 dark:bg-neutral-900"
  >
    <!-- Icon Container in signature rounded squircle -->
    <div
      :class="['mb-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', colorClasses]"
    >
      <component :is="icon" v-if="icon" :size="20" />
      <slot name="icon" v-else />
    </div>

    <!-- Title and optional badge -->
    <div class="mb-2 flex w-full items-center gap-2">
      <h3
        class="text-base font-semibold text-neutral-900 transition-colors group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400"
      >
        {{ title }}
      </h3>
      <span
        v-if="badge"
        class="rounded-full border border-primary-200 bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-700 dark:border-primary-800 dark:bg-primary-950/40 dark:text-primary-300"
        >{{ badge }}</span
      >
    </div>

    <!-- Description -->
    <p class="mb-4 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
      {{ description }}
    </p>

    <!-- Optional slot for actions / extra content -->
    <div v-if="$slots.default" class="mt-auto w-full pt-2">
      <slot />
    </div>
  </component>
</template>
