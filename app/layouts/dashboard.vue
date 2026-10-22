<script setup lang="ts">
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
  CheckCircle2,
  BarChart3
} from '@lucide/vue';
import { useAuth } from '../composables/useAuth';
import ThemeToggle from '../components/common/ThemeToggle.vue';

const { user, userRole, logout, isAdmin, isLandlord, isTenant, isTechnician } = useAuth();
const route = useRoute();
</script>

<template>
  <div class="dashboard-shell">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <NuxtLink to="/" class="brand">
          <div class="brand-icon-wrapper">
            <Building2 :size="18" class="brand-icon-svg" />
          </div>
          <span class="brand-name">Rent<span class="brand-accent">Ease</span></span>
        </NuxtLink>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-title">Main</div>
        <NuxtLink to="/dashboard" class="nav-item" :class="{ active: route.path === '/dashboard' }">
          <LayoutDashboard :size="16" class="nav-icon" />
          <span>Overview</span>
        </NuxtLink>

        <!-- Landlord & Admin Links -->
        <template v-if="isLandlord || isAdmin">
          <div class="nav-section-title">Properties</div>
          <NuxtLink to="/dashboard/properties" class="nav-item" :class="{ active: route.path.startsWith('/dashboard/properties') }">
            <Building :size="16" class="nav-icon" />
            <span>Properties & Units</span>
          </NuxtLink>
          <NuxtLink to="/dashboard/applications" class="nav-item" :class="{ active: route.path.startsWith('/dashboard/applications') }">
            <ClipboardList :size="16" class="nav-icon" />
            <span>Applications</span>
          </NuxtLink>
        </template>

        <!-- Tenant Links -->
        <template v-if="isTenant">
          <div class="nav-section-title">Leasing</div>
          <NuxtLink to="/properties" class="nav-item">
            <Search :size="16" class="nav-icon" />
            <span>Browse Units</span>
          </NuxtLink>
          <NuxtLink to="/dashboard/applications" class="nav-item" :class="{ active: route.path.startsWith('/dashboard/applications') }">
            <FileSignature :size="16" class="nav-icon" />
            <span>My Applications</span>
          </NuxtLink>
        </template>

        <!-- Common Leases & Invoices -->
        <template v-if="!isTechnician">
          <div class="nav-section-title">Finances</div>
          <NuxtLink to="/dashboard/leases" class="nav-item" :class="{ active: route.path.startsWith('/dashboard/leases') }">
            <FileText :size="16" class="nav-icon" />
            <span>Leases</span>
          </NuxtLink>
          <NuxtLink to="/dashboard/invoices" class="nav-item" :class="{ active: route.path.startsWith('/dashboard/invoices') }">
            <CreditCard :size="16" class="nav-icon" />
            <span>Invoices & Payments</span>
          </NuxtLink>
          <NuxtLink v-if="isLandlord || isAdmin" to="/dashboard/reports" class="nav-item" :class="{ active: route.path.startsWith('/dashboard/reports') }">
            <BarChart3 :size="16" class="nav-icon" />
            <span>Reports & Analytics</span>
          </NuxtLink>
        </template>

        <!-- Maintenance (All Roles) -->
        <div class="nav-section-title">Operations</div>
        <NuxtLink to="/dashboard/maintenance" class="nav-item" :class="{ active: route.path.startsWith('/dashboard/maintenance') }">
          <Wrench :size="16" class="nav-icon" />
          <span>Maintenance</span>
        </NuxtLink>

        <!-- Admin Only -->
        <template v-if="isAdmin">
          <div class="nav-section-title">System Admin</div>
          <NuxtLink to="/dashboard/users" class="nav-item" :class="{ active: route.path.startsWith('/dashboard/users') }">
            <Users :size="16" class="nav-icon" />
            <span>User Management</span>
          </NuxtLink>
          <NuxtLink to="/dashboard/audit-logs" class="nav-item" :class="{ active: route.path.startsWith('/dashboard/audit-logs') }">
            <ShieldCheck :size="16" class="nav-icon" />
            <span>Audit Logs</span>
          </NuxtLink>
        </template>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info-card">
          <div class="user-avatar">{{ user?.fullName?.charAt(0) || 'U' }}</div>
          <div class="user-meta">
            <div class="user-name">{{ user?.fullName }}</div>
            <span :class="`badge badge-${userRole?.toLowerCase()}`">{{ userRole }}</span>
          </div>
        </div>
        <button @click="logout" class="btn-secondary btn-block logout-btn">
          <LogOut :size="14" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="dashboard-body">
      <header class="topbar">
        <div class="topbar-title">
          <h2>{{ route.meta.title || 'Dashboard' }}</h2>
        </div>
        <div class="topbar-actions">
          <ThemeToggle />
          <div class="status-indicator">
            <CheckCircle2 :size="14" class="status-icon" />
            <span>System Operational</span>
          </div>
          <NotificationBell />
          <div class="user-pill">
            <span class="user-email">{{ user?.email }}</span>
          </div>
        </div>
      </header>

      <main class="dashboard-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.dashboard-shell {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 260px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
}

.sidebar-header {
  padding: 1.25rem 1.25rem;
  border-bottom: 1px solid var(--border-subtle);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
}

.brand-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  background: var(--primary-subtle);
  color: #818cf8;
}

.brand-accent {
  color: #818cf8;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
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
  color: #818cf8;
  font-weight: 600;
}

.nav-item.active .nav-icon {
  color: #818cf8;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.user-info-card {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-sm);
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  color: var(--text-main);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  overflow: hidden;
}

.user-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-block {
  width: 100%;
}

.logout-btn {
  padding: 0.45rem 0.75rem;
  font-size: 0.8rem;
  gap: 0.4rem;
}

.dashboard-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.topbar {
  height: 60px;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-secondary);
  padding: 0 1.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.topbar-title h2 {
  font-size: 1.15rem;
  font-weight: 600;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.status-icon {
  color: var(--accent-emerald);
}

.user-pill {
  font-size: 0.8rem;
  color: var(--text-muted);
  background: var(--bg-surface);
  padding: 0.3rem 0.65rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-subtle);
}

.dashboard-content {
  flex: 1;
  padding: 1.75rem;
  overflow-y: auto;
}
</style>
