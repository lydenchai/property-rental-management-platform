import { reactive, toRefs, toRef } from 'vue';
import type { DashboardMetrics } from '~~/shared/types';

export function useDashboardStore() {
  const state = reactive({
    metrics: null as DashboardMetrics | null,
    isLoading: false,
    error: null as any,
  });

  async function fetchMetrics() {
    state.isLoading = true;
    state.error = null;

    try {
      const { data, error }: any = await useFetch('/api/v1/dashboard/metrics');

      if (data.value) {
        state.metrics = data.value.data?.metrics || data.value.data;
        return state.metrics;
      } else {
        throw error.value || new Error('Failed to load metrics');
      }
    } catch (err: any) {
      state.error = err?.data?.error?.message || err?.message || 'Failed to load metrics';
      throw err;
    } finally {
      state.isLoading = false;
    }
  }

  function clearError() {
    state.error = null;
  }

  return {
    state,
    ...toRefs(state),
    errorMessage: toRef(state, 'error'),
    fetchMetrics,
    clearError,
  };
}
