import { reactive, toRefs, toRef, computed } from 'vue';
import type {
  InvoiceItem,
  GenerateInvoiceInput,
  RecordPaymentInput,
  PaymentReceipt,
} from '~~/shared/types';

export function useInvoiceStore() {
  const state = reactive({
    invoices: [] as InvoiceItem[],
    selectedInvoice: null as InvoiceItem | null,
    receiptData: null as any | null,
    isLoading: false,
    isGenerating: false,
    isRecordingPayment: false,
    error: null as any,
  });

  // Computed summary metrics
  const totalInvoices = computed(() => state.invoices.length);
  const paidInvoicesCount = computed(
    () => state.invoices.filter((i) => i.status === 'PAID').length
  );
  const pendingInvoicesCount = computed(
    () => state.invoices.filter((i) => i.status === 'PENDING').length
  );
  const overdueInvoicesCount = computed(
    () => state.invoices.filter((i) => i.status === 'OVERDUE').length
  );

  const totalReceivables = computed(() =>
    state.invoices.reduce((sum, inv) => sum + (Number(inv.amountDue) || 0), 0)
  );

  const totalCollected = computed(() =>
    state.invoices.reduce((sum, inv) => sum + (Number(inv.amountPaid) || 0), 0)
  );

  const totalOutstanding = computed(() =>
    Math.max(0, totalReceivables.value - totalCollected.value)
  );

  async function fetchInvoices(
    filter: { tenantId?: string; leaseId?: string; status?: string } = {}
  ) {
    state.isLoading = true;
    state.error = null;

    try {
      const queryParams: Record<string, any> = {};
      if (filter.tenantId) queryParams.tenantId = filter.tenantId;
      if (filter.leaseId) queryParams.leaseId = filter.leaseId;
      if (filter.status) queryParams.status = filter.status;

      const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined;
      const { data, error }: any = await useFetch('/api/v1/invoices', {
        headers,
        query: queryParams,
      });

      if (data.value) {
        state.invoices = data.value.data?.invoices || data.value.data || [];
        return state.invoices;
      } else {
        throw error.value || new Error('Failed to fetch invoices');
      }
    } catch (err: any) {
      state.error = err?.data?.error?.message || err?.message || 'Failed to fetch invoices';
      return [];
    } finally {
      state.isLoading = false;
    }
  }

  async function fetchInvoiceById(id: string) {
    state.isLoading = true;
    state.error = null;

    try {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined;
      const { data, error }: any = await useFetch(`/api/v1/invoices/${id}`, {
        headers,
      });

      if (data.value) {
        state.selectedInvoice = data.value.data?.invoice || data.value.data;
        return state.selectedInvoice;
      } else {
        throw error.value || new Error('Failed to fetch invoice details');
      }
    } catch (err: any) {
      state.error = err?.data?.error?.message || err?.message || 'Failed to fetch invoice details';
      return null;
    } finally {
      state.isLoading = false;
    }
  }

  async function generateInvoice(input: GenerateInvoiceInput) {
    state.isGenerating = true;
    state.error = null;

    try {
      const { data, error }: any = await useFetch('/api/v1/invoices', {
        method: 'POST',
        body: input,
      });

      if (data.value) {
        const inv = data.value.data?.invoice || data.value.data;
        if (inv) {
          state.invoices.unshift(inv);
        }
        return { success: true, invoice: inv, data: data.value.data };
      } else {
        throw error.value || new Error('Failed to generate invoice');
      }
    } catch (err: any) {
      state.error = err?.data?.error?.message || err?.message || 'Failed to generate invoice';
      return { success: false, error: state.error };
    } finally {
      state.isGenerating = false;
    }
  }

  async function recordPayment(input: RecordPaymentInput) {
    state.isRecordingPayment = true;
    state.error = null;

    try {
      const { data, error }: any = await useFetch('/api/v1/payments', {
        method: 'POST',
        body: {
          invoiceId: input.invoiceId,
          amount: input.amount,
          method: input.method,
          referenceNumber: input.referenceNumber,
          notes: input.notes,
        },
      });

      if (data.value) {
        const payment = data.value.data?.payment || data.value.data;
        const invoice = data.value.data?.invoice;

        if (invoice) {
          const idx = state.invoices.findIndex((i) => i.id === invoice.id);
          if (idx !== -1) {
            state.invoices[idx] = { ...state.invoices[idx], ...invoice };
          }
          if (state.selectedInvoice?.id === invoice.id) {
            state.selectedInvoice = { ...state.selectedInvoice, ...invoice };
          }
        }
        return { success: true, payment, invoice, data: data.value.data };
      } else {
        throw error.value || new Error('Failed to record payment');
      }
    } catch (err: any) {
      state.error = err?.data?.error?.message || err?.message || 'Failed to record payment';
      return { success: false, error: state.error };
    } finally {
      state.isRecordingPayment = false;
    }
  }

  async function fetchReceipt(paymentId: string) {
    state.isLoading = true;
    state.error = null;

    try {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined;
      const { data, error }: any = await useFetch(`/api/v1/payments/${paymentId}/receipt`, {
        headers,
      });

      if (data.value) {
        state.receiptData = data.value.data?.receipt || data.value.data;
        return state.receiptData;
      } else {
        throw error.value || new Error('Failed to fetch payment receipt');
      }
    } catch (err: any) {
      state.error = err?.data?.error?.message || err?.message || 'Failed to fetch payment receipt';
      return null;
    } finally {
      state.isLoading = false;
    }
  }

  async function fetchOverdueInvoices() {
    return fetchInvoices({ status: 'OVERDUE' });
  }

  function clearError() {
    state.error = null;
  }

  return {
    state,
    ...toRefs(state),
    isPaying: toRef(state, 'isRecordingPayment'),
    isLoadingReceipt: toRef(state, 'isLoading'),
    errorMessage: toRef(state, 'error'),
    totalInvoices,
    totalInvoiced: totalReceivables,
    paidInvoicesCount,
    pendingInvoicesCount,
    overdueInvoicesCount,
    overdueCount: overdueInvoicesCount,
    totalReceivables,
    totalCollected,
    totalOutstanding,
    fetchInvoices,
    loadInvoices: fetchInvoices,
    fetchInvoiceById,
    generateInvoice,
    recordPayment,
    fetchReceipt,
    viewReceipt: fetchReceipt,
    fetchOverdueInvoices,
    clearError,
  };
}
