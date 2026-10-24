<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
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
import { useAuditLogStore } from '../../../stores/audit-log.store';
import type { AuditLogItem } from '~~/shared/types';
import AppTableCard from '../../../components/common/AppTableCard.vue';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  title: 'System Audit Logs',
});

const { t } = useI18n();
const { isAdmin } = useAuth();
const auditLogStore = useAuditLogStore();

const {
  logs,
  isLoading,
  errorMessage,
  totalLogs,
} = auditLogStore;

const {
  fetchAuditLogs,
  loadAuditLogs,
} = auditLogStore;

// Filters
const actionFilter = ref('ALL');
const entityFilter = ref('ALL');
const searchQuery = ref('');

// Payload modal
const selectedLog = ref<AuditLogItem | null>(null);

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

// Pagination state
const currentPage = ref(1);
const pageSize = ref(10);

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredLogs.value.slice(start, start + pageSize.value);
});

watch([actionFilter, entityFilter, searchQuery], () => {
  currentPage.value = 1;
});

function getActionBadgeClass(action: string): string {
  if (action.startsWith('AUTH')) return 'badge-landlord';
  if (action.includes('LEASE') || action.includes('APPLICATION')) return 'badge-info';
  if (action.includes('PAYMENT') || action.includes('INVOICE')) return 'badge-success';
  if (action.includes('MAINTENANCE')) return 'badge-warning';
  return 'badge-subtle';
}

onMounted(() => {
  loadAuditLogs();
});
</script>

<template>
  <div class="audit-logs-page">
    <!-- Top Bar -->
    <div class="page-top-bar">
      <div>
        <h1>{{ t('audit_logs.title') }}</h1>
        <p class="subtitle">
          {{ t('audit_logs.subtitle') }}
        </p>
      </div>
      <div class="admin-shield-badge">
        <ShieldCheck :size="15" />
        <span>{{ t('audit_logs.admin_badge') }}</span>
      </div>
    </div>

    <div v-if="errorMessage" class="alert-error">
      <AlertCircle :size="16" />
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Audit Logs Table using shared AppTableCard -->
    <AppTableCard v-model:search="searchQuery" :search-placeholder="t('audit_logs.search_placeholder')"
      :is-loading="isLoading" :is-empty="filteredLogs.length === 0" :empty-title="t('audit_logs.empty_title')"
      :empty-description="t('audit_logs.empty_desc')"
      :empty-icon="History" v-model:current-page="currentPage" v-model:page-size="pageSize"
      :total-items="filteredLogs.length" :item-name="t('common.records')">
      <template #toolbar-start>
        <div class="filter-controls">
          <div class="select-wrap">
            <Filter :size="13" class="filter-icon" />
            <select v-model="actionFilter" class="filter-select">
              <option value="ALL">{{ t('audit_logs.filter_all_actions') }}</option>
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
              <option value="ALL">{{ t('audit_logs.filter_all_entities') }}</option>
              <option value="User">User</option>
              <option value="RentalApplication">Rental Application</option>
              <option value="Lease">Lease Contract</option>
              <option value="Invoice">Invoice</option>
              <option value="PaymentRecord">Payment Record</option>
              <option value="MaintenanceRequest">Maintenance Request</option>
            </select>
          </div>
        </div>
      </template>

      <table class="data-table">
        <thead>
          <tr>
            <th>{{ t('audit_logs.col_timestamp') }}</th>
            <th>{{ t('audit_logs.col_user') }}</th>
            <th>{{ t('audit_logs.col_action') }}</th>
            <th>{{ t('audit_logs.col_entity') }}</th>
            <th>{{ t('audit_logs.col_entity_ref') }}</th>
            <th>{{ t('audit_logs.col_ip') }}</th>
            <th class="text-right">{{ t('audit_logs.col_payload') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in paginatedLogs" :key="log.id">
            <td>
              <div class="timestamp-cell font-mono">
                <span class="timestamp-date">{{ new Date(log.createdAt).toLocaleDateString() }}</span>
                <span class="timestamp-time text-dim">{{ new Date(log.createdAt).toLocaleTimeString() }}</span>
              </div>
            </td>
            <td>
              <div class="user-cell">
                <span class="user-name">{{ log.user?.fullName || 'System Event' }}</span>
                <span class="user-email text-dim font-mono">{{ log.user?.email || 'N/A' }}</span>
              </div>
            </td>
            <td>
              <span class="badge badge-pill font-mono badge-action" :class="getActionBadgeClass(log.action)">
                <span class="badge-dot"></span>
                <span>{{ log.action }}</span>
              </span>
            </td>
            <td>
              <span class="badge badge-pill badge-subtle">
                <span class="badge-dot"></span>
                <span>{{ log.entityType }}</span>
              </span>
            </td>
            <td>
              <span class="font-mono entity-ref">{{ log.entityId }}</span>
            </td>
            <td>
              <span class="font-mono ip-cell">{{ log.ipAddress || '127.0.0.1' }}</span>
            </td>
            <td class="text-right">
              <button @click="selectedLog = log" class="btn-secondary btn-inspect" :title="t('audit_logs.inspect')">
                <FileText :size="14" />
                <span>{{ t('audit_logs.inspect') }}</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </AppTableCard>

    <!-- Payload Inspector Modal -->
    <div v-if="selectedLog" class="modal-backdrop">
      <div class="modal-card card-flat" style="max-width: 650px;">
        <div class="modal-header">
          <div class="modal-title-row">
            <Terminal :size="16" class="text-indigo" />
            <h3>{{ t('audit_logs.modal_title') }}</h3>
          </div>
          <button @click="selectedLog = null" class="modal-close">&times;</button>
        </div>

        <div class="modal-body">
          <div class="contract-summary">
            <div><strong>{{ t('audit_logs.log_id') }}:</strong> <span class="font-mono text-dim">{{ selectedLog.id }}</span></div>
            <div class="modal-badge-row">
              <strong>{{ t('audit_logs.action') }}:</strong> 
              <span class="badge badge-pill font-mono badge-action" :class="getActionBadgeClass(selectedLog.action)">
                <span class="badge-dot"></span>
                <span>{{ selectedLog.action }}</span>
              </span>
            </div>
            <div class="modal-badge-row">
              <strong>{{ t('audit_logs.target_entity') }}:</strong> 
              <span class="badge badge-pill badge-subtle">
                <span class="badge-dot"></span>
                <span>{{ selectedLog.entityType }}</span>
              </span>
              <span class="text-xs text-dim font-mono ml-1">(ID: {{ selectedLog.entityId }})</span>
            </div>
            <div><strong>{{ t('audit_logs.acting_user') }}:</strong> {{ selectedLog.user?.fullName }} ({{ selectedLog.user?.email }})</div>
            <div><strong>{{ t('audit_logs.timestamp') }}:</strong> {{ new Date(selectedLog.createdAt).toUTCString() }}</div>
            <div><strong>{{ t('audit_logs.client_ip') }}:</strong> <span class="font-mono">{{ selectedLog.ipAddress || '127.0.0.1' }}</span>
            </div>
            <div v-if="selectedLog.userAgent"><strong>{{ t('audit_logs.user_agent') }}:</strong> <span class="text-xs text-dim">{{
              selectedLog.userAgent }}</span></div>
          </div>

          <div class="payload-diff-grid">
            <div class="payload-box">
              <span class="payload-title">{{ t('audit_logs.old_values') }}:</span>
              <pre class="json-code">{{ selectedLog.oldValues ? JSON.stringify(selectedLog.oldValues, null, 2) : 'null (initial state)' }}</pre>
            </div>

            <div class="payload-box">
              <span class="payload-title">{{ t('audit_logs.new_values') }}:</span>
              <pre class="json-code text-emerald">{{ selectedLog.newValues ? JSON.stringify(selectedLog.newValues, null, 2)
                : 'null' }}</pre>
            </div>
          </div>

          <div class="modal-actions">
            <button @click="selectedLog = null" class="btn-secondary">
              {{ t('common.close') }}
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
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  color: var(--text-main);
  font-size: 0.825rem;
  padding: 0.45rem 0.85rem 0.45rem 1.8rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.filter-select:hover {
  border-color: var(--border-default);
  background: var(--bg-surface-hover);
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
  gap: 0.15rem;
}

.timestamp-date {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-main);
}

.timestamp-time {
  font-size: 0.775rem;
  color: var(--text-dim);
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-main);
}

.user-email {
  font-size: 0.775rem;
  color: var(--text-dim);
}

.badge-action {
  text-transform: none !important;
  font-size: 0.775rem;
  letter-spacing: 0.02em;
}

.modal-badge-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.entity-ref,
.ip-cell {
  font-size: 0.825rem;
  color: var(--text-muted);
}

.btn-inspect {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.38rem 0.75rem;
  font-size: 0.825rem;
  font-weight: 500;
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
  font-size: 0.775rem;
}

.text-sm {
  font-size: 0.875rem;
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

.data-table th {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 0.85rem 1.25rem;
}

.data-table td {
  font-size: 0.875rem;
  padding: 0.95rem 1.25rem;
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
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-dim);
  letter-spacing: 0.04em;
}

.json-code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.825rem;
  line-height: 1.5;
  white-space: pre-wrap;
  color: var(--text-muted);
  max-height: 220px;
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
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .payload-diff-grid {
    grid-template-columns: 1fr;
  }
}
</style>
