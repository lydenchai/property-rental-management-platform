import { reactive, toRefs, toRef, computed } from 'vue';
import type { ApplicationItem, ReviewApplicationInput } from '~~/shared/types';

export function useApplicationStore() {
  const state = reactive({
    applications: [] as ApplicationItem[],
    selectedApplication: null as ApplicationItem | null,
    isLoading: false,
    isSubmittingReview: false,
    error: null as any,
  });

  // Computed metrics
  const totalCount = computed(() => state.applications.length);
  const pendingCount = computed(() => state.applications.filter((a) => a.status === 'PENDING').length);
  const approvedCount = computed(() => state.applications.filter((a) => a.status === 'APPROVED').length);
  const rejectedCount = computed(() => state.applications.filter((a) => a.status === 'REJECTED').length);

  async function fetchApplications(filter: { unitId?: string; tenantId?: string; status?: string } = {}) {
    state.isLoading = true;
    state.error = null;

    try {
      const queryParams: Record<string, any> = {};
      if (filter.unitId) queryParams.unitId = filter.unitId;
      if (filter.tenantId) queryParams.tenantId = filter.tenantId;
      if (filter.status) queryParams.status = filter.status;

      const { data, error }: any = await useFetch('/api/v1/applications', {
        query: queryParams,
      });

      if (data.value) {
        state.applications = data.value.data?.applications || data.value.data || [];
        return state.applications;
      } else {
        throw error.value || new Error('Failed to fetch applications');
      }
    } catch (err: any) {
      state.error = err?.data?.error?.message || err?.message || 'Failed to fetch applications';
      throw err;
    } finally {
      state.isLoading = false;
    }
  }

  async function fetchApplicationById(id: string) {
    state.isLoading = true;
    state.error = null;

    try {
      const { data, error }: any = await useFetch(`/api/v1/applications/${id}`);

      if (data.value) {
        state.selectedApplication = data.value.data?.application || data.value.data;
        return state.selectedApplication;
      } else {
        throw error.value || new Error('Failed to fetch application details');
      }
    } catch (err: any) {
      state.error = err?.data?.error?.message || err?.message || 'Failed to fetch application details';
      throw err;
    } finally {
      state.isLoading = false;
    }
  }

  async function reviewApplication(id: string, input: ReviewApplicationInput) {
    state.isSubmittingReview = true;
    state.error = null;

    try {
      const { data, error }: any = await useFetch(`/api/v1/applications/${id}/review`, {
        method: 'POST',
        body: input,
      });

      if (data.value) {
        const app = data.value.data?.application || data.value.data;
        const idx = state.applications.findIndex((a) => a.id === id);
        if (idx !== -1 && app) {
          state.applications[idx] = { ...state.applications[idx], ...app };
        }
        if (state.selectedApplication?.id === id && app) {
          state.selectedApplication = { ...state.selectedApplication, ...app };
        }
        return { success: true, application: app, data: data.value.data };
      } else {
        throw error.value || new Error('Failed to review application');
      }
    } catch (err: any) {
      state.error = err?.data?.error?.message || err?.message || 'Failed to review application';
      return { success: false, error: state.error };
    } finally {
      state.isSubmittingReview = false;
    }
  }

  function clearError() {
    state.error = null;
  }

  return {
    state,
    ...toRefs(state),
    errorMessage: toRef(state, 'error'),
    totalCount,
    pendingCount,
    approvedCount,
    rejectedCount,
    fetchApplications,
    loadApplications: fetchApplications,
    fetchApplicationById,
    reviewApplication,
    clearError,
  };
}
