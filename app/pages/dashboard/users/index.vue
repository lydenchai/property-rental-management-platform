<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import {
  Users,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle2,
  Filter,
} from '@lucide/vue';
import { useAuth } from '../../../composables/useAuth';
import type { UserAccount } from '~~/shared/types';
import AppTableCard from '../../../components/common/AppTableCard.vue';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  title: 'User Management',
});

const { t } = useI18n();
const { isAdmin } = useAuth();
const userStore = useUserStore();

const {
  users,
  isLoading,
  isToggling,
  errorMessage,
  totalUsers,
  adminCount,
  landlordCount,
  tenantCount,
  techCount,
  suspendedCount,
} = userStore;

const {
  fetchUsers,
  loadUsers,
  updateUserStatus,
} = userStore;

const successMessage = ref<string | null>(null);

// Filters
const roleFilter = ref('ALL');
const statusFilter = ref('ALL');
const searchQuery = ref('');

// Status change modal
const userToToggle = ref<UserAccount | null>(null);

const filteredUsers = computed(() => {
  return users.value.filter((u) => {
    if (roleFilter.value !== 'ALL' && u.role !== roleFilter.value) {
      return false;
    }
    if (statusFilter.value !== 'ALL' && u.status !== statusFilter.value) {
      return false;
    }
    if (!searchQuery.value.trim()) return true;

    const q = searchQuery.value.toLowerCase();
    const name = u.fullName.toLowerCase();
    const email = u.email.toLowerCase();
    const phone = (u.phone || '').toLowerCase();
    const role = u.role.toLowerCase();
    return name.includes(q) || email.includes(q) || phone.includes(q) || role.includes(q);
  });
});

// Pagination state
const currentPage = ref(1);
const pageSize = ref(5);

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredUsers.value.slice(start, start + pageSize.value);
});

watch([roleFilter, statusFilter, searchQuery], () => {
  currentPage.value = 1;
});

async function executeToggleStatus() {
  if (!userToToggle.value) return;

  const newStatus: any = userToToggle.value.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
  const res = await updateUserStatus(userToToggle.value.id, newStatus) as any;

  if (res.success) {
    successMessage.value = res.message || 'User status updated successfully';
    userToToggle.value = null;
    setTimeout(() => {
      successMessage.value = null;
    }, 4000);
  }
}

onMounted(() => {
  loadUsers();
});
</script>

<template>
  <div class="users-page">
    <!-- Top Bar -->
    <div class="page-top-bar">
      <div>
        <h1>{{ t('users.title') }}</h1>
        <p class="subtitle">
          {{ t('users.subtitle') }}
        </p>
      </div>
      <div class="admin-shield-badge">
        <Users :size="15" />
        <span>{{ totalUsers }} {{ t('users.total_accounts') }}</span>
      </div>
    </div>

    <!-- Alert Messages -->
    <div v-if="successMessage" class="alert-success">
      <CheckCircle2 :size="16" />
      <span>{{ successMessage }}</span>
    </div>

    <div v-if="errorMessage" class="alert-error">
      <AlertCircle :size="16" />
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card card-flat">
        <span class="stat-label">{{ t('users.landlords_card') }}</span>
        <div class="stat-value font-mono">{{ landlordCount }}</div>
        <div class="stat-subtext">{{ t('users.landlords_sub') }}</div>
      </div>
      <div class="stat-card card-flat">
        <span class="stat-label">{{ t('users.tenants_card') }}</span>
        <div class="stat-value font-mono">{{ tenantCount }}</div>
        <div class="stat-subtext">{{ t('users.tenants_sub') }}</div>
      </div>
      <div class="stat-card card-flat">
        <span class="stat-label">{{ t('users.technicians_card') }}</span>
        <div class="stat-value font-mono">{{ techCount }}</div>
        <div class="stat-subtext">{{ t('users.technicians_sub') }}</div>
      </div>
      <div class="stat-card card-flat">
        <span class="stat-label">{{ t('users.suspended_card') }}</span>
        <div class="stat-value font-mono" :class="{ 'text-danger': suspendedCount > 0 }">
          {{ suspendedCount }}
        </div>
        <div class="stat-subtext">{{ t('users.suspended_sub') }}</div>
      </div>
    </div>

    <!-- Users Table using shared AppTableCard -->
    <AppTableCard v-model:search="searchQuery" :search-placeholder="t('users.search_placeholder')"
      :is-loading="isLoading" :is-empty="filteredUsers.length === 0" :empty-title="t('users.no_users')"
      :empty-description="t('users.no_users_desc')" :empty-icon="Users" v-model:current-page="currentPage"
      v-model:page-size="pageSize" :total-items="filteredUsers.length" :item-name="t('common.records')">
      <template #toolbar-start>
        <div class="filter-controls">
          <div class="select-wrap">
            <Filter :size="13" class="filter-icon" />
            <select v-model="roleFilter" class="filter-select">
              <option value="ALL">{{ t('users.filter_all_roles') }}</option>
              <option value="ADMIN">{{ t('users.roles.admin') }}</option>
              <option value="LANDLORD">{{ t('users.roles.landlord') }}</option>
              <option value="TENANT">{{ t('users.roles.tenant') }}</option>
              <option value="TECHNICIAN">{{ t('users.roles.technician') }}</option>
            </select>
          </div>

          <div class="select-wrap">
            <select v-model="statusFilter" class="filter-select">
              <option value="ALL">{{ t('users.filter_all_statuses') }}</option>
              <option value="ACTIVE">{{ t('common.active') }}</option>
              <option value="SUSPENDED">{{ t('common.suspended') }}</option>
            </select>
          </div>
        </div>
      </template>

      <table class="data-table">
        <thead>
          <tr>
            <th>{{ t('users.col_name_email') }}</th>
            <th>{{ t('users.col_phone') }}</th>
            <th>{{ t('users.col_role') }}</th>
            <th>{{ t('users.col_status') }}</th>
            <th>{{ t('users.col_registered') }}</th>
            <th class="text-right">{{ t('users.col_actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in paginatedUsers" :key="u.id">
            <td>
              <div class="user-cell">
                <span class="font-semibold">{{ u.fullName }}</span>
                <span class="text-dim text-xs font-mono">{{ u.email }}</span>
              </div>
            </td>
            <td>
              <span class="text-xs text-dim">{{ u.phone || 'N/A' }}</span>
            </td>
            <td>
              <span class="badge badge-pill" :class="{
                'badge-admin': u.role === 'ADMIN',
                'badge-landlord': u.role === 'LANDLORD',
                'badge-tenant': u.role === 'TENANT',
                'badge-technician': u.role === 'TECHNICIAN',
              }">
                <span class="badge-dot"></span>
                <span>{{ u.role === 'ADMIN' ? t('users.roles.admin') : u.role === 'LANDLORD' ? t('users.roles.landlord')
                  :
                  u.role === 'TENANT' ? t('users.roles.tenant') : t('users.roles.technician') }}</span>
              </span>
            </td>
            <td>
              <span class="badge badge-pill" :class="u.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'">
                <span class="badge-dot"></span>
                <span>{{ u.status === 'ACTIVE' ? t('common.active') : t('common.suspended') }}</span>
              </span>
            </td>
            <td>
              <span class="text-xs text-dim">{{ new Date(u.createdAt).toLocaleDateString() }}</span>
            </td>
            <td class="text-right">
              <button v-if="u.role !== 'ADMIN'" @click="userToToggle = u" class="btn-secondary btn-sm"
                :class="{ 'btn-suspend': u.status === 'ACTIVE', 'btn-activate': u.status === 'SUSPENDED' }">
                <component :is="u.status === 'ACTIVE' ? UserX : UserCheck" :size="13" />
                <span>{{ u.status === 'ACTIVE' ? t('users.suspend') : t('users.activate') }}</span>
              </button>
              <span v-else class="text-xs text-dim italic">{{ t('users.protected') }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </AppTableCard>

    <!-- Toggle Status Modal -->
    <div v-if="userToToggle" class="modal-backdrop">
      <div class="modal-card card-flat" style="max-width: 480px;">
        <div class="modal-header">
          <h3>{{ t('users.confirm_status_change') }}</h3>
          <button @click="userToToggle = null" class="modal-close">&times;</button>
        </div>

        <div class="modal-body">
          <p>
            {{ t('users.status_prompt', {
              name: userToToggle.fullName,
              email: userToToggle.email,
              from: userToToggle.status,
              to: userToToggle.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
            }) }}
          </p>

          <p v-if="userToToggle.status === 'ACTIVE'" class="text-xs text-dim">
            {{ t('users.suspend_warning') }}
          </p>
          <p v-else class="text-xs text-dim">
            {{ t('users.activate_warning') }}
          </p>

          <div class="modal-actions">
            <button type="button" @click="userToToggle = null" class="btn-secondary">
              {{ t('common.cancel') }}
            </button>
            <button @click="executeToggleStatus" :disabled="isToggling" class="btn-primary"
              :class="{ 'btn-danger': userToToggle.status === 'ACTIVE' }">
              <span>{{ isToggling ? t('common.updating') : (userToToggle.status === 'ACTIVE' ? t('users.suspend') :
                t('users.activate')) }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.users-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-top-bar h1 {
  font-size: 1.6rem;
}

.subtitle {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin-top: 0.2rem;
}

.admin-shield-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.25);
  color: var(--primary);
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.4rem 0.85rem;
  border-radius: var(--radius-sm);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.stat-card {
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-dim);
  text-transform: uppercase;
}

.stat-value {
  font-size: 1.4rem;
  font-weight: 700;
}

.stat-subtext {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.table-shell {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-controls {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.select-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.filter-icon {
  position: absolute;
  left: 0.65rem;
  color: var(--text-dim);
  pointer-events: none;
}

.filter-select {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  color: var(--text-main);
  font-size: 0.825rem;
  padding: 0.45rem 0.85rem 0.45rem 1.8rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.filter-select:hover {
  border-color: var(--border-default);
  background: var(--bg-surface-hover);
}

.filter-select:focus {
  outline: none;
  border-color: var(--border-focus);
}

.search-wrap {
  position: relative;
  width: 100%;
  max-width: 320px;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-dim);
}

.table-search-input {
  width: 100%;
  background: var(--bg-input);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  padding: 0.45rem 0.75rem 0.45rem 2.2rem;
  color: var(--text-main);
  font-size: 0.85rem;
}

.table-search-input:focus {
  outline: none;
  border-color: var(--border-focus);
}

.user-cell {
  display: flex;
  flex-direction: column;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.725rem;
  font-weight: 500;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-sm);
  text-transform: capitalize;
}

.status-pill.active {
  background: var(--accent-emerald-subtle);
  color: var(--color-emerald-accent);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.status-pill.suspended {
  background: var(--accent-rose-subtle);
  color: var(--color-rose-accent);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.status-pill .dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}

.btn-sm {
  padding: 0.35rem 0.65rem;
  font-size: 0.8rem;
  gap: 0.3rem;
}

.btn-suspend:hover {
  border-color: rgba(239, 68, 68, 0.4);
  color: #f87171;
}

.btn-activate:hover {
  border-color: rgba(52, 211, 153, 0.4);
  color: #34d399;
}

.btn-danger {
  background-color: var(--accent-rose);
}

.btn-danger:hover {
  background-color: #dc2626;
}

.text-right {
  text-align: right;
}

.text-danger {
  color: #f87171;
}

.text-amber {
  color: #fbbf24;
}

.text-dim {
  color: var(--text-dim);
}

.text-xs {
  font-size: 0.75rem;
}

.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.font-semibold {
  font-weight: 600;
}

.italic {
  font-style: italic;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1.5rem;
}

.modal-card {
  width: 100%;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 0.75rem;
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

/* Empty & Loading */
.empty-state {
  text-align: center;
  padding: 3.5rem 1rem;
  color: var(--text-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.empty-icon {
  color: var(--text-dim);
  margin-bottom: 0.5rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 1rem;
  color: var(--text-muted);
}

.loading-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--border-subtle);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
