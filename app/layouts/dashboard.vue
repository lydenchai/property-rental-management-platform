<script setup lang="ts">
import { ref, computed, watch } from 'vue';
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
  Menu,
  X
} from '@lucide/vue';
import { useAuth } from '../composables/useAuth';
import ThemeToggle from '../components/common/ThemeToggle.vue';
import LanguageSwitcher from '../components/common/LanguageSwitcher.vue';
import AppToastContainer from '../components/common/AppToastContainer.vue';

const { t } = useI18n();
const { user, userRole, logout, isAdmin, isLandlord, isTenant, isTechnician } = useAuth();
const route = useRoute();
const isMobileNavOpen = ref(false);

const roleTitles = computed<Record<string, string>>(() => ({
  ADMIN: t('users.roles.admin'),
  LANDLORD: t('users.roles.landlord'),
  TENANT: t('users.roles.tenant'),
  TECHNICIAN: t('users.roles.technician'),
}));

const formattedRole = computed(() => {
  return (userRole.value && roleTitles.value[userRole.value]) || userRole.value || '';
});

watch(() => route.path, () => {
  isMobileNavOpen.value = false;
});
</script>

<template>
  <div class="dashboard-shell">
    <!-- Mobile backdrop -->
    <div v-if="isMobileNavOpen" class="sidebar-backdrop" @click="isMobileNavOpen = false" aria-hidden="true" />

    <!-- Sidebar -->
    <aside :class="['sidebar', { 'mobile-open': isMobileNavOpen }]">
      <div class="sidebar-header">
        <NuxtLink to="/" class="brand">
          <div class="brand-icon-wrapper">
            <Building2 :size="18" class="brand-icon-svg" />
          </div>
          <span class="brand-name">Rent<span class="brand-accent">Ease</span></span>
        </NuxtLink>
        <button class="mobile-close-btn" @click="isMobileNavOpen = false" aria-label="Close Navigation">
          <X :size="18" />
        </button>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-title">{{ t('nav.sections.main') }}</div>
        <NuxtLink to="/dashboard" class="nav-item" :class="{ active: route.path === '/dashboard' }">
          <LayoutDashboard :size="16" class="nav-icon" />
          <span>{{ t('common.overview') }}</span>
        </NuxtLink>

        <!-- Landlord & Admin Links -->
        <template v-if="isLandlord || isAdmin">
          <div class="nav-section-title">{{ t('nav.sections.properties') }}</div>
          <NuxtLink to="/dashboard/properties" class="nav-item"
            :class="{ active: route.path.startsWith('/dashboard/properties') }">
            <Building :size="16" class="nav-icon" />
            <span>{{ t('common.properties_units') }}</span>
          </NuxtLink>
          <NuxtLink to="/dashboard/applications" class="nav-item"
            :class="{ active: route.path.startsWith('/dashboard/applications') }">
            <ClipboardList :size="16" class="nav-icon" />
            <span>{{ t('nav.applications') }}</span>
          </NuxtLink>
        </template>

        <!-- Tenant Links -->
        <template v-if="isTenant">
          <div class="nav-section-title">{{ t('nav.sections.leasing') }}</div>
          <NuxtLink to="/properties" class="nav-item">
            <Search :size="16" class="nav-icon" />
            <span>{{ t('dashboard.metrics.browse_units') }}</span>
          </NuxtLink>
          <NuxtLink to="/dashboard/applications" class="nav-item"
            :class="{ active: route.path.startsWith('/dashboard/applications') }">
            <FileSignature :size="16" class="nav-icon" />
            <span>{{ t('applications.my_applications') }}</span>
          </NuxtLink>
        </template>

        <!-- Common Leases & Invoices -->
        <template v-if="!isTechnician">
          <div class="nav-section-title">{{ t('nav.sections.finances') }}</div>
          <NuxtLink to="/dashboard/leases" class="nav-item"
            :class="{ active: route.path.startsWith('/dashboard/leases') }">
            <FileText :size="16" class="nav-icon" />
            <span>{{ t('nav.leases') }}</span>
          </NuxtLink>
          <NuxtLink to="/dashboard/invoices" class="nav-item"
            :class="{ active: route.path.startsWith('/dashboard/invoices') }">
            <CreditCard :size="16" class="nav-icon" />
            <span>{{ t('nav.invoices') }}</span>
          </NuxtLink>
          <NuxtLink v-if="isLandlord || isAdmin" to="/dashboard/reports" class="nav-item"
            :class="{ active: route.path.startsWith('/dashboard/reports') }">
            <BarChart3 :size="16" class="nav-icon" />
            <span>{{ t('nav.reports') }}</span>
          </NuxtLink>
        </template>

        <!-- Maintenance (All Roles) -->
        <div class="nav-section-title">{{ t('nav.sections.operations') }}</div>
        <NuxtLink to="/dashboard/maintenance" class="nav-item"
          :class="{ active: route.path.startsWith('/dashboard/maintenance') }">
          <Wrench :size="16" class="nav-icon" />
          <span>{{ t('nav.maintenance') }}</span>
        </NuxtLink>

        <!-- Admin Only -->
        <template v-if="isAdmin">
          <div class="nav-section-title">{{ t('nav.sections.system_admin') }}</div>
          <NuxtLink to="/dashboard/users" class="nav-item"
            :class="{ active: route.path.startsWith('/dashboard/users') }">
            <Users :size="16" class="nav-icon" />
            <span>{{ t('nav.users') }}</span>
          </NuxtLink>
          <NuxtLink to="/dashboard/audit-logs" class="nav-item"
            :class="{ active: route.path.startsWith('/dashboard/audit-logs') }">
            <ShieldCheck :size="16" class="nav-icon" />
            <span>{{ t('nav.audit_logs') }}</span>
          </NuxtLink>
        </template>
      </nav>

      <div class="sidebar-footer">
        <div class="user-profile-tile">
          <div class="user-avatar-circle">
            {{ user?.fullName?.charAt(0) || 'U' }}
          </div>
          <div class="user-meta-details">
            <span class="user-display-name" :title="user?.fullName">{{ user?.fullName }}</span>
            <span class="user-role-label">{{ formattedRole }}</span>
          </div>
          <button @click="logout" class="logout-icon-action" :title="t('common.sign_out')" :aria-label="t('common.sign_out')">
            <LogOut :size="15" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="dashboard-body">
      <header class="topbar">
        <div class="topbar-left">
          <button class="mobile-toggle-btn" @click="isMobileNavOpen = !isMobileNavOpen"
            aria-label="Toggle navigation drawer">
            <Menu :size="18" />
          </button>
          <div class="topbar-title">
            <h2>{{ route.meta.title || 'Dashboard' }}</h2>
          </div>
        </div>

        <div class="topbar-actions">
          <LanguageSwitcher />
          <ThemeToggle />
          <NotificationBell />
        </div>
      </header>

      <main class="dashboard-content">
        <slot />
      </main>
    </div>

    <!-- Global Toast Notifications -->
    <AppToastContainer />
  </div>
</template>

<style scoped>
.dashboard-shell {
  display: flex;
  height: 100vh;
  max-height: 100vh;
  width: 100%;
  overflow: hidden;
  background-color: var(--bg-primary);
}

.sidebar {
  width: 260px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-height: 100vh;
  flex-shrink: 0;
  overflow: hidden;
  z-index: 30;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.sidebar-header {
  padding: 1.25rem;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.mobile-close-btn {
  display: none;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.25rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
  text-decoration: none;
}

.brand-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  background: var(--primary-subtle);
  color: var(--color-indigo-accent);
}

.brand-accent {
  color: var(--color-indigo-accent);
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  scrollbar-width: thin;
  scrollbar-color: var(--border-subtle) transparent;
}

.nav-section-title {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-dim);
  padding: 0.75rem 0.75rem 0.25rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.55rem 0.75rem;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  font-weight: 500;
  font-size: 0.875rem;
  text-decoration: none;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.nav-icon {
  flex-shrink: 0;
  color: var(--text-muted);
}

.nav-item:hover {
  background: var(--bg-surface-hover);
  color: var(--text-main);
}

.nav-item:hover .nav-icon {
  color: var(--text-main);
}

.nav-item.active {
  background: var(--primary-subtle);
  color: var(--color-indigo-accent);
  font-weight: 600;
}

.nav-item.active .nav-icon {
  color: var(--color-indigo-accent);
}

.sidebar-footer {
  padding: 0.85rem;
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-secondary);
  flex-shrink: 0;
}

.user-profile-tile {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.45rem 0.55rem;
  background: transparent;
  border-radius: var(--radius-sm);
  transition: background-color 0.15s ease;
}

.user-profile-tile:hover {
  background: var(--bg-hover);
}

.user-avatar-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-subtle);
  border: 1px solid var(--border-subtle);
  color: var(--text-main);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.user-meta-details {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  flex: 1;
  min-width: 0;
}

.user-display-name {
  font-size: 0.825rem;
  font-weight: 600;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.25;
}

.user-role-label {
  font-size: 0.725rem;
  color: var(--text-muted);
  font-weight: 400;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-icon-action {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s ease;
}

.logout-icon-action:hover {
  background: var(--bg-primary);
  color: var(--accent-rose);
  border-color: var(--border-subtle);
}

.dashboard-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-height: 100vh;
  min-width: 0;
  overflow: hidden;
  position: relative;
}

.topbar {
  height: 60px;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-secondary);
  padding: 0 1.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  z-index: 20;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mobile-toggle-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface);
  border-radius: var(--radius-sm);
  color: var(--text-main);
  cursor: pointer;
}

.topbar-title h2 {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text-main);
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.dashboard-content {
  flex: 1;
  padding: 1.75rem;
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: var(--border-subtle) transparent;
}

.dashboard-content::-webkit-scrollbar,
.sidebar-nav::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.dashboard-content::-webkit-scrollbar-track,
.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.dashboard-content::-webkit-scrollbar-thumb,
.sidebar-nav::-webkit-scrollbar-thumb {
  background: var(--border-subtle);
  border-radius: var(--radius-full);
}

.dashboard-content::-webkit-scrollbar-thumb:hover,
.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: var(--border-default);
}

/* Mobile & Tablet Drawer */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    transform: translateX(-100%);
    box-shadow: 0 0 24px rgba(0, 0, 0, 0.25);
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .mobile-close-btn {
    display: block;
  }

  .mobile-toggle-btn {
    display: inline-flex;
  }

  .sidebar-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
    z-index: 25;
  }

  .topbar {
    padding: 0 1rem;
  }

  .dashboard-content {
    padding: 1rem;
  }
}
</style>
