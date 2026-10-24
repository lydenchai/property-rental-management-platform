import { reactive, toRefs, toRef, computed } from 'vue';
import type { LeaseItem, CreateLeaseInput, SignLeaseInput } from '~~/shared/types';

export function useLeaseStore() {
  const state = reactive({
    leases: [] as LeaseItem[],
    selectedLease: null as LeaseItem | null,
    isLoading: false,
    isCreatingLease: false,
    isSigning: false,
    isTerminating: false,
    error: null as any,
  });

  // Computed summary metrics
  const totalLeases = computed(() => state.leases.length);
  const activeLeasesCount = computed(() => state.leases.filter((l) => l.status === 'ACTIVE').length);
  const pendingLeasesCount = computed(() => 
    state.leases.filter((l) => l.status === 'PENDING_SIGNATURES' || l.status === 'DRAFT').length
  );
  const terminatedLeasesCount = computed(() => 
    state.leases.filter((l) => l.status === 'TERMINATED' || l.status === 'EXPIRED').length
  );

  const monthlyRentRoll = computed(() => 
    state.leases
      .filter((l) => l.status === 'ACTIVE')
      .reduce((sum, l) => sum + (Number(l.rentAmount) || 0), 0)
  );

  async function fetchLeases(filter: { tenantId?: string; landlordId?: string; status?: string } = {}) {
    state.isLoading = true;
    state.error = null;

    try {
      const queryParams: Record<string, any> = {};
      if (filter.tenantId) queryParams.tenantId = filter.tenantId;
      if (filter.landlordId) queryParams.landlordId = filter.landlordId;
      if (filter.status) queryParams.status = filter.status;

      const { data, error }: any = await useFetch('/api/v1/leases', {
        query: queryParams,
      });

      if (data.value) {
        state.leases = data.value.data?.leases || data.value.data || [];
        return state.leases;
      } else {
        throw error.value || new Error('Failed to fetch leases');
      }
    } catch (err: any) {
      state.error = err?.data?.error?.message || err?.message || 'Failed to fetch leases';
      return [];
    } finally {
      state.isLoading = false;
    }
  }

  async function fetchLeaseById(id: string) {
    state.isLoading = true;
    state.error = null;

    try {
      const { data, error }: any = await useFetch(`/api/v1/leases/${id}`);

      if (data.value) {
        state.selectedLease = data.value.data?.lease || data.value.data;
        return state.selectedLease;
      } else {
        throw error.value || new Error('Failed to fetch lease details');
      }
    } catch (err: any) {
      state.error = err?.data?.error?.message || err?.message || 'Failed to fetch lease details';
      throw err;
    } finally {
      state.isLoading = false;
    }
  }

  async function createLease(input: CreateLeaseInput) {
    state.isCreatingLease = true;
    state.error = null;

    try {
      const { data, error }: any = await useFetch('/api/v1/leases', {
        method: 'POST',
        body: input,
      });

      if (data.value) {
        const lease = data.value.data?.lease || data.value.data;
        if (lease) {
          state.leases.unshift(lease);
        }
        return { success: true, lease, data: data.value.data };
      } else {
        throw error.value || new Error('Failed to create lease');
      }
    } catch (err: any) {
      state.error = err?.data?.error?.message || err?.message || 'Failed to create lease';
      return { success: false, error: state.error };
    } finally {
      state.isCreatingLease = false;
    }
  }

  async function signLease(id: string, input: SignLeaseInput = { agreeToTerms: true }) {
    state.isSigning = true;
    state.error = null;

    try {
      const { data, error }: any = await useFetch(`/api/v1/leases/${id}/sign`, {
        method: 'POST',
        body: input,
      });

      if (data.value) {
        const updated = data.value.data?.lease || data.value.data;
        const idx = state.leases.findIndex((l) => l.id === id);
        if (idx !== -1 && updated) {
          state.leases[idx] = { ...state.leases[idx], ...updated };
        }
        if (state.selectedLease?.id === id && updated) {
          state.selectedLease = { ...state.selectedLease, ...updated };
        }
        return { success: true, lease: updated, data: data.value.data };
      } else {
        throw error.value || new Error('Failed to sign lease agreement');
      }
    } catch (err: any) {
      state.error = err?.data?.error?.message || err?.message || 'Failed to sign lease agreement';
      return { success: false, error: state.error };
    } finally {
      state.isSigning = false;
    }
  }

  async function terminateLease(id: string, reason?: string) {
    state.isTerminating = true;
    state.error = null;

    try {
      const { data, error }: any = await useFetch(`/api/v1/leases/${id}/terminate`, {
        method: 'POST',
        body: { reason },
      });

      if (data.value) {
        const updated = data.value.data?.lease || data.value.data;
        const idx = state.leases.findIndex((l) => l.id === id);
        if (idx !== -1 && updated) {
          state.leases[idx] = { ...state.leases[idx], ...updated };
        }
        if (state.selectedLease?.id === id && updated) {
          state.selectedLease = { ...state.selectedLease, ...updated };
        }
        return { success: true, lease: updated, data: data.value.data };
      } else {
        throw error.value || new Error('Failed to terminate lease');
      }
    } catch (err: any) {
      state.error = err?.data?.error?.message || err?.message || 'Failed to terminate lease';
      return { success: false, error: state.error };
    } finally {
      state.isTerminating = false;
    }
  }

  function clearError() {
    state.error = null;
  }

  return {
    state,
    ...toRefs(state),
    errorMessage: toRef(state, 'error'),
    totalLeases,
    activeLeasesCount,
    pendingLeasesCount,
    terminatedLeasesCount,
    activeLeases: activeLeasesCount,
    pendingLeases: pendingLeasesCount,
    terminatedLeases: terminatedLeasesCount,
    monthlyRentRoll,
    fetchLeases,
    loadLeases: fetchLeases,
    fetchLeaseById,
    createLease,
    signLease,
    terminateLease,
    clearError,
  };
}
