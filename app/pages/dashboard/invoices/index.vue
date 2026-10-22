<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { 
  CreditCard, 
  DollarSign, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Search, 
  Plus, 
  Receipt, 
  FileText, 
  Printer, 
} from '@lucide/vue';
import { useAuth } from '../../../composables/useAuth';
import type { ApiResponse } from '../../../../shared/types/api';
import AppTableCard from '../../../components/common/AppTableCard.vue';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  title: 'Invoices & Billing',
});

const { isLandlord, isTenant, isAdmin } = useAuth();

interface InvoiceItem {
  id: string;
  leaseId: string;
  tenantId: string;
  invoiceNumber: string;
  amountDue: number;
  amountPaid: number;
  issueDate: string;
  dueDate: string;
  status: string;
  notes?: string | null;
  createdAt: string;
  lease?: {
    id: string;
    unitId: string;
    landlordId: string;
    unit?: {
      id: string;
      unitNumber: string;
      property?: {
        id: string;
        title: string;
        city: string;
        state: string;
      };
    };
    landlord?: {
      id: string;
      fullName: string;
      email: string;
    };
  };
  tenant?: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
  };
  payments?: Array<{
    id: string;
    amount: number;
    method: string;
    referenceNumber: string | null;
    paidAt: string;
    receiptUrl: string | null;
  }>;
}

const invoices = ref<InvoiceItem[]>([]);
const isLoading = ref(true);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);

// Filters
const activeTab = ref<'ALL' | 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE'>('ALL');
const searchQuery = ref('');

// Generate Invoice Modal
const isGenerateModalOpen = ref(false);
const isGenerating = ref(false);
const generateForm = ref({
  leaseId: 'lease-skyline-101a',
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  amountDue: 1650,
  notes: 'Monthly Residential Rent',
});

// Pay / Record Payment Modal
const invoiceToPay = ref<InvoiceItem | null>(null);
const isPaying = ref(false);
const paymentForm = ref({
  amount: 0,
  method: 'BANK_TRANSFER',
  referenceNumber: '',
  notes: '',
});

// Digital Receipt Modal
const receiptData = ref<any | null>(null);
const isLoadingReceipt = ref(false);

async function loadInvoices() {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    const res = await $fetch<ApiResponse<{ invoices: InvoiceItem[] }>>('/api/v1/invoices');
    if (res.success && res.data) {
      invoices.value = res.data.invoices;
    } else {
      errorMessage.value = res.error?.message || 'Failed to load invoices';
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.error?.message || err?.message || 'Error loading invoices';
  } finally {
    isLoading.value = false;
  }
}

// Stats metrics
const totalInvoiced = computed(() => {
  return invoices.value.reduce((acc, inv) => acc + Number(inv.amountDue), 0);
});

const totalCollected = computed(() => {
  return invoices.value.reduce((acc, inv) => acc + Number(inv.amountPaid), 0);
});

const totalOutstanding = computed(() => {
  return Math.max(0, totalInvoiced.value - totalCollected.value);
});

const overdueCount = computed(() => {
  return invoices.value.filter((i) => i.status === 'OVERDUE').length;
});

// Filtered invoices
const filteredInvoices = computed(() => {
  return invoices.value.filter((inv) => {
    if (activeTab.value !== 'ALL' && inv.status !== activeTab.value) {
      return false;
    }
    if (!searchQuery.value.trim()) return true;

    const q = searchQuery.value.toLowerCase();
    const invNum = inv.invoiceNumber.toLowerCase();
    const unit = inv.lease?.unit?.unitNumber?.toLowerCase() || '';
    const prop = inv.lease?.unit?.property?.title?.toLowerCase() || '';
    const tenant = inv.tenant?.fullName?.toLowerCase() || '';
    return invNum.includes(q) || unit.includes(q) || prop.includes(q) || tenant.includes(q);
  });
});

// Pagination state
const currentPage = ref(1);
const pageSize = ref(5);

const paginatedInvoices = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredInvoices.value.slice(start, start + pageSize.value);
});

watch([activeTab, searchQuery], () => {
  currentPage.value = 1;
});

async function executeGenerateInvoice() {
  isGenerating.value = true;
  errorMessage.value = null;
  try {
    const res = await $fetch<ApiResponse<{ invoice: InvoiceItem; message: string }>>('/api/v1/invoices', {
      method: 'POST',
      body: {
        ...generateForm.value,
        dueDate: new Date(generateForm.value.dueDate!).toISOString(),
      },
    });

    if (res.success) {
      successMessage.value = res.data?.message || 'Invoice generated successfully';
      isGenerateModalOpen.value = false;
      await loadInvoices();
      setTimeout(() => {
        successMessage.value = null;
      }, 4000);
    } else {
      errorMessage.value = res.error?.message || 'Failed to generate invoice';
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.error?.message || err?.message || 'Error generating invoice';
  } finally {
    isGenerating.value = false;
  }
}

function openPayModal(inv: InvoiceItem) {
  invoiceToPay.value = inv;
  const remaining = Math.max(0, Number(inv.amountDue) - Number(inv.amountPaid));
  paymentForm.value = {
    amount: remaining,
    method: isTenant.value ? 'CREDIT_CARD' : 'BANK_TRANSFER',
    referenceNumber: '',
    notes: '',
  };
}

async function executeRecordPayment() {
  if (!invoiceToPay.value) return;
  isPaying.value = true;
  errorMessage.value = null;
  try {
    const res = await $fetch<ApiResponse<{ payment: any; invoice: InvoiceItem; receiptNumber: string; message: string }>>('/api/v1/payments', {
      method: 'POST',
      body: {
        invoiceId: invoiceToPay.value.id,
        amount: Number(paymentForm.value.amount),
        method: paymentForm.value.method,
        referenceNumber: paymentForm.value.referenceNumber || undefined,
        notes: paymentForm.value.notes || undefined,
      },
    });

    if (res.success) {
      successMessage.value = res.data?.message || 'Payment recorded successfully';
      const paymentId = res.data?.payment?.id;
      invoiceToPay.value = null;
      await loadInvoices();

      if (paymentId) {
        await viewReceipt(paymentId);
      }
      setTimeout(() => {
        successMessage.value = null;
      }, 4000);
    } else {
      errorMessage.value = res.error?.message || 'Failed to record payment';
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.error?.message || err?.message || 'Error processing payment';
  } finally {
    isPaying.value = false;
  }
}

async function viewReceipt(paymentId: string) {
  isLoadingReceipt.value = true;
  errorMessage.value = null;
  try {
    const res = await $fetch<ApiResponse<{ receipt: any }>>(`/api/v1/payments/${paymentId}/receipt`);
    if (res.success && res.data) {
      receiptData.value = res.data.receipt;
    } else {
      errorMessage.value = res.error?.message || 'Failed to load receipt';
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.error?.message || err?.message || 'Error fetching receipt';
  } finally {
    isLoadingReceipt.value = false;
  }
}

function printReceipt() {
  window.print();
}

onMounted(() => {
  loadInvoices();
});
</script>

<template>
  <div class="invoices-page">
    <!-- Top Bar -->
    <div class="page-top-bar">
      <div>
        <h1>Invoices & Billing</h1>
        <p class="subtitle">
          Track recurring rental billing, record digital or manual payments, and access verified receipts.
        </p>
      </div>
      <button
        v-if="isLandlord || isAdmin"
        @click="isGenerateModalOpen = true"
        class="btn-primary"
      >
        <Plus :size="15" />
        <span>Generate Invoice</span>
      </button>
    </div>

    <!-- Alert Notifications -->
    <div v-if="successMessage" class="alert-success">
      <CheckCircle2 :size="16" class="alert-icon" />
      <span>{{ successMessage }}</span>
    </div>

    <div v-if="errorMessage" class="alert-error">
      <AlertCircle :size="16" class="alert-icon" />
      <div class="alert-body">
        <span>{{ errorMessage }}</span>
        <NuxtLink
          v-if="errorMessage.toLowerCase().includes('logged in')"
          :to="{ path: '/login', query: { redirect: $route.fullPath } }"
          class="alert-action-btn"
        >
          Sign In
        </NuxtLink>
      </div>
    </div>

    <!-- Financial Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card card-flat">
        <div class="stat-header">
          <span class="stat-label">Total Outstanding</span>
          <div class="stat-icon-wrap outstanding">
            <Clock :size="16" />
          </div>
        </div>
        <div class="stat-value font-mono">${{ totalOutstanding.toLocaleString() }}</div>
        <div class="stat-subtext">Unsettled tenant balance</div>
      </div>

      <div class="stat-card card-flat">
        <div class="stat-header">
          <span class="stat-label">Total Collected</span>
          <div class="stat-icon-wrap collected">
            <DollarSign :size="16" />
          </div>
        </div>
        <div class="stat-value font-mono">${{ totalCollected.toLocaleString() }}</div>
        <div class="stat-subtext">Verified cleared funds</div>
      </div>

      <div class="stat-card card-flat">
        <div class="stat-header">
          <span class="stat-label">Total Billed</span>
          <div class="stat-icon-wrap billed">
            <CreditCard :size="16" />
          </div>
        </div>
        <div class="stat-value font-mono">${{ totalInvoiced.toLocaleString() }}</div>
        <div class="stat-subtext">{{ invoices.length }} invoices generated</div>
      </div>

      <div class="stat-card card-flat">
        <div class="stat-header">
          <span class="stat-label">Overdue Invoices</span>
          <div class="stat-icon-wrap overdue">
            <AlertTriangle :size="16" />
          </div>
        </div>
        <div class="stat-value font-mono" :class="{ 'text-danger': overdueCount > 0 }">
          {{ overdueCount }}
        </div>
        <div class="stat-subtext">Requires immediate follow-up</div>
      </div>
    </div>

    <!-- Invoices Table using shared AppTableCard -->
    <AppTableCard
      v-model:search="searchQuery"
      search-placeholder="Search by invoice #, tenant, unit..."
      :is-loading="isLoading"
      :is-empty="filteredInvoices.length === 0"
      empty-title="No invoices found"
      empty-description="Invoices will appear here once generated for active leases."
      :empty-icon="FileText"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total-items="filteredInvoices.length"
      item-name="invoices"
    >
      <template #toolbar-start>
        <div class="status-tabs">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'ALL' }"
            @click="activeTab = 'ALL'"
          >
            All Invoices
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'UNPAID' }"
            @click="activeTab = 'UNPAID'"
          >
            Unpaid
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'PARTIALLY_PAID' }"
            @click="activeTab = 'PARTIALLY_PAID'"
          >
            Partially Paid
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'PAID' }"
            @click="activeTab = 'PAID'"
          >
            Paid
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'OVERDUE' }"
            @click="activeTab = 'OVERDUE'"
          >
            Overdue
          </button>
        </div>
      </template>

      <table class="data-table">
          <thead>
            <tr>
              <th>Invoice Number</th>
              <th>Property & Unit</th>
              <th>Tenant / Recipient</th>
              <th>Due Date</th>
              <th>Amount Due</th>
              <th>Amount Paid</th>
              <th>Status</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inv in paginatedInvoices" :key="inv.id">
              <td>
                <div class="invoice-num-cell">
                  <span class="font-mono font-semibold">{{ inv.invoiceNumber }}</span>
                  <span class="text-dim text-xs">Issued: {{ new Date(inv.issueDate).toLocaleDateString() }}</span>
                </div>
              </td>
              <td>
                <div class="unit-cell">
                  <span class="font-semibold">Unit {{ inv.lease?.unit?.unitNumber || '101A' }}</span>
                  <span class="text-dim text-xs">{{ inv.lease?.unit?.property?.title || 'Skyline Heights' }}</span>
                </div>
              </td>
              <td>
                <div class="tenant-cell">
                  <span>{{ inv.tenant?.fullName || 'Sarah Jenkins' }}</span>
                  <span class="text-dim text-xs">{{ inv.tenant?.email || 'tenant@example.com' }}</span>
                </div>
              </td>
              <td>
                <div class="date-cell">
                  <Calendar :size="13" class="text-dim" />
                  <span>{{ new Date(inv.dueDate).toLocaleDateString() }}</span>
                </div>
              </td>
              <td class="font-mono font-semibold">
                ${{ inv.amountDue.toLocaleString() }}
              </td>
              <td>
                <div class="paid-cell font-mono">
                  <span>${{ inv.amountPaid.toLocaleString() }}</span>
                  <span v-if="inv.amountDue > inv.amountPaid" class="text-xs text-dim">
                    (${{ (inv.amountDue - inv.amountPaid).toLocaleString() }} left)
                  </span>
                </div>
              </td>
              <td>
                <span
                  class="badge"
                  :class="{
                    'badge-success': inv.status === 'PAID',
                    'badge-warning': inv.status === 'PARTIALLY_PAID',
                    'badge-info': inv.status === 'UNPAID',
                    'badge-danger': inv.status === 'OVERDUE',
                  }"
                >
                  {{ inv.status.replace('_', ' ') }}
                </span>
              </td>
              <td class="text-right">
                <div class="action-btn-group">
                  <!-- Pay / Record Button -->
                  <button
                    v-if="inv.status !== 'PAID' && inv.status !== 'CANCELLED'"
                    @click="openPayModal(inv)"
                    class="btn-primary btn-sm"
                  >
                    <CreditCard :size="13" />
                    <span>{{ isTenant ? 'Pay Now' : 'Record Payment' }}</span>
                  </button>

                  <!-- Receipt Button -->
                  <button
                    v-if="inv.payments && inv.payments.length > 0"
                    @click="viewReceipt(inv.payments[0]!.id)"
                    class="btn-secondary btn-sm"
                    title="View Digital Receipt"
                  >
                    <Receipt :size="13" />
                    <span>Receipt</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
      </table>
    </AppTableCard>

    <!-- Generate Invoice Modal -->
    <div v-if="isGenerateModalOpen" class="modal-backdrop">
      <div class="modal-card card-flat" style="max-width: 560px;">
        <div class="modal-header">
          <h3>Generate Rental Invoice</h3>
          <button @click="isGenerateModalOpen = false" class="modal-close">&times;</button>
        </div>

        <form @submit.prevent="executeGenerateInvoice" class="modal-body">
          <div class="form-group">
            <label class="form-label">Active Lease Reference ID</label>
            <input
              v-model="generateForm.leaseId"
              type="text"
              required
              class="form-control"
              placeholder="e.g. lease-skyline-101a"
            />
          </div>

          <div class="grid-2-col">
            <div class="form-group">
              <label class="form-label">Due Date</label>
              <input
                v-model="generateForm.dueDate"
                type="date"
                required
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Amount Due ($)</label>
              <input
                v-model.number="generateForm.amountDue"
                type="number"
                min="1"
                step="0.01"
                required
                class="form-control"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Invoice Description / Memo</label>
            <input
              v-model="generateForm.notes"
              type="text"
              class="form-control"
              placeholder="e.g. March 2026 Monthly Residential Rent"
            />
          </div>

          <div class="modal-actions">
            <button type="button" @click="isGenerateModalOpen = false" class="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isGenerating"
              class="btn-primary"
            >
              <Plus :size="14" />
              <span>{{ isGenerating ? 'Generating...' : 'Issue Invoice' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Record / Pay Modal -->
    <div v-if="invoiceToPay" class="modal-backdrop">
      <div class="modal-card card-flat" style="max-width: 540px;">
        <div class="modal-header">
          <h3>{{ isTenant ? 'Pay Rent Invoice' : 'Record Payment' }}</h3>
          <button @click="invoiceToPay = null" class="modal-close">&times;</button>
        </div>

        <form @submit.prevent="executeRecordPayment" class="modal-body">
          <div class="contract-summary">
            <div><strong>Invoice:</strong> {{ invoiceToPay.invoiceNumber }}</div>
            <div><strong>Total Due:</strong> ${{ invoiceToPay.amountDue.toLocaleString() }}</div>
            <div><strong>Already Paid:</strong> ${{ invoiceToPay.amountPaid.toLocaleString() }}</div>
            <div>
              <strong>Remaining Balance:</strong>
              ${{ (invoiceToPay.amountDue - invoiceToPay.amountPaid).toLocaleString() }}
            </div>
          </div>

          <div class="grid-2-col">
            <div class="form-group">
              <label class="form-label">Payment Amount ($)</label>
              <input
                v-model.number="paymentForm.amount"
                type="number"
                min="1"
                :max="invoiceToPay.amountDue - invoiceToPay.amountPaid"
                step="0.01"
                required
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Payment Method</label>
              <select v-model="paymentForm.method" class="form-control" required>
                <option value="BANK_TRANSFER">Bank Transfer (ACH/Wire)</option>
                <option value="CREDIT_CARD">Credit / Debit Card</option>
                <option value="STRIPE_MOCK">Stripe Gateway (Mock)</option>
                <option v-if="isLandlord || isAdmin" value="CASH">Cash</option>
                <option v-if="isLandlord || isAdmin" value="CHECK">Check</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Reference / Confirmation Code (Optional)</label>
            <input
              v-model="paymentForm.referenceNumber"
              type="text"
              class="form-control"
              placeholder="e.g. TXN-WIRE-9921 or Card Auth #4910"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Notes (Optional)</label>
            <input
              v-model="paymentForm.notes"
              type="text"
              class="form-control"
              placeholder="Payment notes or remittance info"
            />
          </div>

          <div class="modal-actions">
            <button type="button" @click="invoiceToPay = null" class="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isPaying"
              class="btn-primary"
            >
              <DollarSign :size="14" />
              <span>{{ isPaying ? 'Processing...' : 'Confirm Payment' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Official Printable Digital Receipt Modal -->
    <div v-if="receiptData" class="modal-backdrop">
      <div class="modal-card card-flat receipt-modal-box">
        <div class="modal-header no-print">
          <h3>Payment Receipt</h3>
          <div class="header-action-group">
            <button @click="printReceipt" class="btn-secondary btn-sm">
              <Printer :size="14" />
              <span>Print</span>
            </button>
            <button @click="receiptData = null" class="modal-close">&times;</button>
          </div>
        </div>

        <div class="receipt-printable-content">
          <div class="receipt-top-header">
            <div>
              <div class="receipt-brand">Rent<span class="brand-accent">Ease</span></div>
              <div class="text-xs text-dim">Property Rental Management System</div>
            </div>
            <div class="receipt-badge-status">
              <CheckCircle2 :size="14" />
              <span>CONFIRMED RECEIPT</span>
            </div>
          </div>

          <hr class="receipt-divider" />

          <div class="receipt-info-grid">
            <div>
              <span class="info-label">Receipt Number</span>
              <strong class="font-mono">{{ receiptData.receiptNumber }}</strong>
            </div>
            <div>
              <span class="info-label">Payment Date</span>
              <span>{{ new Date(receiptData.paidAt).toLocaleString() }}</span>
            </div>
            <div>
              <span class="info-label">Payment Method</span>
              <span>{{ receiptData.method.replace('_', ' ') }}</span>
            </div>
            <div>
              <span class="info-label">Reference Number</span>
              <span class="font-mono">{{ receiptData.referenceNumber || 'N/A' }}</span>
            </div>
          </div>

          <div class="receipt-parties-box">
            <div class="party-col">
              <span class="party-label">Tenant</span>
              <strong>{{ receiptData.tenant?.fullName }}</strong>
              <span class="text-xs text-dim">{{ receiptData.tenant?.email }}</span>
            </div>
            <div class="party-col">
              <span class="party-label">Property & Unit</span>
              <strong>{{ receiptData.property?.title }} — Unit {{ receiptData.property?.unitNumber }}</strong>
              <span class="text-xs text-dim">{{ receiptData.property?.address }}</span>
            </div>
          </div>

          <table class="receipt-table">
            <thead>
              <tr>
                <th>Description</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  Invoice {{ receiptData.invoice?.invoiceNumber }}
                  <span class="text-xs text-dim block">Due: {{ new Date(receiptData.invoice?.dueDate).toLocaleDateString() }}</span>
                </td>
                <td class="text-right font-mono font-semibold">
                  ${{ Number(receiptData.amount).toFixed(2) }}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td class="font-semibold">Total Paid</td>
                <td class="text-right font-mono font-bold text-success">
                  ${{ Number(receiptData.amount).toFixed(2) }}
                </td>
              </tr>
              <tr>
                <td class="text-dim text-sm">Remaining Invoice Balance</td>
                <td class="text-right font-mono text-sm">
                  ${{ Number(receiptData.invoice?.remainingBalance || 0).toFixed(2) }}
                </td>
              </tr>
            </tfoot>
          </table>

          <div class="receipt-footer">
            <span class="text-xs text-dim">
              This is a computer-generated digital receipt and official proof of payment recorded within the RentEase platform.
            </span>
          </div>
        </div>

        <div class="modal-actions no-print">
          <button @click="receiptData = null" class="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.invoices-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-top-bar h1 {
  font-size: 1.6rem;
}

.subtitle {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin-top: 0.2rem;
}

/* Stats Cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.stat-card {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-dim);
  text-transform: uppercase;
}

.stat-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon-wrap.outstanding {
  background: rgba(99, 102, 241, 0.12);
  color: var(--primary);
}

.stat-icon-wrap.collected {
  background: var(--accent-emerald-subtle);
  color: #34d399;
}

.stat-icon-wrap.billed {
  background: rgba(59, 130, 246, 0.12);
  color: #60a5fa;
}

.stat-icon-wrap.overdue {
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.stat-subtext {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Table Shell */
.table-shell {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.table-top-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.status-tabs {
  display: flex;
  background: var(--bg-canvas);
  padding: 0.2rem;
  gap: 0.2rem;
}

.tab-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.15s ease;
}

.tab-btn:hover {
  color: var(--text-main);
}

.tab-btn.active {
  background: var(--bg-surface);
  color: var(--text-main);
  border: 1px solid var(--border-default);
  box-shadow: none;
}

.search-wrap {
  position: relative;
  width: 100%;
  max-width: 300px;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-dim);
}

.table-search-input {
  width: 100%;
  background: var(--bg-input);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  padding: 0.45rem 0.75rem 0.45rem 2.2rem;
  color: var(--text-main);
  font-size: 0.85rem;
}

.table-search-input:focus {
  outline: none;
  border-color: var(--border-focus);
}

.invoice-num-cell,
.unit-cell,
.tenant-cell,
.paid-cell {
  display: flex;
  flex-direction: column;
}

.date-cell {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
}

.action-btn-group {
  display: inline-flex;
  gap: 0.4rem;
}

.btn-sm {
  padding: 0.35rem 0.65rem;
  font-size: 0.8rem;
  gap: 0.3rem;
}

.text-right {
  text-align: right;
}

.text-success {
  color: #34d399;
}

.text-danger {
  color: #f87171;
}

.text-dim {
  color: var(--text-dim);
}

.text-xs {
  font-size: 0.75rem;
}

.text-sm {
  font-size: 0.825rem;
}

.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.font-semibold {
  font-weight: 600;
}

.font-bold {
  font-weight: 700;
}

.block {
  display: block;
}

/* Modals */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1.5rem;
}

.modal-card {
  width: 100%;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 0.75rem;
}

.header-action-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contract-summary {
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  padding: 0.85rem 1rem;
  font-size: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.grid-2-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-dim);
}

.form-control {
  background: var(--bg-input);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.75rem;
  color: var(--text-main);
  font-size: 0.85rem;
  width: 100%;
}

.form-control:focus {
  outline: none;
  border-color: var(--border-focus);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

/* Receipt Modal Styles */
.receipt-modal-box {
  max-width: 600px;
}

.receipt-printable-content {
  background: var(--bg-canvas);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.receipt-top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.receipt-brand {
  font-size: 1.3rem;
  font-weight: 700;
}

.receipt-badge-status {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: var(--accent-emerald-subtle);
  color: var(--color-emerald-accent);
  border: 1px solid rgba(5, 150, 105, 0.25);
  font-size: 0.725rem;
  font-weight: 500;
  padding: 0.2rem 0.55rem;
  border-radius: var(--radius-sm);
}

.receipt-divider {
  border: 0;
  border-top: 1px solid var(--border-subtle);
  margin: 0;
}

.receipt-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  font-size: 0.825rem;
}

.info-label {
  display: block;
  font-size: 0.7rem;
  color: var(--text-dim);
  text-transform: uppercase;
}

.receipt-parties-box {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 0.85rem 1rem;
}

.party-col {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  font-size: 0.85rem;
}

.party-label {
  font-size: 0.7rem;
  color: var(--text-dim);
  text-transform: uppercase;
  font-weight: 600;
}

.receipt-table {
  width: 100%;
  border-collapse: collapse;
}

.receipt-table th {
  text-align: left;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--text-dim);
  border-bottom: 1px solid var(--border-default);
  padding-bottom: 0.5rem;
}

.receipt-table td {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-subtle);
  font-size: 0.85rem;
}

.receipt-table tfoot td {
  padding-top: 0.5rem;
  border-bottom: none;
}

.receipt-footer {
  text-align: center;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-subtle);
}

/* Loading & Empty States */
.empty-state {
  text-align: center;
  padding: 3.5rem 1rem;
  color: var(--text-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.empty-icon {
  color: var(--text-dim);
  margin-bottom: 0.5rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 1rem;
  color: var(--text-muted);
}

.loading-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--border-subtle);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .grid-2-col,
  .receipt-info-grid,
  .receipt-parties-box {
    grid-template-columns: 1fr;
  }
}

@media print {
  .no-print {
    display: none !important;
  }
  .modal-backdrop {
    position: static;
    background: none;
    padding: 0;
  }
  .modal-card {
    border: none;
    padding: 0;
    max-width: 100%;
  }
}
</style>
