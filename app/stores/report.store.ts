import { reactive, toRefs, toRef, computed } from 'vue';
import type { OccupancyReportData, FinancialReportData } from '~~/shared/types';

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
      await Promise.all([fetchOccupancy(), fetchFinancials()]);
      return {
        success: true,
        occupancy: state.occupancyData,
        financials: state.financialData,
      };
    } catch (err: any) {
      state.error = err?.data?.error?.message || err?.message || 'Failed to load report analytics';
      return { success: false, error: state.error };
    } finally {
      state.isLoading = false;
    }
  }

  function exportCSV(type: 'occupancy' | 'financials' = 'occupancy') {
    if (typeof window === 'undefined') return;

    let csvContent = '';
    let filename = '';

    if (type === 'occupancy') {
      filename = `occupancy-report-${new Date().toISOString().split('T')[0]}.csv`;
      const rows = [
        [
          'Property Title',
          'Address',
          'City',
          'Total Units',
          'Occupied Units',
          'Available Units',
          'Occupancy Rate (%)',
        ],
      ];

      if (state.occupancyData?.propertyBreakdown) {
        for (const item of state.occupancyData.propertyBreakdown) {
          rows.push([
            `"${item.title.replace(/"/g, '""')}"`,
            `"${item.address.replace(/"/g, '""')}"`,
            `"${item.city.replace(/"/g, '""')}"`,
            String(item.totalUnits),
            String(item.occupiedUnits),
            String(item.availableUnits),
            `${item.occupancyRate}%`,
          ]);
        }
      }

      csvContent = rows.map((r) => r.join(',')).join('\n');
    } else {
      filename = `financial-report-${new Date().toISOString().split('T')[0]}.csv`;
      const rows = [
        ['Metric', 'Value'],
        ['Total Invoiced', `$${state.financialData?.totalInvoiced ?? 0}`],
        ['Total Collected', `$${state.financialData?.totalCollected ?? 0}`],
        ['Outstanding Balance', `$${state.financialData?.outstandingBalance ?? 0}`],
        ['Overdue Total', `$${state.financialData?.overdueTotal ?? 0}`],
        ['Collection Rate', `${state.financialData?.collectionRate ?? 0}%`],
        ['Invoice Count', String(state.financialData?.invoiceCount ?? 0)],
      ];
      csvContent = rows.map((r) => r.join(',')).join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    loadReports: fetchReports,
    fetchOccupancy,
    fetchFinancials,
    exportCSV,
    clearError,
  };
}
