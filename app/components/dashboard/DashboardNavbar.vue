<script setup lang="ts">
import { computed } from 'vue';
import { Menu } from '@lucide/vue';
import ThemeToggle from '../common/ThemeToggle.vue';
import LanguageSwitcher from '../common/LanguageSwitcher.vue';
import NotificationBell from '../common/NotificationBell.vue';

interface Props {
  title?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'toggle-sidebar'): void;
}>();

const { t } = useI18n();
const route = useRoute();

const pageTitles = computed<Record<string, string>>(() => ({
  '/dashboard': t('common.overview'),
  '/dashboard/properties/create': t('properties.create_title'),
  '/dashboard/properties': t('common.properties_units'),
  '/dashboard/applications': t('nav.applications'),
  '/dashboard/leases': t('nav.leases'),
  '/dashboard/invoices': t('nav.invoices'),
  '/dashboard/maintenance': t('nav.maintenance'),
  '/dashboard/reports': t('nav.reports'),
  '/dashboard/users': t('nav.users'),
  '/dashboard/audit-logs': t('nav.audit_logs'),
}));

const computedTitle = computed(() => {
  if (props.title) return props.title;
  if (route.path === '/dashboard') return t('common.overview');
  for (const [prefix, title] of Object.entries(pageTitles.value)) {
    if (prefix !== '/dashboard' && route.path.startsWith(prefix)) {
      return title;
    }
  }
  return (route.meta.title as string) || t('nav.dashboard');
});
</script>

<template>
  <header
    class="z-20 flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 bg-white/95 px-3 backdrop-blur-sm transition-colors duration-200 dark:border-neutral-800 dark:bg-neutral-950/95 sm:px-6"
  >
    <!-- Left: Hamburger toggle + Dynamic Title -->
    <div class="mr-2 flex min-w-0 flex-1 items-center gap-2 sm:mr-4 sm:gap-3">
      <button
        type="button"
        class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 md:hidden"
        @click="emit('toggle-sidebar')"
        aria-label="Toggle navigation drawer"
      >
        <Menu :size="18" />
      </button>

      <slot name="title" :title="computedTitle">
        <div
          class="min-w-0 flex-1 text-sm font-bold tracking-tight text-neutral-900 dark:text-white sm:text-lg"
        >
          <h2 class="truncate">{{ computedTitle }}</h2>
        </div>
      </slot>
    </div>

    <!-- Right: Utility Controls & Actions -->
    <div class="flex shrink-0 items-center gap-1.5 sm:gap-3">
      <slot name="actions" />
      <LanguageSwitcher />
      <ThemeToggle />
      <NotificationBell />
    </div>
  </header>
</template>
