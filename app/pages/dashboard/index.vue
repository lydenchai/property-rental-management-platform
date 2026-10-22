<script setup lang="ts">
import { 
  Building, 
  Key, 
  CreditCard, 
  Wrench, 
  FileText, 
  ClipboardList, 
  CheckCircle2, 
  Plus, 
  ArrowRight,
  ShieldCheck,
  Users,
  BarChart3,
  Clock,
  AlertTriangle,
  RefreshCw
} from '@lucide/vue';
import { useAuth } from '../../composables/useAuth';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  title: 'Dashboard Overview',
});

const { user, userRole, isAdmin, isLandlord, isTenant, isTechnician } = useAuth();

const metrics = ref<any>(null);
const isLoading = ref(true);

const fetchMetrics = async () => {
  isLoading.value = true;
  try {
    const res = await $fetch<any>('/api/v1/dashboard/metrics');
    if (res?.success) {
      metrics.value = res.data;
    }
  } catch (err) {
    console.error('Failed to load metrics:', err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchMetrics();
});
</script>

<template>
  <div class="dashboard-page">
    <!-- Overview Header -->
    <div class="welcome-card card-flat">
      <div class="welcome-content">
        <h1>Overview</h1>
        <p class="welcome-desc">
          <template v-if="isAdmin">
            System health, platform tenancy, billing reconciliations, and platform audit overview.
          </template>
          <template v-else-if="isLandlord">
            Real estate portfolio performance, tenant occupancy, and monthly rental receipts.
          </template>
          <template v-else-if="isTenant">
            Active lease summary, monthly rental statements, and maintenance tickets.
          </template>
          <template v-else-if="isTechnician">
            Assigned maintenance work orders, repair inspection notes, and schedule.
          </template>
        </p>
      </div>

      <div class="quick-action-panel gap-2">
        <button @click="fetchMetrics" class="btn-secondary" title="Refresh Metrics">
          <RefreshCw :size="14" :class="{ 'spin-icon': isLoading }" />
          <span>Refresh</span>
        </button>
        <NuxtLink v-if="isLandlord || isAdmin" to="/dashboard/properties" class="btn-primary">
          <Plus :size="15" />
          <span>Add Property</span>
        </NuxtLink>
        <NuxtLink v-if="isTenant" to="/dashboard/maintenance" class="btn-primary">
          <Wrench :size="15" />
          <span>Request Repair</span>
        </NuxtLink>
        <NuxtLink v-if="isTechnician" to="/dashboard/maintenance" class="btn-primary">
          <ClipboardList :size="15" />
          <span>View Assigned Tasks</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Metrics Cards Grid -->
    <div class="metrics-grid">
      <!-- Admin Metrics -->
      <template v-if="isAdmin">
        <div class="metric-card card-flat">
          <div class="metric-icon bg-indigo">
            <Building :size="20" />
          </div>
          <div class="metric-info">
            <span class="metric-label">Properties / Units</span>
            <div class="metric-val">
              <span v-if="isLoading" class="skeleton-val">--</span>
              <span v-else>{{ metrics?.propertiesCount ?? 0 }} / {{ metrics?.unitsCount ?? 0 }}</span>
            </div>
            <span class="metric-sub text-muted">Platform listings</span>
          </div>
        </div>

        <div class="metric-card card-flat">
          <div class="metric-icon bg-emerald">
            <Key :size="20" />
          </div>
          <div class="metric-info">
            <span class="metric-label">Occupancy Rate</span>
            <div class="metric-val">
              <span v-if="isLoading" class="skeleton-val">--</span>
              <span v-else>{{ metrics?.occupancyRate ?? 0 }}%</span>
            </div>
            <span class="metric-sub text-emerald">System average</span>
          </div>
        </div>

        <div class="metric-card card-flat">
          <div class="metric-icon bg-cyan">
            <CreditCard :size="20" />
          </div>
          <div class="metric-info">
            <span class="metric-label">Total Revenue</span>
            <div class="metric-val">
              <span v-if="isLoading" class="skeleton-val">--</span>
              <span v-else>{{ metrics?.totalRevenue ?? '$0.00' }}</span>
            </div>
            <span class="metric-sub text-emerald">Platform collections</span>
          </div>
        </div>

        <div class="metric-card card-flat">
          <div class="metric-icon bg-purple">
            <Users :size="20" />
          </div>
          <div class="metric-info">
            <span class="metric-label">Active Users</span>
            <div class="metric-val">
              <span v-if="isLoading" class="skeleton-val">--</span>
              <span v-else>{{ metrics?.activeUsersCount ?? 0 }}</span>
            </div>
            <span class="metric-sub text-muted">Across all roles</span>
          </div>
        </div>

        <div class="metric-card card-flat">
          <div class="metric-icon bg-amber">
            <Wrench :size="20" />
          </div>
          <div class="metric-info">
            <span class="metric-label">Open Maintenance</span>
            <div class="metric-val">
              <span v-if="isLoading" class="skeleton-val">--</span>
              <span v-else>{{ metrics?.openMaintenanceCount ?? 0 }}</span>
            </div>
            <span class="metric-sub text-amber">Active tickets</span>
          </div>
        </div>

        <div class="metric-card card-flat">
          <div class="metric-icon bg-zinc">
            <ShieldCheck :size="20" />
          </div>
          <div class="metric-info">
            <span class="metric-label">Audit Events</span>
            <div class="metric-val">
              <span v-if="isLoading" class="skeleton-val">--</span>
              <span v-else>{{ metrics?.totalAuditLogs ?? 0 }}</span>
            </div>
            <span class="metric-sub text-muted">Recorded logs</span>
          </div>
        </div>
      </template>

      <!-- Landlord Metrics -->
      <template v-else-if="isLandlord">
        <div class="metric-card card-flat">
          <div class="metric-icon bg-indigo">
            <Building :size="20" />
          </div>
          <div class="metric-info">
            <span class="metric-label">Managed Properties</span>
            <div class="metric-val">
              <span v-if="isLoading" class="skeleton-val">--</span>
              <span v-else>{{ metrics?.managedProperties ?? 0 }}</span>
            </div>
            <span class="metric-sub text-muted">{{ metrics?.managedUnits ?? 0 }} total units</span>
          </div>
        </div>

        <div class="metric-card card-flat">
          <div class="metric-icon bg-emerald">
            <Key :size="20" />
          </div>
          <div class="metric-info">
            <span class="metric-label">Occupancy Rate</span>
            <div class="metric-val">
              <span v-if="isLoading" class="skeleton-val">--</span>
              <span v-else>{{ metrics?.occupancyRate ?? 0 }}%</span>
            </div>
            <span class="metric-sub text-emerald">Portfolio average</span>
          </div>
        </div>

        <div class="metric-card card-flat">
          <div class="metric-icon bg-cyan">
            <CreditCard :size="20" />
          </div>
          <div class="metric-info">
            <span class="metric-label">Revenue Collected</span>
            <div class="metric-val">
              <span v-if="isLoading" class="skeleton-val">--</span>
              <span v-else>{{ metrics?.monthlyCollected ?? '$0.00' }}</span>
            </div>
            <span class="metric-sub text-emerald">Completed payments</span>
          </div>
        </div>

        <div class="metric-card card-flat">
          <div class="metric-icon bg-rose">
            <CreditCard :size="20" />
          </div>
          <div class="metric-info">
            <span class="metric-label">Outstanding Balance</span>
            <div class="metric-val">
              <span v-if="isLoading" class="skeleton-val">--</span>
              <span v-else>{{ metrics?.outstandingRent ?? '$0.00' }}</span>
            </div>
            <span class="metric-sub text-amber">Pending & overdue</span>
          </div>
        </div>

        <div class="metric-card card-flat">
          <div class="metric-icon bg-amber">
            <Wrench :size="20" />
          </div>
          <div class="metric-info">
            <span class="metric-label">Open Maintenance</span>
            <div class="metric-val">
              <span v-if="isLoading" class="skeleton-val">--</span>
              <span v-else>{{ metrics?.openMaintenanceCount ?? 0 }}</span>
            </div>
            <span class="metric-sub text-amber">Tickets in progress</span>
          </div>
        </div>
      </template>

      <!-- Tenant Metrics -->
      <template v-else-if="isTenant">
        <div class="metric-card card-flat">
          <div class="metric-icon bg-indigo">
            <FileText :size="20" />
          </div>
          <div class="metric-info">
            <span class="metric-label">Active Lease</span>
            <div class="metric-val">
              <span v-if="isLoading" class="skeleton-val">--</span>
              <span v-else-if="metrics?.hasActiveLease">Unit {{ metrics.leaseDetails?.unitNumber }}</span>
              <span v-else>No Active Lease</span>
            </div>
            <span class="metric-sub text-emerald" v-if="metrics?.hasActiveLease">
              ${{ metrics.leaseDetails?.rentAmount }}/mo
            </span>
            <span class="metric-sub text-muted" v-else>Browse available units</span>
          </div>
        </div>

        <div class="metric-card card-flat">
          <div class="metric-icon bg-emerald">
            <CreditCard :size="20" />
          </div>
          <div class="metric-info">
            <span class="metric-label">Next Rent Due</span>
            <div class="metric-val">
              <span v-if="isLoading" class="skeleton-val">--</span>
              <span v-else-if="metrics?.nextRentDue">${{ metrics.nextRentDue.remaining?.toFixed(2) ?? '0.00' }}</span>
              <span v-else>$0.00</span>
            </div>
            <span class="metric-sub text-amber" v-if="metrics?.nextRentDue">
              Due {{ new Date(metrics.nextRentDue.dueDate).toLocaleDateString() }}
            </span>
            <span class="metric-sub text-emerald" v-else>All settled</span>
          </div>
        </div>

        <div class="metric-card card-flat">
          <div class="metric-icon bg-amber">
            <Wrench :size="20" />
          </div>
          <div class="metric-info">
            <span class="metric-label">Maintenance Tickets</span>
            <div class="metric-val">
              <span v-if="isLoading" class="skeleton-val">--</span>
              <span v-else>{{ metrics?.activeMaintenanceCount ?? 0 }} Active</span>
            </div>
            <span class="metric-sub text-indigo">Track repair updates</span>
          </div>
        </div>

        <div class="metric-card card-flat">
          <div class="metric-icon bg-purple">
            <ClipboardList :size="20" />
          </div>
          <div class="metric-info">
            <span class="metric-label">Applications</span>
            <div class="metric-val">
              <span v-if="isLoading" class="skeleton-val">--</span>
              <span v-else>{{ metrics?.applicationsCount ?? 0 }}</span>
            </div>
            <span class="metric-sub text-muted">Submitted applications</span>
          </div>
        </div>
      </template>

      <!-- Technician Metrics -->
      <template v-else-if="isTechnician">
        <div class="metric-card card-flat">
          <div class="metric-icon bg-amber">
            <Wrench :size="20" />
          </div>
          <div class="metric-info">
            <span class="metric-label">Assigned Orders</span>
            <div class="metric-val">
              <span v-if="isLoading" class="skeleton-val">--</span>
              <span v-else>{{ metrics?.assignedCount ?? 0 }} Pending</span>
            </div>
            <span class="metric-sub text-amber">Ready for dispatch</span>
          </div>
        </div>

        <div class="metric-card card-flat">
          <div class="metric-icon bg-indigo">
            <Clock :size="20" />
          </div>
          <div class="metric-info">
            <span class="metric-label">In Progress</span>
            <div class="metric-val">
              <span v-if="isLoading" class="skeleton-val">--</span>
              <span v-else>{{ metrics?.inProgressCount ?? 0 }} Active</span>
            </div>
            <span class="metric-sub text-indigo">Under repair</span>
          </div>
        </div>

        <div class="metric-card card-flat">
          <div class="metric-icon bg-emerald">
            <CheckCircle2 :size="20" />
          </div>
          <div class="metric-info">
            <span class="metric-label">Completed Repairs</span>
            <div class="metric-val">
              <span v-if="isLoading" class="skeleton-val">--</span>
              <span v-else>{{ metrics?.completedCount ?? 0 }} Closed</span>
            </div>
            <span class="metric-sub text-emerald">Verified resolution</span>
          </div>
        </div>

        <div class="metric-card card-flat">
          <div class="metric-icon bg-rose">
            <AlertTriangle :size="20" />
          </div>
          <div class="metric-info">
            <span class="metric-label">Emergency Priority</span>
            <div class="metric-val">
              <span v-if="isLoading" class="skeleton-val">--</span>
              <span v-else>{{ metrics?.emergencyCount ?? 0 }}</span>
            </div>
            <span class="metric-sub text-rose">Urgent attention</span>
          </div>
        </div>
      </template>
    </div>

    <!-- Quick Navigation Workflow Links -->
    <div class="workflow-section">
      <h3 class="section-title">Core Operations & Workflows</h3>
      <div class="workflow-grid">
        <NuxtLink v-if="isLandlord || isAdmin" to="/dashboard/properties" class="workflow-card card-flat">
          <div class="wf-icon bg-indigo">
            <Building :size="20" />
          </div>
          <div class="wf-content">
            <h4>Property & Unit Management</h4>
            <p>Create listings, configure unit amenities, set rental pricing, and update availability.</p>
          </div>
          <ArrowRight :size="16" class="wf-arrow" />
        </NuxtLink>

        <NuxtLink v-if="isLandlord || isAdmin" to="/dashboard/reports" class="workflow-card card-flat">
          <div class="wf-icon bg-emerald">
            <BarChart3 :size="20" />
          </div>
          <div class="wf-content">
            <h4>Occupancy & Financial Analytics</h4>
            <p>Inspect portfolio occupancy rates, revenue collection performance, and unit breakdowns.</p>
          </div>
          <ArrowRight :size="16" class="wf-arrow" />
        </NuxtLink>

        <NuxtLink v-if="isLandlord || isAdmin || isTenant" to="/dashboard/applications" class="workflow-card card-flat">
          <div class="wf-icon bg-cyan">
            <ClipboardList :size="20" />
          </div>
          <div class="wf-content">
            <h4>Rental Applications</h4>
            <p>Review background checks, approve/reject tenant submissions, and manage leases.</p>
          </div>
          <ArrowRight :size="16" class="wf-arrow" />
        </NuxtLink>

        <NuxtLink v-if="!isTechnician" to="/dashboard/invoices" class="workflow-card card-flat">
          <div class="wf-icon bg-purple">
            <CreditCard :size="20" />
          </div>
          <div class="wf-content">
            <h4>Rent Invoices & Payment Tracking</h4>
            <p>Issue monthly rental statements, view payment receipts, and reconcile payment records.</p>
          </div>
          <ArrowRight :size="16" class="wf-arrow" />
        </NuxtLink>

        <NuxtLink to="/dashboard/maintenance" class="workflow-card card-flat">
          <div class="wf-icon bg-amber">
            <Wrench :size="20" />
          </div>
          <div class="wf-content">
            <h4>Maintenance Request Management</h4>
            <p>Dispatch technicians, monitor repairs in real-time, and confirm work completion.</p>
          </div>
          <ArrowRight :size="16" class="wf-arrow" />
        </NuxtLink>

        <NuxtLink v-if="isAdmin" to="/dashboard/audit-logs" class="workflow-card card-flat">
          <div class="wf-icon bg-zinc">
            <ShieldCheck :size="20" />
          </div>
          <div class="wf-content">
            <h4>System Audit Logs</h4>
            <p>Inspect immutable event logs, user activities, status changes, and data audits.</p>
          </div>
          <ArrowRight :size="16" class="wf-arrow" />
        </NuxtLink>

        <NuxtLink v-if="isAdmin" to="/dashboard/users" class="workflow-card card-flat">
          <div class="wf-icon bg-indigo">
            <Users :size="20" />
          </div>
          <div class="wf-content">
            <h4>User Management</h4>
            <p>Review registered accounts, toggle user active/suspended status, and manage roles.</p>
          </div>
          <ArrowRight :size="16" class="wf-arrow" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.welcome-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.5rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 1.5rem 1.75rem;
}

@media (min-width: 768px) {
  .welcome-card {
    flex-direction: row;
    align-items: center;
  }
}

.welcome-content {
  max-width: 650px;
}

.role-badge-row {
  margin-bottom: 0.5rem;
}

.welcome-content h1 {
  font-size: 1.65rem;
  margin-bottom: 0.35rem;
}

.welcome-desc {
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.5;
}

.quick-action-panel {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
}

.metric-icon {
  width: 42px;
  height: 42px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.bg-indigo { background: var(--primary-subtle); color: var(--color-indigo-accent); border: 1px solid rgba(99, 102, 241, 0.2); }
.bg-emerald { background: var(--accent-emerald-subtle); color: var(--color-emerald-accent); border: 1px solid rgba(16, 185, 129, 0.2); }
.bg-cyan { background: var(--accent-sky-subtle); color: var(--color-cyan-accent); border: 1px solid rgba(2, 132, 199, 0.2); }
.bg-amber { background: var(--accent-amber-subtle); color: var(--color-amber-accent); border: 1px solid rgba(245, 158, 11, 0.2); }
.bg-purple { background: rgba(168, 85, 247, 0.1); color: var(--color-purple-accent); border: 1px solid rgba(168, 85, 247, 0.2); }
.bg-zinc { background: rgba(148, 163, 184, 0.1); color: var(--text-dim); border: 1px solid rgba(148, 163, 184, 0.2); }
.bg-rose { background: var(--accent-rose-subtle); color: var(--color-rose-accent); border: 1px solid rgba(244, 63, 94, 0.2); }

.refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  padding: 0.7rem 0.75rem;
}

.spin-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.skeleton-val {
  color: var(--text-dim);
  opacity: 0.5;
}

.metric-info {
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-dim);
  letter-spacing: 0.05em;
}

.metric-val {
  font-size: 1.45rem;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.2;
  margin: 0.1rem 0;
}

.metric-sub {
  font-size: 0.75rem;
}

.text-emerald { color: var(--color-emerald-accent); }
.text-amber { color: var(--color-amber-accent); }
.text-indigo { color: var(--color-indigo-accent); }
.text-rose { color: var(--color-rose-accent); }
.text-muted { color: var(--text-dim); }

.workflow-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-main);
}

.workflow-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}

.workflow-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.workflow-card:hover {
  background: var(--bg-surface-hover);
  border-color: var(--border-default);
}

.wf-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.wf-content {
  flex: 1;
}

.wf-content h4 {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.2rem;
}

.wf-content p {
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.wf-arrow {
  margin-left: auto;
  color: var(--text-dim);
  flex-shrink: 0;
  transition: color 0.15s ease;
}

.workflow-card:hover .wf-arrow {
  color: var(--text-main);
}
</style>
