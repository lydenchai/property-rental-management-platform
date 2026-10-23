import { reactive, toRefs, toRef, computed } from 'vue';
import type { 
  OccupancyReportData, 
  FinancialReportData 
} from '~~/shared/types';

export function useReportStore() {
  const state = reactive({
    occupancyData: null as OccupancyReportData | null,
    financialData: null as FinancialReportData | null,
    isLoading: false,
    error: null as any,
  });

  // Computed properties
  const occupancyRate = computed(() => state.occupancyData?.occupancyRate ?? 0);
  const totalRevenue = computed(() => state.financialData?.totalCollected ?? 0);
  const collectionRate = computed(() => state.financialData?.collectionRate ?? 0);
  const outstandingBalance = computed(() => state.financialData?.outstandingBalance ?? 0);
  const hasData = computed(() => !!(state.occupancyData || state.financialData));

  async function fetchOccupancy() {
    try {
      const { data, error }: any = await useFetch('/api/v1/reports/occupancy');

      if (data.value) {
        state.occupancyData = data.value.data?.report || data.value.data;
        return state.occupancyData;
      } else {
        throw error.value || new Error('Failed to fetch occupancy report');
      }
    } catch (err: any) {
      throw err;
    }
  }

  async function fetchFinancials() {
    try {
      const { data, error }: any = await useFetch('/api/v1/reports/financials');

      if (data.value) {
        state.financialData = data.value.data?.report || data.value.data;
        return state.financialData;
      } else {
        throw error.value || new Error('Failed to fetch financial report');
      }
    } catch (err: any) {
      throw err;
    }
  }

  async function fetchReports() {
    state.isLoading = true;
    state.error = null;

    try {
      await Promise.all([
        fetchOccupancy(),
        fetchFinancials(),
      ]);
      return {
        success: true,
        occupancy: state.occupancyData,
        financials: state.financialData,
      };
    } catch (err: any) {
      state.error = err?.data?.error?.message || err?.message || 'Failed to load report analytics';
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
    occupancyRate,
    totalRevenue,
    collectionRate,
    outstandingBalance,
    hasData,
    fetchReports,
    fetchOccupancy,
    fetchFinancials,
    clearError,
  };
}
