<script setup lang="ts">
import { Building2, ArrowLeft } from '@lucide/vue';
import ThemeToggle from '../components/common/ThemeToggle.vue';
import LanguageSwitcher from '../components/common/LanguageSwitcher.vue';

const { t } = useI18n();
</script>

<template>
  <div
    class="flex min-h-screen items-center justify-center bg-neutral-100 p-4 font-sans text-neutral-900 transition-colors duration-200 dark:bg-black dark:text-neutral-100 sm:p-8"
  >
    <div class="flex w-full max-w-md flex-col gap-5">
      <div class="flex items-center justify-between px-1">
        <NuxtLink
          to="/"
          class="flex items-center gap-2.5 text-xl font-bold tracking-tight text-neutral-900 transition-opacity hover:opacity-90 dark:text-white"
        >
          <div
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-neutral-900 text-white shadow-sm dark:bg-blue-600"
          >
            <Building2 :size="18" />
          </div>
          <span>Rent<span class="text-blue-600 dark:text-blue-500">Ease</span></span>
        </NuxtLink>

        <div class="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>

      <main
        class="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-8"
      >
        <slot />
      </main>

      <div class="text-center">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white sm:text-sm"
        >
          <ArrowLeft :size="14" />
          <span>{{ t('auth.back_to_home') }}</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
