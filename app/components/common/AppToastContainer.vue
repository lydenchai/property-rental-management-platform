<script setup lang="ts">
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from '@lucide/vue';
import { useToast, type ToastItem } from '../../composables/useToast';

const { toasts, remove } = useToast();

function getIcon(type: ToastItem['type']) {
  switch (type) {
    case 'success':
      return CheckCircle2;
    case 'error':
      return AlertCircle;
    case 'warning':
      return AlertTriangle;
    case 'info':
    default:
      return Info;
  }
}

function getTypeStyles(type: ToastItem['type']) {
  switch (type) {
    case 'success':
      return {
        card: 'border-l-4 border-l-emerald-500',
        icon: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
        progress: 'bg-emerald-500',
      };
    case 'error':
      return {
        card: 'border-l-4 border-l-rose-500',
        icon: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
        progress: 'bg-rose-500',
      };
    case 'warning':
      return {
        card: 'border-l-4 border-l-amber-500',
        icon: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
        progress: 'bg-amber-500',
      };
    case 'info':
    default:
      return {
        card: 'border-l-4 border-l-blue-500',
        icon: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
        progress: 'bg-blue-500',
      };
  }
}
</script>

<template>
  <div
    class="pointer-events-none fixed right-5 top-5 z-50 w-[calc(100%-2.5rem)] max-w-sm"
    aria-live="polite"
    aria-atomic="true"
  >
    <TransitionGroup name="toast" tag="div" class="flex flex-col gap-2.5">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-xl border border-neutral-200 bg-white p-4 shadow-lg transition-all duration-200 dark:border-neutral-800 dark:bg-neutral-900',
          getTypeStyles(toast.type).card,
        ]"
        role="alert"
      >
        <div
          :class="[
            'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
            getTypeStyles(toast.type).icon,
          ]"
        >
          <component :is="getIcon(toast.type)" :size="16" />
        </div>

        <div class="min-w-0 flex-1">
          <div
            v-if="toast.title"
            class="mb-0.5 text-xs font-semibold text-neutral-900 dark:text-white"
          >
            {{ toast.title }}
          </div>
          <div class="break-words text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
            {{ toast.message }}
          </div>
        </div>

        <button
          type="button"
          @click="remove(toast.id)"
          class="shrink-0 cursor-pointer rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          aria-label="Close notification"
        >
          <X :size="14" />
        </button>

        <div
          v-if="toast.duration && toast.duration > 0"
          :class="[
            'animate-shrink absolute bottom-0 left-0 h-0.5 w-full opacity-60',
            getTypeStyles(toast.type).progress,
          ]"
          :style="{ animationDuration: `${toast.duration}ms` }"
        />
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped></style>
