<script setup lang="ts">
import { 
  BarChart3, 
  Key, 
  CreditCard, 
  Building, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  Download, 
  Layers,
  ArrowUpRight
} from '@lucide/vue';
import { useAuth } from '../../../composables/useAuth';
import { useReportStore } from '../../../stores/report.store';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  title: 'Reports & Analytics',
});

const { user, isAdmin, isLandlord } = useAuth();
const router = useRouter();

// Restrict access to Landlord and Admin
onMounted(() => {
  if (!isAdmin.value && !isLandlord.value) {
    router.replace('/dashboard');
  }
});

const activeTab = ref<'occupancy' | 'financials'>('occupancy');
const reportStore = useReportStore();

const {
  occupancyData,
  financialData,
  isLoading,
  errorMessage,
} = reportStore;

const {
  loadReports,
  fetchReports,
  exportCSV: storeExportCSV,
} = reportStore;

onMounted(() => {
  loadReports();
});

const exportCSV = () => {
  storeExportCSV(activeTab.value);
};
</script>

<template>
  <div class="reports-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Portfolio Analytics & Reports</h1>
        <p class="page-subtitle">Real-time occupancy tracking, unit allocation, and revenue collection metrics.</p>
      </div>
      <div class="header-actions">
        <button @click="loadReports" class="btn-secondary" :disabled="isLoading">
          <RefreshCw :size="15" :class="{ 'spin-icon': isLoading }" />
          <span>Refresh</span>
        </button>
        <button @click="exportCSV" class="btn-secondary" :disabled="isLoading">
          <Download :size="15" />
          <span>Export CSV</span>
        </button>
      </div>
    </div>

    <!-- Error Banner -->
    <div v-if="errorMessage" class="error-banner card-flat">
      <AlertTriangle :size="16" class="text-rose" />
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Tab Selector -->
    <div class="tab-bar">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'occupancy' }"
        @click="activeTab = 'occupancy'"
      >
        <Key :size="15" />
        <span>Occupancy & Unit Allocation</span>
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'financials' }"
        @click="activeTab = 'financials'"
      >
        <CreditCard :size="15" />
        <span>Revenue & Collections</span>
      </button>
    </div>

    <!-- TAB 1: OCCUPANCY ANALYTICS -->
    <div v-if="activeTab === 'occupancy'" class="analytics-container">
      <!-- High Level Metrics -->
      <div class="stats-grid">
        <div class="stat-card card-flat">
          <div class="stat-header">
            <span class="stat-label">Total Portfolio Units</span>
            <Building :size="16" class="text-muted" />
          </div>
          <div class="stat-val">{{ occupancyData?.totalUnits ?? 0 }}</div>
          <div class="stat-footer text-muted">Across managed properties</div>
        </div>

        <div class="stat-card card-flat">
          <div class="stat-header">
            <span class="stat-label">Occupancy Rate</span>
            <CheckCircle2 :size="16" class="text-emerald" />
          </div>
          <div class="stat-val text-emerald">{{ occupancyData?.occupancyRate ?? 0 }}%</div>
          <div class="stat-footer text-emerald">{{ occupancyData?.occupiedUnits ?? 0 }} units leased</div>
        </div>

        <div class="stat-card card-flat">
          <div class="stat-header">
            <span class="stat-label">Available for Lease</span>
            <Layers :size="16" class="text-sky" />
          </div>
          <div class="stat-val text-sky">{{ occupancyData?.availableUnits ?? 0 }}</div>
          <div class="stat-footer text-muted">Ready for tenants</div>
        </div>

        <div class="stat-card card-flat">
          <div class="stat-header">
            <span class="stat-label">In Maintenance / Reserved</span>
            <AlertTriangle :size="16" class="text-amber" />
          </div>
          <div class="stat-val text-amber">
            {{ (occupancyData?.maintenanceUnits ?? 0) + (occupancyData?.reservedUnits ?? 0) }}
          </div>
          <div class="stat-footer text-muted">
            {{ occupancyData?.maintenanceUnits ?? 0 }} offline, {{ occupancyData?.reservedUnits ?? 0 }} reserved
          </div>
        </div>
      </div>

      <!-- Unit Distribution Breakdown Bar -->
      <div class="card-flat distribution-card" v-if="occupancyData && occupancyData.totalUnits > 0">
        <div class="card-title-bar">
          <h3>Unit Allocation Breakdown</h3>
          <span class="total-units-badge">{{ occupancyData.totalUnits }} Total Units</span>
        </div>
        
        <!-- Multi-segment progress bar -->
        <div class="allocation-bar">
          <div 
            class="seg seg-occupied" 
            :style="{ width: `${(occupancyData.occupiedUnits / occupancyData.totalUnits) * 100}%` }"
            :title="`Occupied: ${occupancyData.occupiedUnits}`"
          ></div>
          <div 
            class="seg seg-reserved" 
            :style="{ width: `${(occupancyData.reservedUnits / occupancyData.totalUnits) * 100}%` }"
            :title="`Reserved: ${occupancyData.reservedUnits}`"
          ></div>
          <div 
            class="seg seg-maintenance" 
            :style="{ width: `${(occupancyData.maintenanceUnits / occupancyData.totalUnits) * 100}%` }"
            :title="`Maintenance: ${occupancyData.maintenanceUnits}`"
          ></div>
          <div 
            class="seg seg-available" 
            :style="{ width: `${(occupancyData.availableUnits / occupancyData.totalUnits) * 100}%` }"
            :title="`Available: ${occupancyData.availableUnits}`"
          ></div>
        </div>

        <!-- Legend -->
        <div class="bar-legend">
          <div class="legend-item">
            <span class="dot dot-occupied"></span>
            <span>Occupied ({{ occupancyData.occupiedUnits }})</span>
          </div>
          <div class="legend-item">
            <span class="dot dot-reserved"></span>
            <span>Reserved ({{ occupancyData.reservedUnits }})</span>
          </div>
          <div class="legend-item">
            <span class="dot dot-maintenance"></span>
            <span>Maintenance ({{ occupancyData.maintenanceUnits }})</span>
          </div>
          <div class="legend-item">
            <span class="dot dot-available"></span>
            <span>Available ({{ occupancyData.availableUnits }})</span>
          </div>
        </div>
      </div>

      <!-- Property Breakdown Table -->
      <div class="card-flat table-card">
        <div class="card-title-bar">
          <h3>Property-by-Property Breakdown</h3>
          <span class="table-count text-muted">{{ occupancyData?.propertyBreakdown?.length || 0 }} Properties</span>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Location</th>
                <th>Units</th>
                <th>Occupied</th>
                <th>Available</th>
                <th>Maintenance</th>
                <th>Occupancy %</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoading">
                <td colspan="7" class="loading-cell">Loading property records...</td>
              </tr>
              <tr v-else-if="!occupancyData?.propertyBreakdown?.length">
                <td colspan="7" class="empty-cell">No properties found in portfolio.</td>
              </tr>
              <tr v-for="prop in occupancyData?.propertyBreakdown" :key="prop.propertyId">
                <td class="font-medium text-main">{{ prop.title }}</td>
                <td class="text-muted">{{ prop.city }}, {{ prop.state }}</td>
                <td>{{ prop.totalUnits }}</td>
                <td class="text-emerald font-medium">{{ prop.occupiedUnits }}</td>
                <td class="text-sky">{{ prop.availableUnits }}</td>
                <td :class="{ 'text-amber': prop.maintenanceUnits > 0 }">{{ prop.maintenanceUnits }}</td>
                <td>
                  <div class="occupancy-pill-wrapper">
                    <div class="occupancy-track">
                      <div class="occupancy-fill" :style="{ width: `${prop.occupancyRate}%` }"></div>
                    </div>
                    <span class="occupancy-pct">{{ prop.occupancyRate }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 2: FINANCIAL ANALYTICS -->
    <div v-else class="analytics-container">
      <div class="stats-grid">
        <div class="stat-card card-flat">
          <div class="stat-header">
            <span class="stat-label">Total Invoiced</span>
            <CreditCard :size="16" class="text-muted" />
          </div>
          <div class="stat-val">{{ financialData?.totalInvoiced ?? '$0.00' }}</div>
          <div class="stat-footer text-muted">{{ financialData?.invoiceCount ?? 0 }} total invoices issued</div>
        </div>

        <div class="stat-card card-flat">
          <div class="stat-header">
            <span class="stat-label">Revenue Collected</span>
            <CheckCircle2 :size="16" class="text-emerald" />
          </div>
          <div class="stat-val text-emerald">{{ financialData?.totalCollected ?? '$0.00' }}</div>
          <div class="stat-footer text-emerald">{{ financialData?.collectionRate ?? 0 }}% collection efficiency</div>
        </div>

        <div class="stat-card card-flat">
          <div class="stat-header">
            <span class="stat-label">Outstanding Balance</span>
            <Clock :size="16" class="text-amber" />
          </div>
          <div class="stat-val text-amber">{{ financialData?.outstandingBalance ?? '$0.00' }}</div>
          <div class="stat-footer text-muted">Awaiting tenant payment</div>
        </div>

        <div class="stat-card card-flat">
          <div class="stat-header">
            <span class="stat-label">Overdue Arrears</span>
            <AlertTriangle :size="16" class="text-rose" />
          </div>
          <div class="stat-val text-rose">{{ financialData?.overdueTotal ?? '$0.00' }}</div>
          <div class="stat-footer text-rose">Past payment grace deadline</div>
        </div>
      </div>

      <!-- Collection Performance Card -->
      <div class="card-flat distribution-card" v-if="financialData">
        <div class="card-title-bar">
          <h3>Collection Performance</h3>
          <span class="total-units-badge">{{ financialData.collectionRate }}% Settled</span>
        </div>

        <div class="financial-meter">
          <div class="meter-bar">
            <div class="meter-fill" :style="{ width: `${financialData.collectionRate}%` }"></div>
          </div>
          <div class="meter-stats">
            <div class="meter-col">
              <span class="meter-col-label">Collected</span>
              <span class="meter-col-val text-emerald">{{ financialData.totalCollected }}</span>
            </div>
            <div class="meter-col">
              <span class="meter-col-label">Outstanding & Arrears</span>
              <span class="meter-col-val text-amber">{{ financialData.outstandingBalance }}</span>
            </div>
            <div class="meter-col">
              <span class="meter-col-label">Total Invoiced</span>
              <span class="meter-col-val text-main">{{ financialData.totalInvoiced }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Operational Insights Grid -->
      <div class="insights-grid">
        <div class="insight-card card-flat">
          <div class="insight-icon bg-indigo">
            <CreditCard :size="18" />
          </div>
          <div class="insight-content">
            <h4>Rent Reconciliations</h4>
            <p>Direct payments recorded automatically reconcile invoice balances and update tenant ledgers in real-time.</p>
            <NuxtLink to="/dashboard/invoices" class="insight-link">
              <span>View Invoices</span>
              <ArrowUpRight :size="13" />
            </NuxtLink>
          </div>
        </div>

        <div class="insight-card card-flat">
          <div class="insight-icon bg-emerald">
            <CheckCircle2 :size="18" />
          </div>
          <div class="insight-content">
            <h4>Auto Invoicing</h4>
            <p>Active leases generate automated recurring billing line-items each billing period according to lease terms.</p>
            <NuxtLink to="/dashboard/leases" class="insight-link">
              <span>View Active Leases</span>
              <ArrowUpRight :size="13" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reports-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 0.25rem;
}

.page-subtitle {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(244, 63, 94, 0.1);
  border-color: rgba(244, 63, 94, 0.2);
  color: #fb7185;
  font-size: 0.875rem;
}

.tab-bar {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 0.5rem;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-muted);
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.15s ease;
}

.tab-btn:hover {
  color: var(--text-main);
  background: var(--bg-surface-hover);
}

.tab-btn.active {
  color: #818cf8;
  background: var(--primary-subtle);
  border-color: rgba(99, 102, 241, 0.2);
  font-weight: 600;
}

.analytics-container {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.stat-card {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-dim);
  letter-spacing: 0.05em;
}

.stat-val {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.2;
  margin-bottom: 0.25rem;
}

.stat-footer {
  font-size: 0.75rem;
}

.distribution-card {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card-title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title-bar h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-main);
}

.total-units-badge {
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--bg-canvas);
  border: 1px solid var(--border-subtle);
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
}

.allocation-bar {
  height: 16px;
  width: 100%;
  background: var(--bg-canvas);
  border-radius: var(--radius-sm);
  display: flex;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
}

.seg {
  height: 100%;
  transition: width 0.3s ease;
}

.seg-occupied { background: #10b981; }
.seg-reserved { background: #6366f1; }
.seg-maintenance { background: #f59e0b; }
.seg-available { background: #0284c7; }

.bar-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot-occupied { background: #10b981; }
.dot-reserved { background: #6366f1; }
.dot-maintenance { background: #f59e0b; }
.dot-available { background: #0284c7; }

.table-card {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.data-table th {
  text-align: left;
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-dim);
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.data-table td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-subtle);
}

.occupancy-pill-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.occupancy-track {
  flex: 1;
  max-width: 80px;
  height: 6px;
  background: var(--bg-canvas);
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
}

.occupancy-fill {
  height: 100%;
  background: #10b981;
}

.occupancy-pct {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-main);
  min-width: 38px;
}

.financial-meter {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.meter-bar {
  height: 14px;
  width: 100%;
  background: var(--bg-canvas);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-subtle);
  overflow: hidden;
}

.meter-fill {
  height: 100%;
  background: #10b981;
  transition: width 0.3s ease;
}

.meter-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  padding-top: 0.5rem;
}

.meter-col {
  display: flex;
  flex-direction: column;
}

.meter-col-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-dim);
  margin-bottom: 0.2rem;
}

.meter-col-val {
  font-size: 1.25rem;
  font-weight: 700;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.insight-card {
  padding: 1.25rem;
  display: flex;
  gap: 1rem;
}

.insight-icon {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.insight-content {
  flex: 1;
}

.insight-content h4 {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 0.25rem;
}

.insight-content p {
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

.insight-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  font-weight: 500;
  color: #818cf8;
}

.insight-link:hover {
  text-decoration: underline;
}

.text-emerald { color: #34d399; }
.text-sky { color: #38bdf8; }
.text-amber { color: #fbbf24; }
.text-rose { color: #fb7185; }
.text-main { color: var(--text-main); }
.text-muted { color: var(--text-muted); }
.font-medium { font-weight: 500; }

.bg-indigo { background: var(--primary-subtle); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.2); }
.bg-emerald { background: var(--accent-emerald-subtle); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.2); }

.loading-cell, .empty-cell {
  text-align: center;
  padding: 2rem !important;
  color: var(--text-dim);
}

.spin-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
