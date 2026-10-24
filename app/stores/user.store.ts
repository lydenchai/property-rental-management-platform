import { reactive, toRefs, toRef, computed } from 'vue';
import type { UserAccount, UpdateUserStatusInput } from '~~/shared/types';

export function useUserStore() {
  const state = reactive({
    users: [] as UserAccount[],
    selectedUser: null as UserAccount | null,
    isLoading: false,
    isToggling: false,
    error: null as any,
  });

  // Computed summary metrics
  const totalUsers = computed(() => state.users.length);
  const adminCount = computed(() => state.users.filter((u) => u.role === 'ADMIN').length);
  const landlordCount = computed(() => state.users.filter((u) => u.role === 'LANDLORD').length);
  const tenantCount = computed(() => state.users.filter((u) => u.role === 'TENANT').length);
  const technicianCount = computed(() => state.users.filter((u) => u.role === 'TECHNICIAN').length);

  const activeUsersCount = computed(() => state.users.filter((u) => u.status === 'ACTIVE').length);
  const suspendedUsersCount = computed(() => state.users.filter((u) => u.status === 'SUSPENDED').length);

  async function fetchUsers(filter: { role?: string; status?: string; search?: string } = {}) {
    state.isLoading = true;
    state.error = null;

    try {
      const queryParams: Record<string, any> = {};
      if (filter.role) queryParams.role = filter.role;
      if (filter.status) queryParams.status = filter.status;
      if (filter.search) queryParams.search = filter.search;

      const { data, error }: any = await useFetch('/api/v1/admin/users', {
        query: queryParams,
      });

      if (data.value) {
        state.users = data.value.data?.users || data.value.data || [];
        return state.users;
      } else {
        throw error.value || new Error('Failed to fetch user directory');
      }
    } catch (err: any) {
      state.error = err?.data?.error?.message || err?.message || 'Failed to fetch user directory';
      return [];
    } finally {
      state.isLoading = false;
    }
  }

  async function updateUserStatus(id: string, input: UpdateUserStatusInput) {
    state.isToggling = true;
    state.error = null;

    try {
      const { data, error }: any = await useFetch(`/api/v1/admin/users/${id}/status`, {
        method: 'PATCH',
        body: input,
      });

      if (data.value) {
        const updated = data.value.data?.user || data.value.data;
        const idx = state.users.findIndex((u) => u.id === id);
        if (idx !== -1 && updated) {
          state.users[idx] = { ...state.users[idx], ...updated };
        }
        if (state.selectedUser?.id === id && updated) {
          state.selectedUser = { ...state.selectedUser, ...updated };
        }
        return { success: true, user: updated, data: data.value.data };
      } else {
        throw error.value || new Error('Failed to update user status');
      }
    } catch (err: any) {
      state.error = err?.data?.error?.message || err?.message || 'Failed to update user status';
      return { success: false, error: state.error };
    } finally {
      state.isToggling = false;
    }
  }

  function clearError() {
    state.error = null;
  }

  return {
    state,
    ...toRefs(state),
    errorMessage: toRef(state, 'error'),
    totalUsers,
    adminCount,
    landlordCount,
    tenantCount,
    technicianCount,
    techCount: technicianCount,
    activeUsersCount,
    suspendedUsersCount,
    suspendedCount: suspendedUsersCount,
    fetchUsers,
    loadUsers: fetchUsers,
    updateUserStatus,
    clearError,
  };
}
