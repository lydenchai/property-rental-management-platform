<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { 
  Users, 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  Building, 
  Filter,
  Clock
} from '@lucide/vue';
import { useAuth } from '../../../composables/useAuth';
import type { ApiResponse } from '../../../../shared/types/api';
import AppTableCard from '../../../components/common/AppTableCard.vue';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  title: 'User Management',
});

const { isAdmin } = useAuth();

interface UserAccount {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: string;
  status: string;
  emailVerifiedAt: string | null;
  createdAt: string;
}

const users = ref<UserAccount[]>([]);
const isLoading = ref(true);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);

// Filters
const roleFilter = ref('ALL');
const statusFilter = ref('ALL');
const searchQuery = ref('');

// Status change modal
const userToToggle = ref<UserAccount | null>(null);
const isToggling = ref(false);

async function loadUsers() {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    const res = await $fetch<ApiResponse<{ users: UserAccount[] }>>('/api/v1/admin/users');
    if (res.success && res.data) {
      users.value = res.data.users;
    } else {
      errorMessage.value = res.error?.message || 'Failed to load users';
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.error?.message || err?.message || 'Error loading user accounts';
  } finally {
    isLoading.value = false;
  }
}

// Metrics
const totalUsers = computed(() => users.value.length);
const adminCount = computed(() => users.value.filter((u) => u.role === 'ADMIN').length);
const landlordCount = computed(() => users.value.filter((u) => u.role === 'LANDLORD').length);
const tenantCount = computed(() => users.value.filter((u) => u.role === 'TENANT').length);
const techCount = computed(() => users.value.filter((u) => u.role === 'TECHNICIAN').length);
const suspendedCount = computed(() => users.value.filter((u) => u.status === 'SUSPENDED').length);

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
  isToggling.value = true;
  errorMessage.value = null;

  const newStatus = userToToggle.value.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
  try {
    const res = await $fetch<ApiResponse<{ user: UserAccount; message: string }>>(`/api/v1/admin/users/${userToToggle.value.id}/status`, {
      method: 'PATCH',
      body: { status: newStatus },
    });

    if (res.success) {
      successMessage.value = res.data?.message || 'User status updated successfully';
      userToToggle.value = null;
      await loadUsers();
      setTimeout(() => {
        successMessage.value = null;
      }, 4000);
    } else {
      errorMessage.value = res.error?.message || 'Failed to update user status';
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.error?.message || err?.message || 'Error updating user status';
  } finally {
    isToggling.value = false;
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
        <h1>User Account Governance</h1>
        <p class="subtitle">
          Supervise registered platform accounts, role classifications, authorization statuses, and account suspension.
        </p>
      </div>
      <div class="admin-shield-badge">
        <Users :size="15" />
        <span>{{ totalUsers }} Total Accounts</span>
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
        <span class="stat-label">Landlords</span>
        <div class="stat-value font-mono">{{ landlordCount }}</div>
        <div class="stat-subtext">Property managers</div>
      </div>
      <div class="stat-card card-flat">
        <span class="stat-label">Tenants</span>
        <div class="stat-value font-mono">{{ tenantCount }}</div>
        <div class="stat-subtext">Resident occupants</div>
      </div>
      <div class="stat-card card-flat">
        <span class="stat-label">Technicians</span>
        <div class="stat-value font-mono">{{ techCount }}</div>
        <div class="stat-subtext">Maintenance specialists</div>
      </div>
      <div class="stat-card card-flat">
        <span class="stat-label">Suspended</span>
        <div class="stat-value font-mono" :class="{ 'text-danger': suspendedCount > 0 }">
          {{ suspendedCount }}
        </div>
        <div class="stat-subtext">Access restricted</div>
      </div>
    </div>

    <!-- Users Table using shared AppTableCard -->
    <AppTableCard
      v-model:search="searchQuery"
      search-placeholder="Search by name, email, or role..."
      :is-loading="isLoading"
      :is-empty="filteredUsers.length === 0"
      empty-title="No user accounts found"
      empty-description="Users matching the specified filters will appear in this registry."
      :empty-icon="Users"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total-items="filteredUsers.length"
      item-name="users"
    >
      <template #toolbar-start>
        <div class="filter-controls">
          <div class="select-wrap">
            <Filter :size="13" class="filter-icon" />
            <select v-model="roleFilter" class="filter-select">
              <option value="ALL">All Roles</option>
              <option value="ADMIN">System Admins</option>
              <option value="LANDLORD">Landlords</option>
              <option value="TENANT">Tenants</option>
              <option value="TECHNICIAN">Technicians</option>
            </select>
          </div>

          <div class="select-wrap">
            <select v-model="statusFilter" class="filter-select">
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>
      </template>

      <table class="data-table">
          <thead>
            <tr>
              <th>User Name & Email</th>
              <th>Phone</th>
              <th>Assigned Role</th>
              <th>Account Status</th>
              <th>Registered At</th>
              <th class="text-right">Governance Actions</th>
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
                <span
                  class="badge"
                  :class="{
                    'badge-admin': u.role === 'ADMIN',
                    'badge-landlord': u.role === 'LANDLORD',
                    'badge-tenant': u.role === 'TENANT',
                    'badge-technician': u.role === 'TECHNICIAN',
                  }"
                >
                  {{ u.role }}
                </span>
              </td>
              <td>
                <span
                  class="status-pill"
                  :class="{
                    active: u.status === 'ACTIVE',
                    suspended: u.status === 'SUSPENDED',
                  }"
                >
                  <span class="dot"></span>
                  <span>{{ u.status }}</span>
                </span>
              </td>
              <td>
                <span class="text-xs text-dim">{{ new Date(u.createdAt).toLocaleDateString() }}</span>
              </td>
              <td class="text-right">
                <button
                  v-if="u.role !== 'ADMIN'"
                  @click="userToToggle = u"
                  class="btn-secondary btn-sm"
                  :class="{ 'btn-suspend': u.status === 'ACTIVE', 'btn-activate': u.status === 'SUSPENDED' }"
                >
                  <component :is="u.status === 'ACTIVE' ? UserX : UserCheck" :size="13" />
                  <span>{{ u.status === 'ACTIVE' ? 'Suspend' : 'Activate' }}</span>
                </button>
                <span v-else class="text-xs text-dim italic">Protected</span>
              </td>
            </tr>
          </tbody>
      </table>
    </AppTableCard>

    <!-- Toggle Status Modal -->
    <div v-if="userToToggle" class="modal-backdrop">
      <div class="modal-card card-flat" style="max-width: 480px;">
        <div class="modal-header">
          <h3>Confirm Status Change</h3>
          <button @click="userToToggle = null" class="modal-close">&times;</button>
        </div>

        <div class="modal-body">
          <p>
            Are you sure you want to change the status of <strong>{{ userToToggle.fullName }}</strong> ({{ userToToggle.email }}) from
            <span class="font-semibold">{{ userToToggle.status }}</span> to
            <span class="font-semibold text-amber">{{ userToToggle.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' }}</span>?
          </p>

          <p v-if="userToToggle.status === 'ACTIVE'" class="text-xs text-dim">
            Suspending this account will immediately revoke authentication access and terminate active sessions.
          </p>
          <p v-else class="text-xs text-dim">
            Activating this account will restore standard sign-in and platform access rights.
          </p>

          <div class="modal-actions">
            <button type="button" @click="userToToggle = null" class="btn-secondary">
              Cancel
            </button>
            <button
              @click="executeToggleStatus"
              :disabled="isToggling"
              class="btn-primary"
              :class="{ 'btn-danger': userToToggle.status === 'ACTIVE' }"
            >
              <span>{{ isToggling ? 'Updating...' : `Confirm ${userToToggle.status === 'ACTIVE' ? 'Suspension' : 'Activation'}` }}</span>
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
  background: var(--bg-input);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  color: var(--text-main);
  font-size: 0.8rem;
  padding: 0.45rem 0.75rem 0.45rem 1.8rem;
  cursor: pointer;
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
  to { transform: rotate(360deg); }
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
