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
  Activity,
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

const { logs, isLoading, errorMessage, totalLogs } = auditLogStore;

const { fetchAuditLogs, loadAuditLogs } = auditLogStore;

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

    return (
      act.includes(q) ||
      ent.includes(q) ||
      entId.includes(q) ||
      userName.includes(q) ||
      userEmail.includes(q) ||
      ip.includes(q)
    );
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
  if (action.startsWith('AUTH'))
    return 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
  if (action.includes('LEASE') || action.includes('APPLICATION'))
    return 'bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800';
  if (action.includes('PAYMENT') || action.includes('INVOICE'))
    return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
  if (action.includes('MAINTENANCE'))
    return 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
  return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700';
}

onMounted(() => {
  loadAuditLogs();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Top Bar -->
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {{ t('audit_logs.title') }}
        </h1>
        <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {{ t('audit_logs.subtitle') }}
        </p>
      </div>
      <div
        class="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400"
      >
        <ShieldCheck :size="16" />
        <span>{{ t('audit_logs.admin_badge') }}</span>
      </div>
    </div>

    <div
      v-if="errorMessage"
      class="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300"
    >
      <AlertCircle :size="18" class="shrink-0 text-rose-600 dark:text-rose-400" />
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Audit Logs Table using shared AppTableCard -->
    <AppTableCard
      v-model:search="searchQuery"
      :search-placeholder="t('audit_logs.search_placeholder')"
      :is-loading="isLoading"
      :is-empty="filteredLogs.length === 0"
      :empty-title="t('audit_logs.empty_title')"
      :empty-description="t('audit_logs.empty_desc')"
      :empty-icon="History"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total-items="filteredLogs.length"
      :item-name="t('common.records')"
    >
      <template #toolbar-start>
        <div class="flex flex-wrap items-center gap-2">
          <div class="relative">
            <select
              v-model="actionFilter"
              class="focus:outline-hidden rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-800 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            >
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

          <div class="relative">
            <select
              v-model="entityFilter"
              class="focus:outline-hidden rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-800 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            >
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

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-neutral-700 dark:text-neutral-200">
          <thead
            class="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-400"
          >
            <tr>
              <th class="px-4 py-3">{{ t('audit_logs.col_timestamp') }}</th>
              <th class="px-4 py-3">{{ t('audit_logs.col_user') }}</th>
              <th class="px-4 py-3">{{ t('audit_logs.col_action') }}</th>
              <th class="px-4 py-3">{{ t('audit_logs.col_entity') }}</th>
              <th class="px-4 py-3">{{ t('audit_logs.col_entity_ref') }}</th>
              <th class="px-4 py-3">{{ t('audit_logs.col_ip') }}</th>
              <th class="px-4 py-3 text-right">{{ t('audit_logs.col_payload') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
            <tr
              v-for="log in paginatedLogs"
              :key="log.id"
              class="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
            >
              <td class="px-4 py-3.5 font-mono text-xs">
                <div class="flex flex-col">
                  <span class="font-medium text-neutral-900 dark:text-white">{{
                    new Date(log.createdAt).toLocaleDateString()
                  }}</span>
                  <span class="text-[11px] text-neutral-500 dark:text-neutral-400">{{
                    new Date(log.createdAt).toLocaleTimeString()
                  }}</span>
                </div>
              </td>
              <td class="px-4 py-3.5">
                <div class="flex flex-col text-xs">
                  <span class="font-medium text-neutral-900 dark:text-white">{{
                    log.user?.fullName || 'System Event'
                  }}</span>
                  <span class="font-mono text-[11px] text-neutral-500 dark:text-neutral-400">{{
                    log.user?.email || 'N/A'
                  }}</span>
                </div>
              </td>
              <td class="px-4 py-3.5">
                <span
                  :class="[
                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-xs font-medium',
                    getActionBadgeClass(log.action),
                  ]"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
                  <span>{{ log.action }}</span>
                </span>
              </td>
              <td class="px-4 py-3.5">
                <span
                  class="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                >
                  {{ log.entityType }}
                </span>
              </td>
              <td
                class="max-w-[140px] truncate px-4 py-3.5 font-mono text-xs text-neutral-600 dark:text-neutral-400"
                :title="log.entityId"
              >
                {{ log.entityId }}
              </td>
              <td class="px-4 py-3.5 font-mono text-xs text-neutral-500 dark:text-neutral-400">
                {{ log.ipAddress || '127.0.0.1' }}
              </td>
              <td class="px-4 py-3.5 text-right">
                <button
                  @click="selectedLog = log"
                  class="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-neutral-300 px-2.5 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                  :title="t('audit_logs.inspect')"
                >
                  <FileText :size="13" />
                  <span>{{ t('audit_logs.inspect') }}</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </AppTableCard>

    <!-- Payload Inspector Modal -->
    <Teleport to="body">
      <div
        v-if="selectedLog"
        class="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      >
        <div
          class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800"
          >
            <div class="flex items-center gap-2">
              <Terminal :size="16" class="text-indigo-600 dark:text-indigo-400" />
              <h3 class="text-base font-semibold text-neutral-900 dark:text-white">
                {{ t('audit_logs.modal_title') }}
              </h3>
            </div>
            <button
              @click="selectedLog = null"
              class="cursor-pointer text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X :size="18" />
            </button>
          </div>

          <div class="space-y-4 p-6">
            <div
              class="space-y-2 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-300"
            >
              <div>
                <strong class="text-neutral-900 dark:text-white"
                  >{{ t('audit_logs.log_id') }}:</strong
                >
                <span class="font-mono text-neutral-500">{{ selectedLog.id }}</span>
              </div>
              <div class="flex items-center gap-2">
                <strong class="text-neutral-900 dark:text-white"
                  >{{ t('audit_logs.action') }}:</strong
                >
                <span
                  :class="[
                    'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-xs font-medium',
                    getActionBadgeClass(selectedLog.action),
                  ]"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
                  <span>{{ selectedLog.action }}</span>
                </span>
              </div>
              <div class="flex items-center gap-2">
                <strong class="text-neutral-900 dark:text-white"
                  >{{ t('audit_logs.target_entity') }}:</strong
                >
                <span
                  class="inline-flex items-center rounded-md border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                >
                  {{ selectedLog.entityType }}
                </span>
                <span class="font-mono text-xs text-neutral-500"
                  >(ID: {{ selectedLog.entityId }})</span
                >
              </div>
              <div>
                <strong class="text-neutral-900 dark:text-white"
                  >{{ t('audit_logs.acting_user') }}:</strong
                >
                {{ selectedLog.user?.fullName }} ({{ selectedLog.user?.email }})
              </div>
              <div>
                <strong class="text-neutral-900 dark:text-white"
                  >{{ t('audit_logs.timestamp') }}:</strong
                >
                {{ new Date(selectedLog.createdAt).toUTCString() }}
              </div>
              <div>
                <strong class="text-neutral-900 dark:text-white"
                  >{{ t('audit_logs.client_ip') }}:</strong
                >
                <span class="font-mono">{{ selectedLog.ipAddress || '127.0.0.1' }}</span>
              </div>
              <div v-if="selectedLog.userAgent">
                <strong class="text-neutral-900 dark:text-white"
                  >{{ t('audit_logs.user_agent') }}:</strong
                >
                <span class="text-xs text-neutral-500">{{ selectedLog.userAgent }}</span>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="space-y-1.5">
                <span
                  class="block text-[10px] font-bold uppercase text-neutral-500 dark:text-neutral-400"
                  >{{ t('audit_logs.old_values') }}:</span
                >
                <pre
                  class="max-h-56 overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-100 p-3 font-mono text-xs leading-relaxed text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                >
            {{
                    selectedLog.oldValues
                      ? JSON.stringify(selectedLog.oldValues, null, 2)
                      : 'null (initial state)'
                  }}</pre>
              </div>

              <div class="space-y-1.5">
                <span
                  class="block text-[10px] font-bold uppercase text-neutral-500 dark:text-neutral-400"
                  >{{ t('audit_logs.new_values') }}:</span
                >
                <pre
                  class="max-h-56 overflow-x-auto rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 font-mono text-xs leading-relaxed text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300"
                >
            {{
                    selectedLog.newValues ? JSON.stringify(selectedLog.newValues, null, 2) : 'null'
                  }}</pre>
              </div>
            </div>

            <div class="flex justify-end pt-2">
              <button
                @click="selectedLog = null"
                class="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
              >
                {{ t('common.close') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
