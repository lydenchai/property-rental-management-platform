import { reactive, toRefs, toRef, computed } from 'vue';
import type {
  MaintenanceItem,
  CreateMaintenanceInput,
  AssignTechnicianInput,
  UpdateProgressInput,
  ConfirmResolutionInput,
} from '~~/shared/types';

export function useMaintenanceStore() {
  const state = reactive({
    requests: [] as MaintenanceItem[],
    selectedTicket: null as MaintenanceItem | null,
    isLoading: false,
    isSubmitting: false,
    isUpdatingStatus: false,
    error: null as any,
  });

  // Computed summary metrics
  const totalCount = computed(() => state.requests.length);
  const openCount = computed(
    () =>
      state.requests.filter(
        (r) => r.status === 'REPORTED' || r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS'
      ).length
  );
  const inProgressCount = computed(
    () => state.requests.filter((r) => r.status === 'IN_PROGRESS' || r.status === 'ASSIGNED').length
  );
  const awaitingConfirmCount = computed(
    () => state.requests.filter((r) => r.status === 'RESOLVED').length
  );
  const closedCount = computed(() => state.requests.filter((r) => r.status === 'CONFIRMED').length);
  const urgentCount = computed(
    () =>
      state.requests.filter(
        (r) => r.priority === 'URGENT' && r.status !== 'RESOLVED' && r.status !== 'CONFIRMED'
      ).length
  );
  const resolvedCount = computed(
    () => state.requests.filter((r) => r.status === 'RESOLVED' || r.status === 'CONFIRMED').length
  );

  async function fetchMaintenanceRequests(
    filter: { unitId?: string; tenantId?: string; status?: string; priority?: string } = {}
  ) {
    state.isLoading = true;
    state.error = null;

    try {
      const queryParams: Record<string, any> = {};
      if (filter.unitId) queryParams.unitId = filter.unitId;
      if (filter.tenantId) queryParams.tenantId = filter.tenantId;
      if (filter.status) queryParams.status = filter.status;
      if (filter.priority) queryParams.priority = filter.priority;

      const { data, error }: any = await useFetch('/api/v1/maintenance', {
        query: queryParams,
      });

      if (data.value) {
        state.requests = data.value.data?.requests || data.value.data || [];
        return state.requests;
      } else {
        throw error.value || new Error('Failed to fetch maintenance requests');
      }
    } catch (err: any) {
      state.error =
        err?.data?.error?.message || err?.message || 'Failed to fetch maintenance requests';
      return [];
    } finally {
      state.isLoading = false;
    }
  }

  async function fetchMaintenanceById(id: string) {
    state.isLoading = true;
    state.error = null;

    try {
      const { data, error }: any = await useFetch(`/api/v1/maintenance/${id}`);

      if (data.value) {
        state.selectedTicket = data.value.data?.ticket || data.value.data;
        return state.selectedTicket;
      } else {
        throw error.value || new Error('Failed to fetch maintenance ticket');
      }
    } catch (err: any) {
      state.error =
        err?.data?.error?.message || err?.message || 'Failed to fetch maintenance ticket';
      throw err;
    } finally {
      state.isLoading = false;
    }
  }

  async function createMaintenanceRequest(input: CreateMaintenanceInput) {
    state.isSubmitting = true;
    state.error = null;

    try {
      const { data, error }: any = await useFetch('/api/v1/maintenance', {
        method: 'POST',
        body: input,
      });

      if (data.value) {
        const ticket = data.value.data?.ticket || data.value.data;
        if (ticket) {
          state.requests.unshift(ticket);
        }
        return { success: true, ticket, data: data.value.data };
      } else {
        throw error.value || new Error('Failed to submit maintenance request');
      }
    } catch (err: any) {
      state.error =
        err?.data?.error?.message || err?.message || 'Failed to submit maintenance request';
      return { success: false, error: state.error };
    } finally {
      state.isSubmitting = false;
    }
  }

  async function assignTechnician(id: string, input: AssignTechnicianInput) {
    state.isUpdatingStatus = true;
    state.error = null;

    try {
      const { data, error }: any = await useFetch(`/api/v1/maintenance/${id}/assign`, {
        method: 'POST',
        body: input,
      });

      if (data.value) {
        const updated = data.value.data?.ticket || data.value.data;
        const idx = state.requests.findIndex((r) => r.id === id);
        if (idx !== -1 && updated) {
          state.requests[idx] = { ...state.requests[idx], ...updated };
        }
        if (state.selectedTicket?.id === id && updated) {
          state.selectedTicket = { ...state.selectedTicket, ...updated };
        }
        return { success: true, ticket: updated, data: data.value.data };
      } else {
        throw error.value || new Error('Failed to assign technician');
      }
    } catch (err: any) {
      state.error = err?.data?.error?.message || err?.message || 'Failed to assign technician';
      return { success: false, error: state.error };
    } finally {
      state.isUpdatingStatus = false;
    }
  }

  async function updateProgress(id: string, input: UpdateProgressInput) {
    state.isUpdatingStatus = true;
    state.error = null;

    try {
      const { data, error }: any = await useFetch(`/api/v1/maintenance/${id}/progress`, {
        method: 'POST',
        body: input,
      });

      if (data.value) {
        const updated = data.value.data?.ticket || data.value.data;
        const idx = state.requests.findIndex((r) => r.id === id);
        if (idx !== -1 && updated) {
          state.requests[idx] = { ...state.requests[idx], ...updated };
        }
        if (state.selectedTicket?.id === id && updated) {
          state.selectedTicket = { ...state.selectedTicket, ...updated };
        }
        return { success: true, ticket: updated, data: data.value.data };
      } else {
        throw error.value || new Error('Failed to update progress');
      }
    } catch (err: any) {
      state.error = err?.data?.error?.message || err?.message || 'Failed to update progress';
      return { success: false, error: state.error };
    } finally {
      state.isUpdatingStatus = false;
    }
  }

  async function confirmResolution(id: string, input: ConfirmResolutionInput) {
    state.isUpdatingStatus = true;
    state.error = null;

    try {
      const { data, error }: any = await useFetch(`/api/v1/maintenance/${id}/confirm`, {
        method: 'POST',
        body: input,
      });

      if (data.value) {
        const updated = data.value.data?.ticket || data.value.data;
        const idx = state.requests.findIndex((r) => r.id === id);
        if (idx !== -1 && updated) {
          state.requests[idx] = { ...state.requests[idx], ...updated };
        }
        if (state.selectedTicket?.id === id && updated) {
          state.selectedTicket = { ...state.selectedTicket, ...updated };
        }
        return { success: true, ticket: updated, data: data.value.data };
      } else {
        throw error.value || new Error('Failed to confirm resolution');
      }
    } catch (err: any) {
      state.error = err?.data?.error?.message || err?.message || 'Failed to confirm resolution';
      return { success: false, error: state.error };
    } finally {
      state.isUpdatingStatus = false;
    }
  }

  function clearError() {
    state.error = null;
  }

  const isAssigning = toRef(state, 'isUpdatingStatus');
  const isUpdating = toRef(state, 'isUpdatingStatus');
  const isConfirming = toRef(state, 'isUpdatingStatus');

  return {
    state,
    ...toRefs(state),
    errorMessage: toRef(state, 'error'),
    isAssigning,
    isUpdating,
    isConfirming,
    totalCount,
    openCount,
    inProgressCount,
    awaitingConfirmCount,
    closedCount,
    urgentCount,
    resolvedCount,
    fetchMaintenanceRequests,
    fetchRequests: fetchMaintenanceRequests,
    loadRequests: fetchMaintenanceRequests,
    fetchMaintenanceById,
    createMaintenanceRequest,
    createTicket: createMaintenanceRequest,
    assignTechnician,
    updateProgress,
    confirmResolution,
    clearError,
  };
}
