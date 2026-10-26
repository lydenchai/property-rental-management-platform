<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  Building,
  Key,
  Wrench,
  ShieldCheck,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Clock,
  Compass,
  Search,
  Check,
  FileText,
  DollarSign,
  Layers,
  ChevronRight,
  Lock,
  Database,
} from '@lucide/vue';
import { useAuth } from '../composables/useAuth';

const { t } = useI18n();
const { isAuthenticated } = useAuth();

// Quick Search Form State
const searchCity = ref('');
const searchBeds = ref('');
const searchBudget = ref('');

function handleQuickSearch() {
  const query: Record<string, string> = {};
  if (searchCity.value) query.city = searchCity.value;
  if (searchBeds.value) query.bedrooms = searchBeds.value;
  if (searchBudget.value === 'under500') {
    query.maxRent = '500';
  } else if (searchBudget.value === '500-1200') {
    query.minRent = '500';
    query.maxRent = '1200';
  } else if (searchBudget.value === '1200plus') {
    query.minRent = '1200';
  }
  navigateTo({ path: '/properties', query });
}

function quickNavigate(city?: string, search?: string) {
  const query: Record<string, string> = {};
  if (city) query.city = city;
  if (search) query.search = search;
  navigateTo({ path: '/properties', query });
}

const keyMetrics = computed(() => [
  {
    label: t('landing.metrics_units'),
    val: '1,200+',
    detail: t('landing.metrics_units_detail'),
    icon: Building,
  },
  {
    label: t('landing.metrics_ontime'),
    val: '99.8%',
    detail: t('landing.metrics_ontime_detail'),
    icon: CheckCircle2,
  },
  {
    label: t('landing.metrics_sla'),
    val: '< 24h',
    detail: t('landing.metrics_sla_detail'),
    icon: Clock,
  },
  {
    label: t('landing.metrics_map'),
    val: 'OpenFreeMap',
    detail: t('landing.metrics_map_detail'),
    icon: Compass,
  },
]);

const featuredCities = [
  {
    name: 'Phnom Penh',
    desc: 'BKK1, Bassac Garden, Toul Kork & Chroy Changvar residential towers',
    count: '5 Complexes',
    avgRent: '$650',
    cover:
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
    districts: ['BKK1', 'Toul Kork', 'Bassac Garden'],
  },
  {
    name: 'Siem Reap',
    desc: 'Heritage serviced villas and riverside residential estates',
    count: '2 Complexes',
    avgRent: '$450',
    cover:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
    districts: ['Wat Bo', 'Old Market', 'Riverside'],
  },
  {
    name: 'Sihanoukville',
    desc: 'Modern coastal residential towers with panoramic sea views',
    count: '1 Complex',
    avgRent: '$750',
    cover:
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
    districts: ['Otres Beach', 'Victory Hill'],
  },
  {
    name: 'Kampot',
    desc: 'Scenic riverside estates and tranquil colonial garden residences',
    count: '1 Complex',
    avgRent: '$380',
    cover:
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
    districts: ['Tuek Chhou', 'Riverside'],
  },
];

const stakeholderPortals = computed(() => [
  {
    icon: Building,
    role: t('landing.cap_landlord_title'),
    desc: t('landing.cap_landlord_desc'),
    tag: 'Portals: Landlord',
    features: [
      'Occupancy analytics & real-time rent rolls',
      'One-click automated invoice generation',
      'Custom digital lease agreement builder',
      'Tenant background vetting workflow',
    ],
  },
  {
    icon: Key,
    role: t('landing.cap_tenant_title'),
    desc: t('landing.cap_tenant_desc'),
    tag: 'Portals: Tenant',
    features: [
      'Verified unit floor plans & room specs',
      'Digital lease signing with legal enforceability',
      'Online payment records & settlement receipts',
      'Maintenance dispatch tracking with photos',
    ],
  },
  {
    icon: Wrench,
    role: t('landing.cap_tech_title'),
    desc: t('landing.cap_tech_desc'),
    tag: 'Portals: Technician',
    features: [
      'Mobile-optimized task queue & SLA tracking',
      'Direct unit specification & access notes',
      'On-site photo documentation & cost logging',
      'Instant landlord repair resolution sign-off',
    ],
  },
  {
    icon: ShieldCheck,
    role: t('landing.cap_admin_title'),
    desc: t('landing.cap_admin_desc'),
    tag: 'Portals: Admin',
    features: [
      'Cross-tenant organization account management',
      'Cryptographic scrypt session & cookie security',
      'Immutable audit logging for security compliance',
      'Health check monitoring & vector tile integration',
    ],
  },
]);
</script>

<template>
  <div class="flex flex-col gap-16 pb-20 sm:gap-20">
    <!-- Hero Section -->
    <section class="px-4 pt-16 text-center sm:px-6 sm:pt-20">
      <div class="mx-auto flex max-w-4xl flex-col items-center">
        <!-- Live System Status Badge -->
        <div
          class="shadow-xs mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <span class="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <span class="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{{
            t('landing.badge_proptech')
          }}</span>
        </div>

        <h1
          class="text-3xl font-extrabold leading-[1.15] tracking-tight text-neutral-900 dark:text-white sm:text-5xl lg:text-6xl"
        >
          {{ t('landing.hero_title') }}
        </h1>

        <p
          class="mt-4 max-w-2xl text-base leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-lg"
        >
          {{ t('landing.hero_subtitle') }}
        </p>

        <!-- Interactive Quick-Search Bar -->
        <div
          class="mt-8 w-full max-w-3xl rounded-2xl border border-neutral-200 bg-white p-4 text-left shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-5"
        >
          <form
            @submit.prevent="handleQuickSearch"
            class="flex flex-col items-stretch gap-3 md:flex-row md:items-center"
          >
            <div class="flex flex-1 flex-col gap-1 px-2">
              <label
                class="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500"
              >
                <MapPin :size="13" class="text-neutral-400" />
                <span>{{ t('landing.search_city_label') }}</span>
              </label>
              <select
                v-model="searchCity"
                class="w-full cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-neutral-900 focus:outline-none dark:text-white"
              >
                <option value="">{{ t('landing.search_all_cities') }}</option>
                <option value="Phnom Penh">Phnom Penh</option>
                <option value="Siem Reap">Siem Reap</option>
                <option value="Sihanoukville">Sihanoukville</option>
                <option value="Kampot">Kampot</option>
              </select>
            </div>

            <div class="hidden h-8 w-px bg-neutral-200 dark:bg-neutral-800 md:block" />

            <div class="flex flex-1 flex-col gap-1 px-2">
              <label
                class="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500"
              >
                <Building :size="13" class="text-neutral-400" />
                <span>{{ t('landing.search_beds_label') }}</span>
              </label>
              <select
                v-model="searchBeds"
                class="w-full cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-neutral-900 focus:outline-none dark:text-white"
              >
                <option value="">{{ t('landing.search_all_beds') }}</option>
                <option value="1">1 Bedroom</option>
                <option value="2">2 Bedrooms</option>
                <option value="3">3+ Bedrooms</option>
              </select>
            </div>

            <div class="hidden h-8 w-px bg-neutral-200 dark:bg-neutral-800 md:block" />

            <div class="flex flex-1 flex-col gap-1 px-2">
              <label
                class="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500"
              >
                <DollarSign :size="13" class="text-neutral-400" />
                <span>{{ t('landing.search_budget_label') }}</span>
              </label>
              <select
                v-model="searchBudget"
                class="w-full cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-neutral-900 focus:outline-none dark:text-white"
              >
                <option value="">{{ t('landing.search_all_budgets') }}</option>
                <option value="under500">&lt; $500 / mo</option>
                <option value="500-1200">$500 – $1,200 / mo</option>
                <option value="1200plus">$1,200+ / mo</option>
              </select>
            </div>

            <button
              type="submit"
              class="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-neutral-800 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <Search :size="16" />
              <span>{{ t('landing.search_btn') }}</span>
            </button>
          </form>

          <!-- Quick Tags Filter Strip -->
          <div
            class="mt-4 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3 text-xs dark:border-neutral-800/80"
          >
            <span class="font-medium text-neutral-400 dark:text-neutral-500"
              >{{ t('landing.popular_searches') }}:</span
            >
            <button
              type="button"
              @click="quickNavigate('Phnom Penh', 'BKK1')"
              class="rounded-md bg-neutral-100 px-2.5 py-1 text-neutral-600 transition-colors hover:bg-neutral-200 hover:text-neutral-900 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-white"
            >
              {{ t('landing.tag_bkk1') }}
            </button>
            <button
              type="button"
              @click="quickNavigate('', 'Riverside')"
              class="rounded-md bg-neutral-100 px-2.5 py-1 text-neutral-600 transition-colors hover:bg-neutral-200 hover:text-neutral-900 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-white"
            >
              {{ t('landing.tag_riverside') }}
            </button>
            <button
              type="button"
              @click="quickNavigate('Siem Reap', '')"
              class="rounded-md bg-neutral-100 px-2.5 py-1 text-neutral-600 transition-colors hover:bg-neutral-200 hover:text-neutral-900 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-white"
            >
              {{ t('landing.tag_siemreap') }}
            </button>
            <button
              type="button"
              @click="quickNavigate('', 'Pet Friendly')"
              class="rounded-md bg-neutral-100 px-2.5 py-1 text-neutral-600 transition-colors hover:bg-neutral-200 hover:text-neutral-900 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-white"
            >
              {{ t('landing.tag_petfriendly') }}
            </button>
          </div>
        </div>

        <!-- Secondary CTA Links -->
        <div class="mt-6 flex items-center justify-center gap-4 text-sm">
          <NuxtLink
            v-if="isAuthenticated"
            to="/dashboard"
            class="inline-flex items-center gap-2 font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            <span>{{ t('landing.hero_cta_dashboard') }}</span>
            <ArrowRight :size="15" />
          </NuxtLink>
          <template v-else>
            <NuxtLink
              to="/properties"
              class="inline-flex items-center gap-1.5 text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            >
              <Compass :size="15" />
              <span>{{ t('landing.hero_cta_map') }}</span>
            </NuxtLink>
            <span class="text-neutral-300 dark:text-neutral-700">•</span>
            <NuxtLink
              to="/login"
              class="inline-flex items-center gap-1 text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            >
              <span>{{ t('landing.hero_cta_signin') }}</span>
              <ArrowRight :size="13" />
            </NuxtLink>
          </template>
        </div>
      </div>
    </section>

    <!-- Operational Metrics Banner -->
    <section class="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div
        class="shadow-xs grid grid-cols-2 gap-6 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 sm:p-8 lg:grid-cols-4"
      >
        <div v-for="(m, idx) in keyMetrics" :key="idx" class="flex items-start gap-3.5">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-800/40 dark:bg-blue-950/40 dark:text-blue-400"
          >
            <component :is="m.icon" :size="18" />
          </div>
          <div class="flex flex-col">
            <div class="text-lg font-extrabold text-neutral-900 dark:text-white sm:text-xl">
              {{ m.val }}
            </div>
            <div class="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
              {{ m.label }}
            </div>
            <div class="mt-0.5 text-[11px] text-neutral-400 dark:text-neutral-500">
              {{ m.detail }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Live Platform Architecture / Bento Showcase -->
    <section class="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div class="mx-auto mb-10 flex max-w-2xl flex-col items-center gap-2 text-center">
        <span class="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">{{
          t('landing.bento_eyebrow')
        }}</span>
        <h2 class="text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">
          {{ t('landing.bento_title') }}
        </h2>
        <p class="text-sm text-neutral-500 dark:text-neutral-400">
          {{ t('landing.bento_subtitle') }}
        </p>
      </div>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <!-- Bento Card 1: Interactive Unit Listing Preview (Large) -->
        <div
          class="shadow-xs flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 lg:col-span-2"
        >
          <div
            class="flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800"
          >
            <div class="flex items-center gap-2">
              <span
                class="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                >{{ t('landing.preview_unit_badge') }}</span
              >
              <span
                class="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-400"
                >{{ t('landing.preview_unit_status') }}</span
              >
            </div>
            <NuxtLink
              to="/properties/prop-skyline-01"
              class="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              <span>Inspect Unit</span>
              <ChevronRight :size="14" />
            </NuxtLink>
          </div>

          <div class="mt-5 grid grid-cols-1 items-center gap-5 sm:grid-cols-2">
            <div
              class="relative aspect-video overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800 sm:aspect-[4/3]"
            >
              <img
                src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"
                alt="Skyline Studio 402"
                class="h-full w-full object-cover"
                loading="lazy"
              />
              <div
                class="backdrop-blur-xs absolute bottom-2 left-2 rounded-md bg-neutral-950/80 px-2.5 py-1 text-xs font-bold text-white"
              >
                {{ t('landing.preview_unit_price') }}
              </div>
            </div>

            <div class="flex flex-col gap-3">
              <div>
                <h3 class="text-base font-bold text-neutral-900 dark:text-white">
                  {{ t('landing.preview_unit_title') }}
                </h3>
                <p
                  class="mt-1 flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400"
                >
                  <MapPin :size="13" class="shrink-0 text-emerald-500" />
                  {{ t('landing.preview_unit_loc') }}
                </p>
              </div>

              <div class="flex flex-wrap gap-1.5">
                <span
                  class="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                  >2 Bed</span
                >
                <span
                  class="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                  >2 Bath</span
                >
                <span
                  class="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                  >85 m²</span
                >
                <span
                  class="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                  >Balcony</span
                >
                <span
                  class="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                  >Pool Access</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Bento Card 2: Automated Billing & Invoicing Lifecycle -->
        <div
          class="shadow-xs flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800"
          >
            <span
              class="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
              >{{ t('landing.preview_lease_title') }}</span
            >
            <span
              class="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-400"
              >{{ t('landing.preview_invoice_status') }}</span
            >
          </div>

          <div class="my-4 flex flex-col gap-3">
            <div class="flex items-center gap-3">
              <div
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
              >
                <FileText :size="16" />
              </div>
              <div>
                <div class="font-mono text-xs font-bold text-neutral-900 dark:text-white">
                  {{ t('landing.preview_invoice_num') }}
                </div>
                <div class="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {{ t('landing.preview_tenant_name') }}
                </div>
              </div>
            </div>

            <div
              class="flex items-center justify-between border-b border-neutral-100 py-1.5 text-xs dark:border-neutral-800"
            >
              <span class="text-neutral-500 dark:text-neutral-400">Settled Rent</span>
              <strong class="font-bold text-neutral-900 dark:text-white">$850.00 USD</strong>
            </div>
            <div
              class="flex items-center justify-between border-b border-neutral-100 py-1.5 text-xs dark:border-neutral-800"
            >
              <span class="text-neutral-500 dark:text-neutral-400">Payment Verification</span>
              <span class="text-[11px] font-bold text-emerald-600 dark:text-emerald-400"
                >CONFIRMED</span
              >
            </div>

            <div
              class="flex items-center gap-2 rounded-lg bg-emerald-50/60 p-2 text-xs text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300"
            >
              <Check :size="14" class="shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{{ t('landing.preview_invoice_reconciled') }}</span>
            </div>
          </div>
        </div>

        <!-- Bento Card 3: Field Technician Work Order Dispatch -->
        <div
          class="shadow-xs flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800"
          >
            <span
              class="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
              >{{ t('landing.preview_wo_title') }}</span
            >
            <span
              class="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:border-amber-800/40 dark:bg-amber-950/40 dark:text-amber-400"
              >{{ t('landing.preview_wo_status') }}</span
            >
          </div>

          <div class="my-4 flex flex-col gap-3">
            <div class="flex items-center gap-3">
              <div
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
              >
                <Wrench :size="16" />
              </div>
              <div>
                <div class="font-mono text-xs font-bold text-neutral-900 dark:text-white">
                  {{ t('landing.preview_wo_num') }}
                </div>
                <div class="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Priority: MEDIUM • On-Site Resolution
                </div>
              </div>
            </div>

            <div class="mt-2 flex flex-col gap-1.5">
              <div
                class="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800"
              >
                <div class="h-full rounded-full bg-amber-500" style="width: 70%" />
              </div>
              <div class="flex justify-between text-[10px] text-neutral-400 dark:text-neutral-500">
                <span>Reported</span>
                <span class="font-bold text-amber-500">Dispatched</span>
                <span>Completed</span>
              </div>
            </div>

            <div
              class="mt-2 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400"
            >
              <Clock :size="13" class="shrink-0" />
              <span>{{ t('landing.preview_wo_sla') }}</span>
            </div>
          </div>
        </div>

        <!-- Bento Card 4: OpenFreeMap Vector Integration -->
        <div
          class="shadow-xs flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 lg:col-span-2"
        >
          <div
            class="flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800"
          >
            <span
              class="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
              >{{ t('landing.preview_map_title') }}</span
            >
            <span
              class="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:border-blue-800/40 dark:bg-blue-950/40 dark:text-blue-400"
              >VECTOR 2.0</span
            >
          </div>

          <div
            class="my-4 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center"
          >
            <div class="flex flex-col gap-3">
              <div class="flex flex-wrap gap-2">
                <div
                  class="inline-flex items-center gap-1.5 rounded-md bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                >
                  <MapPin :size="12" class="text-emerald-500" />
                  <span>Phnom Penh: BKK1 • Bassac • Toul Kork</span>
                </div>
                <div
                  class="inline-flex items-center gap-1.5 rounded-md bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                >
                  <MapPin :size="12" class="text-sky-500" />
                  <span>Siem Reap: Wat Bo • Riverside</span>
                </div>
              </div>
              <p
                class="max-w-lg text-xs leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-sm"
              >
                {{ t('landing.preview_map_desc') }}
              </p>
            </div>

            <NuxtLink to="/properties" class="btn-primary w-full shrink-0 sm:w-auto">
              <Compass :size="14" />
              <span>{{ t('landing.preview_map_cta') }}</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Cambodia Regional Hubs Section -->
    <section class="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div class="mx-auto mb-10 flex max-w-2xl flex-col items-center gap-2 text-center">
        <span class="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">{{
          t('landing.regions_eyebrow')
        }}</span>
        <h2 class="text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">
          {{ t('landing.regions_title') }}
        </h2>
        <p class="text-sm text-neutral-500 dark:text-neutral-400">
          {{ t('landing.regions_subtitle') }}
        </p>
      </div>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <NuxtLink
          v-for="city in featuredCities"
          :key="city.name"
          :to="`/properties?city=${encodeURIComponent(city.name)}`"
          class="shadow-xs group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
        >
          <div
            class="relative h-48 w-full shrink-0 overflow-hidden bg-neutral-100 dark:bg-neutral-800"
          >
            <img
              :src="city.cover"
              :alt="city.name"
              class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div
              class="backdrop-blur-xs absolute left-2.5 top-2.5 rounded-md bg-neutral-950/80 px-2 py-0.5 text-[11px] font-semibold text-white"
            >
              {{ city.count }}
            </div>
            <div
              class="backdrop-blur-xs absolute bottom-2.5 right-2.5 rounded-md bg-neutral-950/80 px-2 py-0.5 text-[11px] font-semibold text-white"
            >
              Avg. {{ city.avgRent }}/mo
            </div>
          </div>

          <div class="flex flex-1 flex-col justify-between gap-3 p-4">
            <div>
              <div class="flex items-center justify-between">
                <h3 class="text-base font-bold text-neutral-900 dark:text-white">
                  {{ city.name }}
                </h3>
                <ArrowRight
                  :size="15"
                  class="text-neutral-400 transition-all group-hover:translate-x-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                />
              </div>
              <p
                class="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400"
              >
                {{ city.desc }}
              </p>
            </div>

            <div class="mt-1 flex flex-wrap gap-1">
              <span
                v-for="d in city.districts"
                :key="d"
                class="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
              >
                {{ d }}
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- Stakeholder Architecture (Role-Based Workflows) -->
    <section class="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div class="mx-auto mb-10 flex max-w-2xl flex-col items-center gap-2 text-center">
        <span class="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">{{
          t('landing.pillars_eyebrow')
        }}</span>
        <h2 class="text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">
          {{ t('landing.pillars_heading') }}
        </h2>
        <p class="text-sm text-neutral-500 dark:text-neutral-400">
          {{ t('landing.pillars_subtitle') }}
        </p>
      </div>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="(p, idx) in stakeholderPortals"
          :key="idx"
          class="shadow-xs flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div>
            <div class="mb-4 flex items-center gap-3">
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-800/40 dark:bg-blue-950/40 dark:text-blue-400"
              >
                <component :is="p.icon" :size="20" />
              </div>
              <div>
                <span
                  class="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500"
                  >{{ p.tag }}</span
                >
                <h3 class="text-base font-bold text-neutral-900 dark:text-white">{{ p.role }}</h3>
              </div>
            </div>

            <p
              class="mb-4 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-sm"
            >
              {{ p.desc }}
            </p>
          </div>

          <div class="border-t border-neutral-100 pt-4 dark:border-neutral-800/80">
            <ul class="flex flex-col gap-2">
              <li
                v-for="(feat, fIdx) in p.features"
                :key="fIdx"
                class="flex items-start gap-2 text-xs text-neutral-600 dark:text-neutral-300"
              >
                <Check :size="14" class="mt-0.5 shrink-0 text-emerald-500" />
                <span>{{ feat }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Enterprise Security & Infrastructure Strip -->
    <section class="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div
        class="shadow-xs grid grid-cols-1 gap-6 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 sm:grid-cols-2 sm:p-8 lg:grid-cols-4"
      >
        <div class="flex items-start gap-3">
          <ShieldCheck :size="20" class="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
          <div class="flex flex-col gap-0.5">
            <div class="text-xs font-bold text-neutral-900 dark:text-white">
              {{ t('landing.trust_audit') }}
            </div>
            <div class="text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
              {{ t('landing.trust_audit_desc') }}
            </div>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <Lock :size="20" class="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div class="flex flex-col gap-0.5">
            <div class="text-xs font-bold text-neutral-900 dark:text-white">
              {{ t('landing.trust_rbac') }}
            </div>
            <div class="text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
              {{ t('landing.trust_rbac_desc') }}
            </div>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <Database :size="20" class="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div class="flex flex-col gap-0.5">
            <div class="text-xs font-bold text-neutral-900 dark:text-white">
              {{ t('landing.trust_crypto') }}
            </div>
            <div class="text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
              {{ t('landing.trust_crypto_desc') }}
            </div>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <Compass :size="20" class="mt-0.5 shrink-0 text-sky-600 dark:text-sky-400" />
          <div class="flex flex-col gap-0.5">
            <div class="text-xs font-bold text-neutral-900 dark:text-white">
              {{ t('landing.trust_map') }}
            </div>
            <div class="text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
              {{ t('landing.trust_map_desc') }}
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
