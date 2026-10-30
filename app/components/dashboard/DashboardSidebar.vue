<script setup lang="ts">
import { computed, watch } from 'vue';
import type { NavItem, NavSection } from '~~/shared/types';
import {
  Building2,
  LayoutDashboard,
  Building,
  ClipboardList,
  Search,
  FileSignature,
  FileText,
  CreditCard,
  Wrench,
  Users,
  ShieldCheck,
  LogOut,
  BarChart3,
  X,
} from '@lucide/vue';
import { useAuth } from '../../composables/useAuth';

interface Props {
  modelValue?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'close'): void;
}>();

const { t } = useI18n();
const { user, userRole, logout, isAdmin, isLandlord, isTenant, isTechnician } = useAuth();
const route = useRoute();

const roleTitles = computed<Record<string, string>>(() => ({
  ADMIN: t('users.roles.admin'),
  LANDLORD: t('users.roles.landlord'),
  TENANT: t('users.roles.tenant'),
  TECHNICIAN: t('users.roles.technician'),
}));

const formattedRole = computed(() => {
  return (userRole.value && roleTitles.value[userRole.value]) || userRole.value || '';
});

const navSections = computed<NavSection[]>(() => [
  {
    title: t('nav.sections.main'),
    items: [
      {
        name: t('common.overview'),
        to: '/dashboard',
        icon: LayoutDashboard,
        exact: true,
      },
    ],
  },
  {
    title: t('nav.sections.properties'),
    show: isLandlord.value || isAdmin.value,
    items: [
      {
        name: t('common.properties_units'),
        to: '/dashboard/properties',
        icon: Building,
      },
      {
        name: t('nav.applications'),
        to: '/dashboard/applications',
        icon: ClipboardList,
      },
    ],
  },
  {
    title: t('nav.sections.leasing'),
    show: isTenant.value,
    items: [
      {
        name: t('dashboard.metrics.browse_units'),
        to: '/properties',
        icon: Search,
      },
      {
        name: t('applications.my_applications'),
        to: '/dashboard/applications',
        icon: FileSignature,
      },
    ],
  },
  {
    title: t('nav.sections.finances'),
    show: !isTechnician.value,
    items: [
      {
        name: t('nav.leases'),
        to: '/dashboard/leases',
        icon: FileText,
      },
      {
        name: t('nav.invoices'),
        to: '/dashboard/invoices',
        icon: CreditCard,
      },
      {
        name: t('nav.reports'),
        to: '/dashboard/reports',
        icon: BarChart3,
        show: isLandlord.value || isAdmin.value,
      },
    ],
  },
  {
    title: t('nav.sections.operations'),
    items: [
      {
        name: t('nav.maintenance'),
        to: '/dashboard/maintenance',
        icon: Wrench,
      },
    ],
  },
  {
    title: t('nav.sections.system_admin'),
    show: isAdmin.value,
    items: [
      {
        name: t('nav.users'),
        to: '/dashboard/users',
        icon: Users,
      },
      {
        name: t('nav.audit_logs'),
        to: '/dashboard/audit-logs',
        icon: ShieldCheck,
      },
    ],
  },
]);

const visibleNavSections = computed(() => {
  return navSections.value
    .filter((section) => section.show !== false)
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.show !== false),
    }))
    .filter((section) => section.items.length > 0);
});

function isLinkActive(item: NavItem) {
  if (item.exact) {
    return route.path === item.to;
  }
  return route.path.startsWith(item.to);
}

function closeSidebar() {
  emit('update:modelValue', false);
  emit('close');
}

watch(
  () => route.path,
  () => {
    closeSidebar();
  }
);
</script>

<template>
  <div>
    <!-- Mobile Backdrop -->
    <div
      v-if="modelValue"
      class="backdrop-blur-xs fixed inset-0 z-40 bg-black/60 transition-opacity md:hidden"
      @click="closeSidebar"
      aria-hidden="true"
    />

    <!-- Sidebar Drawer / Static Panel -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 flex h-screen max-h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-neutral-200 bg-white shadow-2xl transition-transform duration-200 ease-out dark:border-neutral-800 dark:bg-neutral-950 md:static md:shadow-none',
        modelValue ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      ]"
    >
      <!-- Header / Logo -->
      <div
        class="flex shrink-0 items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800"
      >
        <NuxtLink
          to="/"
          class="flex items-center gap-2.5 text-lg font-bold text-neutral-900 transition-opacity hover:opacity-90 dark:text-white"
        >
          <div
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-neutral-900 text-white shadow-sm dark:bg-blue-600"
          >
            <Building2 :size="18" />
          </div>
          <span>Rent<span class="text-blue-600 dark:text-blue-500">Ease</span></span>
        </NuxtLink>
        <button
          type="button"
          class="rounded-md p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-white md:hidden"
          @click="closeSidebar"
          aria-label="Close Navigation"
        >
          <X :size="18" />
        </button>
      </div>

      <!-- Navigation Links -->
      <nav class="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        <template v-for="(section, idx) in visibleNavSections" :key="section.title">
          <div
            :class="[
              'px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500',
              idx === 0 ? 'pt-2' : 'pt-3',
            ]"
          >
            {{ section.title }}
          </div>
          <NuxtLink
            v-for="item in section.items"
            :key="item.to + item.name"
            :to="item.to"
            class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors"
            :class="
              isLinkActive(item)
                ? 'shadow-xs bg-neutral-900 font-semibold text-white dark:bg-blue-600 dark:text-white'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-white'
            "
          >
            <component :is="item.icon" :size="16" class="shrink-0" />
            <span>{{ item.name }}</span>
          </NuxtLink>
        </template>
      </nav>

      <!-- User Profile Footer -->
      <div
        class="shrink-0 border-t border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950"
      >
        <div
          class="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-2 dark:border-neutral-800 dark:bg-neutral-900/60"
        >
          <div
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white dark:bg-blue-600"
          >
            {{ user?.fullName?.charAt(0) || 'U' }}
          </div>
          <div class="flex min-w-0 flex-1 flex-col">
            <span
              class="truncate text-xs font-semibold text-neutral-900 dark:text-white"
              :title="user?.fullName"
            >
              {{ user?.fullName }}
            </span>
            <span
              class="truncate font-mono text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
            >
              {{ formattedRole }}
            </span>
          </div>
          <button
            type="button"
            @click="logout"
            class="shrink-0 rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-rose-600 dark:hover:bg-neutral-800 dark:hover:text-rose-400"
            :title="t('common.sign_out')"
            :aria-label="t('common.sign_out')"
          >
            <LogOut :size="15" />
          </button>
        </div>
      </div>
    </aside>
  </div>
</template>
