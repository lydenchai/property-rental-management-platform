<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { Users, UserCheck, UserX, AlertCircle, CheckCircle2, Filter } from '@lucide/vue';
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

const { fetchUsers, loadUsers, updateUserStatus } = userStore;

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
  const res = (await updateUserStatus(userToToggle.value.id, newStatus)) as any;

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
  <div class="space-y-6">
    <!-- Top Bar -->
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {{ t('users.title') }}
        </h1>
        <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {{ t('users.subtitle') }}
        </p>
      </div>
      <div
        class="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400"
      >
        <Users :size="16" />
        <span>{{ totalUsers }} {{ t('users.total_accounts') }}</span>
      </div>
    </div>

    <!-- Alert Messages -->
    <div
      v-if="successMessage"
      class="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300"
    >
      <CheckCircle2 :size="18" class="shrink-0 text-emerald-600 dark:text-emerald-400" />
      <span>{{ successMessage }}</span>
    </div>

    <div
      v-if="errorMessage"
      class="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300"
    >
      <AlertCircle :size="18" class="shrink-0 text-rose-600 dark:text-rose-400" />
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div
        class="shadow-xs flex flex-col gap-1 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <span
          class="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
          >{{ t('users.landlords_card') }}</span
        >
        <div class="font-mono text-2xl font-bold text-neutral-900 dark:text-white">
          {{ landlordCount }}
        </div>
        <div class="text-xs text-neutral-500 dark:text-neutral-400">
          {{ t('users.landlords_sub') }}
        </div>
      </div>
      <div
        class="shadow-xs flex flex-col gap-1 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <span
          class="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
          >{{ t('users.tenants_card') }}</span
        >
        <div class="font-mono text-2xl font-bold text-neutral-900 dark:text-white">
          {{ tenantCount }}
        </div>
        <div class="text-xs text-neutral-500 dark:text-neutral-400">
          {{ t('users.tenants_sub') }}
        </div>
      </div>
      <div
        class="shadow-xs flex flex-col gap-1 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <span
          class="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
          >{{ t('users.technicians_card') }}</span
        >
        <div class="font-mono text-2xl font-bold text-neutral-900 dark:text-white">
          {{ techCount }}
        </div>
        <div class="text-xs text-neutral-500 dark:text-neutral-400">
          {{ t('users.technicians_sub') }}
        </div>
      </div>
      <div
        class="shadow-xs flex flex-col gap-1 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <span
          class="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
          >{{ t('users.suspended_card') }}</span
        >
        <div
          :class="[
            'font-mono text-2xl font-bold',
            suspendedCount > 0
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-neutral-900 dark:text-white',
          ]"
        >
          {{ suspendedCount }}
        </div>
        <div class="text-xs text-neutral-500 dark:text-neutral-400">
          {{ t('users.suspended_sub') }}
        </div>
      </div>
    </div>

    <!-- Users Table using shared AppTableCard -->
    <AppTableCard
      v-model:search="searchQuery"
      :search-placeholder="t('users.search_placeholder')"
      :is-loading="isLoading"
      :is-empty="filteredUsers.length === 0"
      :empty-title="t('users.no_users')"
      :empty-description="t('users.no_users_desc')"
      :empty-icon="Users"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total-items="filteredUsers.length"
      :item-name="t('common.records')"
    >
      <template #toolbar-start>
        <div class="flex flex-wrap items-center gap-2">
          <div class="relative">
            <select
              v-model="roleFilter"
              class="focus:outline-hidden rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-800 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            >
              <option value="ALL">{{ t('users.filter_all_roles') }}</option>
              <option value="ADMIN">{{ t('users.roles.admin') }}</option>
              <option value="LANDLORD">{{ t('users.roles.landlord') }}</option>
              <option value="TENANT">{{ t('users.roles.tenant') }}</option>
              <option value="TECHNICIAN">{{ t('users.roles.technician') }}</option>
            </select>
          </div>

          <div class="relative">
            <select
              v-model="statusFilter"
              class="focus:outline-hidden rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-800 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            >
              <option value="ALL">{{ t('users.filter_all_statuses') }}</option>
              <option value="ACTIVE">{{ t('common.active') }}</option>
              <option value="SUSPENDED">{{ t('common.suspended') }}</option>
            </select>
          </div>
        </div>
      </template>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-neutral-700 dark:text-neutral-200">
          <thead
            class="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-400"
          >
            <tr>
              <th class="px-4 py-3">{{ t('users.col_name_email') }}</th>
              <th class="px-4 py-3">{{ t('users.col_phone') }}</th>
              <th class="px-4 py-3">{{ t('users.col_role') }}</th>
              <th class="px-4 py-3">{{ t('users.col_status') }}</th>
              <th class="px-4 py-3">{{ t('users.col_registered') }}</th>
              <th class="px-4 py-3 text-right">{{ t('users.col_actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
            <tr
              v-for="u in paginatedUsers"
              :key="u.id"
              class="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
            >
              <td class="px-4 py-3.5">
                <div class="flex flex-col">
                  <span class="font-semibold text-neutral-900 dark:text-white">{{
                    u.fullName
                  }}</span>
                  <span class="font-mono text-xs text-neutral-500 dark:text-neutral-400">{{
                    u.email
                  }}</span>
                </div>
              </td>
              <td class="px-4 py-3.5 text-xs text-neutral-500 dark:text-neutral-400">
                {{ u.phone || 'N/A' }}
              </td>
              <td class="px-4 py-3.5">
                <span
                  :class="[
                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                    u.role === 'ADMIN'
                      ? 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950/30 dark:text-purple-400'
                      : u.role === 'LANDLORD'
                        ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400'
                        : u.role === 'TENANT'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                          : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400',
                  ]"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
                  <span>{{
                    u.role === 'ADMIN'
                      ? t('users.roles.admin')
                      : u.role === 'LANDLORD'
                        ? t('users.roles.landlord')
                        : u.role === 'TENANT'
                          ? t('users.roles.tenant')
                          : t('users.roles.technician')
                  }}</span>
                </span>
              </td>
              <td class="px-4 py-3.5">
                <span
                  :class="[
                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                    u.status === 'ACTIVE'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                      : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-400',
                  ]"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
                  <span>{{
                    u.status === 'ACTIVE' ? t('common.active') : t('common.suspended')
                  }}</span>
                </span>
              </td>
              <td class="px-4 py-3.5 text-xs text-neutral-500 dark:text-neutral-400">
                {{ new Date(u.createdAt).toLocaleDateString() }}
              </td>
              <td class="px-4 py-3.5 text-right">
                <button
                  v-if="u.role !== 'ADMIN'"
                  @click="userToToggle = u"
                  :class="[
                    'inline-flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors',
                    u.status === 'ACTIVE'
                      ? 'border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/30'
                      : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/30',
                  ]"
                >
                  <component :is="u.status === 'ACTIVE' ? UserX : UserCheck" :size="13" />
                  <span>{{
                    u.status === 'ACTIVE' ? t('users.suspend') : t('users.activate')
                  }}</span>
                </button>
                <span v-else class="text-xs italic text-neutral-400 dark:text-neutral-500">{{
                  t('users.protected')
                }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </AppTableCard>

    <!-- Toggle Status Modal -->
    <Teleport to="body">
      <div
        v-if="userToToggle"
        class="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      >
        <div
          class="w-full max-w-md overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800"
          >
            <h3 class="text-base font-semibold text-neutral-900 dark:text-white">
              {{ t('users.confirm_status_change') }}
            </h3>
            <button
              @click="userToToggle = null"
              class="cursor-pointer text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X :size="18" />
            </button>
          </div>

          <div class="space-y-4 p-6">
            <p class="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
              {{
                t('users.status_prompt', {
                  name: userToToggle.fullName,
                  email: userToToggle.email,
                  from: userToToggle.status,
                  to: userToToggle.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
                })
              }}
            </p>

            <p
              v-if="userToToggle.status === 'ACTIVE'"
              class="text-xs text-neutral-500 dark:text-neutral-400"
            >
              {{ t('users.suspend_warning') }}
            </p>
            <p v-else class="text-xs text-neutral-500 dark:text-neutral-400">
              {{ t('users.activate_warning') }}
            </p>

            <div class="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                @click="userToToggle = null"
                class="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                @click="executeToggleStatus"
                :disabled="isToggling"
                :class="[
                  'shadow-xs cursor-pointer rounded-lg px-4 py-2 text-xs font-medium text-white transition-colors disabled:opacity-50',
                  userToToggle.status === 'ACTIVE'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700',
                ]"
              >
                <span>{{
                  isToggling
                    ? t('common.updating')
                    : userToToggle.status === 'ACTIVE'
                      ? t('users.suspend')
                      : t('users.activate')
                }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
