import { reactive, toRefs, toRef, computed } from 'vue';
import type { AuditLogItem, AuditLogFilterParams } from '~~/shared/types';

export function useAuditLogStore() {
  const state = reactive({
    logs: [] as AuditLogItem[],
    selectedLog: null as AuditLogItem | null,
    isLoading: false,
    error: null as any,
  });

  // Computed summary metrics
  const totalLogs = computed(() => state.logs.length);

  async function fetchLogs(filter: AuditLogFilterParams = {}) {
    state.isLoading = true;
    state.error = null;

    try {
      const queryParams: Record<string, any> = {};
      if (filter.action) queryParams.action = filter.action;
      if (filter.entityType) queryParams.entityType = filter.entityType;
      if (filter.search) queryParams.search = filter.search;

      const { data, error }: any = await useFetch('/api/v1/admin/audit-logs', {
        query: queryParams,
      });

      if (data.value) {
        state.logs = data.value.data?.logs || data.value.data || [];
        return state.logs;
      } else {
        throw error.value || new Error('Failed to fetch audit log history');
      }
    } catch (err: any) {
      state.error = err?.data?.error?.message || err?.message || 'Failed to fetch audit log history';
      return [];
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
    totalLogs,
    fetchLogs,
    fetchAuditLogs: fetchLogs,
    loadAuditLogs: fetchLogs,
    clearError,
  };
}
