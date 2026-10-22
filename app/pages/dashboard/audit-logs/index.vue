<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  ShieldCheck, 
  History, 
  User, 
  Calendar, 
  Filter, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  X, 
  Terminal,
  Activity
} from '@lucide/vue';
import { useAuth } from '../../../composables/useAuth';
import type { ApiResponse } from '../../../../shared/types/api';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  title: 'System Audit Logs',
});

const { isAdmin } = useAuth();

interface AuditLogItem {
  id: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: any | null;
  newValues?: any | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}

const logs = ref<AuditLogItem[]>([]);
const isLoading = ref(true);
const errorMessage = ref<string | null>(null);

// Filters
const actionFilter = ref('ALL');
const entityFilter = ref('ALL');
const searchQuery = ref('');

// Payload modal
const selectedLog = ref<AuditLogItem | null>(null);

async function loadAuditLogs() {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    const res = await $fetch<ApiResponse<{ logs: AuditLogItem[] }>>('/api/v1/admin/audit-logs');
    if (res.success && res.data) {
      logs.value = res.data.logs;
    } else {
      errorMessage.value = res.error?.message || 'Failed to load audit logs';
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.error?.message || err?.message || 'Error fetching audit logs';
  } finally {
    isLoading.value = false;
  }
}

const filteredLogs = computed(() => {
  return logs.value.filter((log) => {
    if (actionFilter.value !== 'ALL' && log.action !== actionFilter.value) {
      return false;
    }
    if (entityFilter.value !== 'ALL' && log.entityType !== entityFilter.value) {
      return false;
    }
    if (!searchQuery.value.trim()) return true;

    const q = searchQuery.value.toLowerCase();
    const act = log.action.toLowerCase();
    const ent = log.entityType.toLowerCase();
    const entId = log.entityId.toLowerCase();
    const userName = log.user?.fullName?.toLowerCase() || '';
    const userEmail = log.user?.email?.toLowerCase() || '';
    const ip = log.ipAddress?.toLowerCase() || '';

    return act.includes(q) || ent.includes(q) || entId.includes(q) || userName.includes(q) || userEmail.includes(q) || ip.includes(q);
  });
});

onMounted(() => {
  loadAuditLogs();
});
</script>

<template>
  <div class="audit-logs-page">
    <!-- Top Bar -->
    <div class="page-top-bar">
      <div>
        <h1>System Audit Logs</h1>
        <p class="subtitle">
          Cryptographically auditable transaction ledger recording security, administrative, leasing, and billing events.
        </p>
      </div>
      <div class="admin-shield-badge">
        <ShieldCheck :size="15" />
        <span>Admin Governance Log</span>
      </div>
    </div>

    <div v-if="errorMessage" class="alert-error">
      <AlertCircle :size="16" />
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Filter & Search Toolbar Shell -->
    <div class="table-shell card-flat">
      <div class="table-toolbar">
        <div class="filter-controls">
          <div class="select-wrap">
            <Filter :size="13" class="filter-icon" />
            <select v-model="actionFilter" class="filter-select">
              <option value="ALL">All Actions</option>
              <option value="AUTH_LOGIN">Login Events</option>
              <option value="USER_STATUS_CHANGE">User Status Changes</option>
              <option value="APPLICATION_APPROVED">Application Approvals</option>
              <option value="LEASE_SIGNED">Lease Signatures</option>
              <option value="PAYMENT_RECORDED">Payment Records</option>
              <option value="MAINTENANCE_DISPATCHED">Maintenance Dispatched</option>
              <option value="MAINTENANCE_RESOLVED">Maintenance Resolved</option>
            </select>
          </div>

          <div class="select-wrap">
            <select v-model="entityFilter" class="filter-select">
              <option value="ALL">All Entities</option>
              <option value="User">User</option>
              <option value="RentalApplication">Rental Application</option>
              <option value="Lease">Lease Contract</option>
              <option value="Invoice">Invoice</option>
              <option value="PaymentRecord">Payment Record</option>
              <option value="MaintenanceRequest">Maintenance Request</option>
            </select>
          </div>
        </div>

        <div class="search-wrap">
          <Search :size="14" class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by action, user, entity ID, or IP..."
            class="table-search-input"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading audit trail records...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredLogs.length === 0" class="empty-state">
        <History :size="32" class="empty-icon" />
        <h4>No audit log entries found</h4>
        <p>System events will appear here as transactions and administrative actions are performed.</p>
      </div>

      <!-- Audit Logs Table -->
      <div v-else class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Timestamp (UTC)</th>
              <th>Acting User</th>
              <th>Event Action</th>
              <th>Entity</th>
              <th>Entity Reference</th>
              <th>IP Address</th>
              <th class="text-right">Payload</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in filteredLogs" :key="log.id">
              <td>
                <div class="timestamp-cell font-mono text-xs">
                  <span>{{ new Date(log.createdAt).toLocaleDateString() }}</span>
                  <span class="text-dim">{{ new Date(log.createdAt).toLocaleTimeString() }}</span>
                </div>
              </td>
              <td>
                <div class="user-cell">
                  <span class="font-semibold">{{ log.user?.fullName || 'System Event' }}</span>
                  <span class="text-dim text-xs">{{ log.user?.email || 'N/A' }}</span>
                </div>
              </td>
              <td>
                <span
                  class="action-badge font-mono"
                  :class="{
                    'action-auth': log.action.startsWith('AUTH'),
                    'action-lease': log.action.includes('LEASE') || log.action.includes('APPLICATION'),
                    'action-payment': log.action.includes('PAYMENT'),
                    'action-maint': log.action.includes('MAINTENANCE'),
                  }"
                >
                  {{ log.action }}
                </span>
              </td>
              <td>
                <span class="entity-badge">{{ log.entityType }}</span>
              </td>
              <td>
                <span class="font-mono text-xs text-dim">{{ log.entityId }}</span>
              </td>
              <td>
                <span class="font-mono text-xs text-dim">{{ log.ipAddress || '127.0.0.1' }}</span>
              </td>
              <td class="text-right">
                <button
                  @click="selectedLog = log"
                  class="btn-secondary btn-sm"
                  title="View Payload Diffs"
                >
                  <FileText :size="13" />
                  <span>Inspect</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Payload Inspector Modal -->
    <div v-if="selectedLog" class="modal-backdrop">
      <div class="modal-card card-flat" style="max-width: 650px;">
        <div class="modal-header">
          <div class="modal-title-row">
            <Terminal :size="16" class="text-indigo" />
            <h3>Audit Record Inspection</h3>
          </div>
          <button @click="selectedLog = null" class="modal-close">&times;</button>
        </div>

        <div class="modal-body">
          <div class="contract-summary">
            <div><strong>Log ID:</strong> <span class="font-mono">{{ selectedLog.id }}</span></div>
            <div><strong>Action:</strong> <span class="font-mono font-semibold">{{ selectedLog.action }}</span></div>
            <div><strong>Target Entity:</strong> {{ selectedLog.entityType }} (ID: <span class="font-mono">{{ selectedLog.entityId }}</span>)</div>
            <div><strong>Acting User:</strong> {{ selectedLog.user?.fullName }} ({{ selectedLog.user?.email }})</div>
            <div><strong>Timestamp:</strong> {{ new Date(selectedLog.createdAt).toUTCString() }}</div>
            <div><strong>Client IP:</strong> <span class="font-mono">{{ selectedLog.ipAddress || '127.0.0.1' }}</span></div>
            <div v-if="selectedLog.userAgent"><strong>User Agent:</strong> <span class="text-xs text-dim">{{ selectedLog.userAgent }}</span></div>
          </div>

          <div class="payload-diff-grid">
            <div class="payload-box">
              <span class="payload-title">Previous State (Old Values):</span>
              <pre class="json-code">{{ selectedLog.oldValues ? JSON.stringify(selectedLog.oldValues, null, 2) : 'null (initial state)' }}</pre>
            </div>

            <div class="payload-box">
              <span class="payload-title">Mutated State (New Values):</span>
              <pre class="json-code text-emerald">{{ selectedLog.newValues ? JSON.stringify(selectedLog.newValues, null, 2) : 'null' }}</pre>
            </div>
          </div>

          <div class="modal-actions">
            <button @click="selectedLog = null" class="btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.audit-logs-page {
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

.admin-shield-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.25);
  color: var(--primary);
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.4rem 0.85rem;
  border-radius: var(--radius-sm);
}

.table-shell {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-controls {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.select-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.filter-icon {
  position: absolute;
  left: 0.65rem;
  color: var(--text-dim);
  pointer-events: none;
}

.filter-select {
  background: var(--bg-input);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  color: var(--text-main);
  font-size: 0.8rem;
  padding: 0.45rem 0.75rem 0.45rem 1.8rem;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: var(--border-focus);
}

.search-wrap {
  position: relative;
  width: 100%;
  max-width: 320px;
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

.timestamp-cell,
.user-cell {
  display: flex;
  flex-direction: column;
}

.action-badge {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-sm);
  background: rgba(148, 163, 184, 0.1);
  color: var(--text-main);
}

.action-badge.action-auth {
  background: rgba(59, 130, 246, 0.12);
  color: #60a5fa;
}

.action-badge.action-lease {
  background: rgba(99, 102, 241, 0.12);
  color: var(--primary);
}

.action-badge.action-payment {
  background: var(--accent-emerald-subtle);
  color: #34d399;
}

.action-badge.action-maint {
  background: rgba(245, 158, 11, 0.12);
  color: #fbbf24;
}

.entity-badge {
  font-size: 0.75rem;
  color: var(--text-dim);
  background: var(--bg-canvas);
  border: 1px solid var(--border-subtle);
  padding: 0.1rem 0.4rem;
  border-radius: var(--radius-sm);
}

.text-right {
  text-align: right;
}

.btn-sm {
  padding: 0.35rem 0.65rem;
  font-size: 0.8rem;
  gap: 0.3rem;
}

.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.font-semibold {
  font-weight: 600;
}

.text-xs {
  font-size: 0.75rem;
}

.text-dim {
  color: var(--text-dim);
}

.text-emerald {
  color: #34d399;
}

.text-indigo {
  color: var(--primary);
}

/* Modal */
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

.modal-title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.payload-diff-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.payload-box {
  background: var(--bg-input);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.payload-title {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-dim);
}

.json-code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.75rem;
  line-height: 1.4;
  white-space: pre-wrap;
  color: var(--text-muted);
  max-height: 180px;
  overflow-y: auto;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

/* Empty & Loading */
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

@media (max-width: 640px) {
  .payload-diff-grid {
    grid-template-columns: 1fr;
  }
}
</style>
