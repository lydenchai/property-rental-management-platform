<script setup lang="ts">
import { Building, CheckCircle2, Layers, AlertTriangle } from '@lucide/vue';

interface PropertyBreakdownItem {
  propertyId: string;
  title: string;
  city: string;
  state: string;
  totalUnits: number;
  occupiedUnits: number;
  availableUnits: number;
  maintenanceUnits: number;
  occupancyRate: number;
}

interface OccupancyData {
  totalUnits: number;
  occupancyRate: number;
  occupiedUnits: number;
  availableUnits: number;
  maintenanceUnits: number;
  reservedUnits: number;
  propertyBreakdown?: PropertyBreakdownItem[];
}

interface Props {
  occupancyData: OccupancyData | null;
  isLoading?: boolean;
}

defineProps<Props>();

const { t } = useI18n();
</script>

<template>
  <div class="space-y-6">
    <!-- High Level Metrics -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div
        class="shadow-xs flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div class="flex items-center justify-between">
          <span
            class="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
            >{{ t('reports.total_units') }}</span
          >
          <Building :size="16" class="text-neutral-400" />
        </div>
        <div class="mt-3">
          <div class="font-mono text-2xl font-bold text-neutral-900 dark:text-white">
            {{ occupancyData?.totalUnits ?? 0 }}
          </div>
          <div class="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            {{ t('reports.total_units_desc') }}
          </div>
        </div>
      </div>

      <div
        class="shadow-xs flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div class="flex items-center justify-between">
          <span
            class="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
            >{{ t('reports.occupancy_rate') }}</span
          >
          <CheckCircle2 :size="16" class="text-emerald-500" />
        </div>
        <div class="mt-3">
          <div class="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {{ occupancyData?.occupancyRate ?? 0 }}%
          </div>
          <div class="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400">
            {{ occupancyData?.occupiedUnits ?? 0 }} {{ t('reports.units_leased') }}
          </div>
        </div>
      </div>

      <div
        class="shadow-xs flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div class="flex items-center justify-between">
          <span
            class="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
            >{{ t('reports.vacant_units') }}</span
          >
          <Layers :size="16" class="text-sky-500" />
        </div>
        <div class="mt-3">
          <div class="font-mono text-2xl font-bold text-sky-600 dark:text-sky-400">
            {{ occupancyData?.availableUnits ?? 0 }}
          </div>
          <div class="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            {{ t('reports.available_lease') }}
          </div>
        </div>
      </div>

      <div
        class="shadow-xs flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div class="flex items-center justify-between">
          <span
            class="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
            >{{ t('reports.maintenance_units') }}</span
          >
          <AlertTriangle :size="16" class="text-amber-500" />
        </div>
        <div class="mt-3">
          <div class="font-mono text-2xl font-bold text-amber-600 dark:text-amber-400">
            {{ (occupancyData?.maintenanceUnits ?? 0) + (occupancyData?.reservedUnits ?? 0) }}
          </div>
          <div class="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            {{ occupancyData?.maintenanceUnits ?? 0 }} {{ t('reports.offline_units') }}
          </div>
        </div>
      </div>
    </div>

    <!-- Unit Distribution Breakdown Bar -->
    <div
      v-if="occupancyData && occupancyData.totalUnits > 0"
      class="shadow-xs space-y-4 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div class="flex items-center justify-between">
        <h3 class="text-base font-semibold text-neutral-900 dark:text-white">
          {{ t('reports.unit_allocation_breakdown') }}
        </h3>
        <span
          class="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
          >{{ t('reports.total_units_badge', { count: occupancyData.totalUnits }) }}</span
        >
      </div>

      <!-- Multi-segment progress bar -->
      <div class="flex h-3 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
        <div
          class="bg-emerald-500 transition-all duration-300"
          :style="{ width: `${(occupancyData.occupiedUnits / occupancyData.totalUnits) * 100}%` }"
          :title="`${t('reports.col_occupied')}: ${occupancyData.occupiedUnits}`"
        ></div>
        <div
          class="bg-purple-500 transition-all duration-300"
          :style="{ width: `${(occupancyData.reservedUnits / occupancyData.totalUnits) * 100}%` }"
          :title="`${t('common.reserved')}: ${occupancyData.reservedUnits}`"
        ></div>
        <div
          class="bg-amber-500 transition-all duration-300"
          :style="{
            width: `${(occupancyData.maintenanceUnits / occupancyData.totalUnits) * 100}%`,
          }"
          :title="`${t('reports.col_maintenance')}: ${occupancyData.maintenanceUnits}`"
        ></div>
        <div
          class="bg-sky-500 transition-all duration-300"
          :style="{
            width: `${(occupancyData.availableUnits / occupancyData.totalUnits) * 100}%`,
          }"
          :title="`${t('reports.col_available')}: ${occupancyData.availableUnits}`"
        ></div>
      </div>

      <!-- Legend -->
      <div class="flex flex-wrap items-center gap-4 text-xs text-neutral-600 dark:text-neutral-400">
        <div class="flex items-center gap-1.5">
          <span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
          <span>{{ t('reports.occupied_legend', { count: occupancyData.occupiedUnits }) }}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="h-2.5 w-2.5 rounded-full bg-purple-500"></span>
          <span>{{ t('reports.reserved_legend', { count: occupancyData.reservedUnits }) }}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
          <span>{{
            t('reports.maintenance_legend', { count: occupancyData.maintenanceUnits })
          }}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="h-2.5 w-2.5 rounded-full bg-sky-500"></span>
          <span>{{ t('reports.available_legend', { count: occupancyData.availableUnits }) }}</span>
        </div>
      </div>
    </div>

    <!-- Property Breakdown Table -->
    <div
      class="shadow-xs overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div
        class="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800"
      >
        <h3 class="text-base font-semibold text-neutral-900 dark:text-white">
          {{ t('reports.property_breakdown') }}
        </h3>
        <span class="text-xs text-neutral-500 dark:text-neutral-400">{{
          t('reports.properties_count', {
            count: occupancyData?.propertyBreakdown?.length || 0,
          })
        }}</span>
      </div>

      <div class="overflow-x-auto">
        <table
          class="w-full min-w-[700px] text-left text-sm text-neutral-700 dark:text-neutral-200"
        >
          <thead
            class="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-400"
          >
            <tr>
              <th class="px-4 py-3">{{ t('reports.col_property') }}</th>
              <th class="px-4 py-3">{{ t('reports.col_location') }}</th>
              <th class="px-4 py-3">{{ t('reports.col_units') }}</th>
              <th class="px-4 py-3">{{ t('reports.col_occupied') }}</th>
              <th class="px-4 py-3">{{ t('reports.col_available') }}</th>
              <th class="px-4 py-3">{{ t('reports.col_maintenance') }}</th>
              <th class="px-4 py-3">{{ t('reports.col_occupancy') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
            <tr v-if="isLoading">
              <td colspan="7" class="px-4 py-8 text-center text-sm text-neutral-500">
                {{ t('reports.loading_properties') }}
              </td>
            </tr>
            <tr v-else-if="!occupancyData?.propertyBreakdown?.length">
              <td colspan="7" class="px-4 py-8 text-center text-sm text-neutral-500">
                {{ t('reports.no_properties') }}
              </td>
            </tr>
            <tr
              v-for="prop in occupancyData?.propertyBreakdown"
              :key="prop.propertyId"
              class="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
            >
              <td class="px-4 py-3.5 font-medium text-neutral-900 dark:text-white">
                {{ prop.title }}
              </td>
              <td class="px-4 py-3.5 text-xs text-neutral-500 dark:text-neutral-400">
                {{ prop.city }}, {{ prop.state }}
              </td>
              <td class="px-4 py-3.5 font-mono">{{ prop.totalUnits }}</td>
              <td class="px-4 py-3.5 font-mono font-medium text-emerald-600 dark:text-emerald-400">
                {{ prop.occupiedUnits }}
              </td>
              <td class="px-4 py-3.5 font-mono text-sky-600 dark:text-sky-400">
                {{ prop.availableUnits }}
              </td>
              <td
                :class="[
                  'px-4 py-3.5 font-mono',
                  prop.maintenanceUnits > 0
                    ? 'font-medium text-amber-600 dark:text-amber-400'
                    : 'text-neutral-500',
                ]"
              >
                {{ prop.maintenanceUnits }}
              </td>
              <td class="px-4 py-3.5">
                <div class="flex items-center gap-2">
                  <div
                    class="h-2 w-20 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800"
                  >
                    <div
                      class="h-full rounded-full bg-emerald-500"
                      :style="{ width: `${prop.occupancyRate}%` }"
                    ></div>
                  </div>
                  <span class="font-mono text-xs font-medium text-neutral-900 dark:text-white"
                    >{{ prop.occupancyRate }}%</span
                  >
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
