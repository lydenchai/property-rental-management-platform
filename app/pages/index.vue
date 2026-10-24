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
  Database
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
  { label: t('landing.metrics_units'), val: '1,200+', detail: t('landing.metrics_units_detail'), icon: Building },
  { label: t('landing.metrics_ontime'), val: '99.8%', detail: t('landing.metrics_ontime_detail'), icon: CheckCircle2 },
  { label: t('landing.metrics_sla'), val: '< 24h', detail: t('landing.metrics_sla_detail'), icon: Clock },
  { label: t('landing.metrics_map'), val: 'OpenFreeMap', detail: t('landing.metrics_map_detail'), icon: Compass },
]);

const featuredCities = [
  {
    name: 'Phnom Penh',
    desc: 'BKK1, Bassac Garden, Toul Kork & Chroy Changvar residential towers',
    count: '5 Complexes',
    avgRent: '$650',
    cover: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
    districts: ['BKK1', 'Toul Kork', 'Bassac Garden']
  },
  {
    name: 'Siem Reap',
    desc: 'Heritage serviced villas and riverside residential estates',
    count: '2 Complexes',
    avgRent: '$450',
    cover: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
    districts: ['Wat Bo', 'Old Market', 'Riverside']
  },
  {
    name: 'Sihanoukville',
    desc: 'Modern coastal residential towers with panoramic sea views',
    count: '1 Complex',
    avgRent: '$750',
    cover: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
    districts: ['Otres Beach', 'Victory Hill']
  },
  {
    name: 'Kampot',
    desc: 'Scenic riverside estates and tranquil colonial garden residences',
    count: '1 Complex',
    avgRent: '$380',
    cover: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
    districts: ['Tuek Chhou', 'Riverside']
  },
];

const stakeholderPortals = computed(() => [
  {
    icon: Building,
    role: t('landing.cap_landlord_title'),
    desc: t('landing.cap_landlord_desc'),
    tag: 'Portals: Landlord',
    features: ['Occupancy analytics & real-time rent rolls', 'One-click automated invoice generation', 'Custom digital lease agreement builder', 'Tenant background vetting workflow']
  },
  {
    icon: Key,
    role: t('landing.cap_tenant_title'),
    desc: t('landing.cap_tenant_desc'),
    tag: 'Portals: Tenant',
    features: ['Verified unit floor plans & room specs', 'Digital lease signing with legal enforceability', 'Online payment records & settlement receipts', 'Maintenance dispatch tracking with photos']
  },
  {
    icon: Wrench,
    role: t('landing.cap_tech_title'),
    desc: t('landing.cap_tech_desc'),
    tag: 'Portals: Technician',
    features: ['Mobile-optimized task queue & SLA tracking', 'Direct unit specification & access notes', 'On-site photo documentation & cost logging', 'Instant landlord repair resolution sign-off']
  },
  {
    icon: ShieldCheck,
    role: t('landing.cap_admin_title'),
    desc: t('landing.cap_admin_desc'),
    tag: 'Portals: Admin',
    features: ['Cross-tenant organization account management', 'Cryptographic scrypt session & cookie security', 'Immutable audit logging for security compliance', 'Health check monitoring & vector tile integration']
  },
]);
</script>

<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-container">
        <!-- Live System Status Badge -->
        <div class="system-status-pill">
          <span class="status-indicator-dot" />
          <span class="status-pill-text">{{ t('landing.badge_proptech') }}</span>
        </div>

        <h1 class="hero-title">
          {{ t('landing.hero_title') }}
        </h1>

        <p class="hero-subtitle">
          {{ t('landing.hero_subtitle') }}
        </p>

        <!-- Interactive Quick-Search Bar -->
        <div class="search-command-card card-flat">
          <form @submit.prevent="handleQuickSearch" class="search-command-form">
            <div class="search-input-group">
              <label class="search-field-label">
                <MapPin :size="13" class="field-icon text-muted" />
                <span>{{ t('landing.search_city_label') }}</span>
              </label>
              <select v-model="searchCity" class="search-select">
                <option value="">{{ t('landing.search_all_cities') }}</option>
                <option value="Phnom Penh">Phnom Penh</option>
                <option value="Siem Reap">Siem Reap</option>
                <option value="Sihanoukville">Sihanoukville</option>
                <option value="Kampot">Kampot</option>
              </select>
            </div>

            <div class="search-divider-vertical" />

            <div class="search-input-group">
              <label class="search-field-label">
                <Building :size="13" class="field-icon text-muted" />
                <span>{{ t('landing.search_beds_label') }}</span>
              </label>
              <select v-model="searchBeds" class="search-select">
                <option value="">{{ t('landing.search_all_beds') }}</option>
                <option value="1">1 Bedroom</option>
                <option value="2">2 Bedrooms</option>
                <option value="3">3+ Bedrooms</option>
              </select>
            </div>

            <div class="search-divider-vertical" />

            <div class="search-input-group">
              <label class="search-field-label">
                <DollarSign :size="13" class="field-icon text-muted" />
                <span>{{ t('landing.search_budget_label') }}</span>
              </label>
              <select v-model="searchBudget" class="search-select">
                <option value="">{{ t('landing.search_all_budgets') }}</option>
                <option value="under500">&lt; $500 / mo</option>
                <option value="500-1200">$500 – $1,200 / mo</option>
                <option value="1200plus">$1,200+ / mo</option>
              </select>
            </div>

            <button type="submit" class="btn-search-submit">
              <Search :size="16" />
              <span>{{ t('landing.search_btn') }}</span>
            </button>
          </form>

          <!-- Quick Tags Filter Strip -->
          <div class="quick-tags-strip">
            <span class="quick-tags-label">{{ t('landing.popular_searches') }}:</span>
            <button type="button" @click="quickNavigate('Phnom Penh', 'BKK1')" class="tag-chip">
              {{ t('landing.tag_bkk1') }}
            </button>
            <button type="button" @click="quickNavigate('', 'Riverside')" class="tag-chip">
              {{ t('landing.tag_riverside') }}
            </button>
            <button type="button" @click="quickNavigate('Siem Reap', '')" class="tag-chip">
              {{ t('landing.tag_siemreap') }}
            </button>
            <button type="button" @click="quickNavigate('', 'Pet Friendly')" class="tag-chip">
              {{ t('landing.tag_petfriendly') }}
            </button>
          </div>
        </div>

        <!-- Secondary CTA Links -->
        <div class="hero-actions-row">
          <NuxtLink v-if="isAuthenticated" to="/dashboard" class="btn-secondary hero-action-btn">
            <span>{{ t('landing.hero_cta_dashboard') }}</span>
            <ArrowRight :size="15" />
          </NuxtLink>
          <template v-else>
            <NuxtLink to="/properties" class="btn-ghost-action">
              <Compass :size="15" />
              <span>{{ t('landing.hero_cta_map') }}</span>
            </NuxtLink>
            <span class="cta-dot-separator">•</span>
            <NuxtLink to="/login" class="btn-ghost-action">
              <span>{{ t('landing.hero_cta_signin') }}</span>
              <ArrowRight :size="13" />
            </NuxtLink>
          </template>
        </div>
      </div>
    </section>

    <!-- Operational Metrics Banner -->
    <section class="metrics-banner-section">
      <div class="section-container">
        <div class="metrics-strip card-flat">
          <div v-for="(m, idx) in keyMetrics" :key="idx" class="metric-col">
            <div class="metric-icon-box">
              <component :is="m.icon" :size="17" />
            </div>
            <div class="metric-info">
              <div class="metric-val">{{ m.val }}</div>
              <div class="metric-label">{{ m.label }}</div>
              <div class="metric-detail">{{ m.detail }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Live Platform Architecture / Bento Showcase -->
    <section class="bento-section">
      <div class="section-container">
        <div class="section-header">
          <span class="eyebrow">{{ t('landing.bento_eyebrow') }}</span>
          <h2>{{ t('landing.bento_title') }}</h2>
          <p class="section-subtitle">
            {{ t('landing.bento_subtitle') }}
          </p>
        </div>

        <div class="bento-grid">
          <!-- Bento Card 1: Interactive Unit Listing Preview (Large) -->
          <div class="bento-card bento-hero-card card-flat">
            <div class="bento-card-header">
              <div class="bento-badge-row">
                <span class="bento-tag">{{ t('landing.preview_unit_badge') }}</span>
                <span class="status-badge-emerald">{{ t('landing.preview_unit_status') }}</span>
              </div>
              <NuxtLink to="/properties/prop-skyline-01" class="bento-inspect-link">
                <span>Inspect Unit</span>
                <ChevronRight :size="14" />
              </NuxtLink>
            </div>

            <div class="bento-unit-preview">
              <div class="unit-image-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"
                  alt="Skyline Studio 402"
                  class="unit-preview-image"
                  loading="lazy"
                />
                <div class="unit-price-overlay">
                  <strong>{{ t('landing.preview_unit_price') }}</strong>
                </div>
              </div>

              <div class="unit-preview-details">
                <div class="unit-title-row">
                  <div>
                    <h3>{{ t('landing.preview_unit_title') }}</h3>
                    <p class="unit-loc-text">
                      <MapPin :size="13" class="inline text-emerald-500" />
                      {{ t('landing.preview_unit_loc') }}
                    </p>
                  </div>
                </div>

                <div class="unit-specs-chips">
                  <span class="spec-chip">2 Bed</span>
                  <span class="spec-chip">2 Bath</span>
                  <span class="spec-chip">85 m²</span>
                  <span class="spec-chip">Balcony</span>
                  <span class="spec-chip">Pool Access</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bento Card 2: Automated Billing & Invoicing Lifecycle -->
          <div class="bento-card card-flat">
            <div class="bento-card-header">
              <span class="bento-tag">{{ t('landing.preview_lease_title') }}</span>
              <span class="status-badge-emerald">{{ t('landing.preview_invoice_status') }}</span>
            </div>

            <div class="bento-invoice-widget">
              <div class="invoice-mini-header">
                <div class="invoice-icon-box">
                  <FileText :size="16" class="text-indigo-400" />
                </div>
                <div>
                  <div class="invoice-id">{{ t('landing.preview_invoice_num') }}</div>
                  <div class="invoice-tenant">{{ t('landing.preview_tenant_name') }}</div>
                </div>
              </div>

              <div class="invoice-breakdown-row">
                <span class="text-muted text-xs">Settled Monthly Rent</span>
                <strong class="text-sm font-semibold text-main">$850.00 USD</strong>
              </div>
              <div class="invoice-breakdown-row">
                <span class="text-muted text-xs">Payment Verification</span>
                <span class="status-badge-emerald text-xs">CONFIRMED</span>
              </div>

              <div class="invoice-reconciled-box">
                <Check :size="14" class="text-emerald-500 flex-shrink-0" />
                <span class="text-xs text-muted">{{ t('landing.preview_invoice_reconciled') }}</span>
              </div>
            </div>
          </div>

          <!-- Bento Card 3: Field Technician Work Order Dispatch -->
          <div class="bento-card card-flat">
            <div class="bento-card-header">
              <span class="bento-tag">{{ t('landing.preview_wo_title') }}</span>
              <span class="status-badge-amber">{{ t('landing.preview_wo_status') }}</span>
            </div>

            <div class="bento-wo-widget">
              <div class="wo-mini-header">
                <div class="wo-icon-box">
                  <Wrench :size="16" class="text-amber-500" />
                </div>
                <div>
                  <div class="wo-title-text">{{ t('landing.preview_wo_num') }}</div>
                  <div class="wo-sla-text">Priority: MEDIUM • On-Site Resolution</div>
                </div>
              </div>

              <div class="wo-progress-bar-wrap">
                <div class="wo-progress-track">
                  <div class="wo-progress-fill" style="width: 70%" />
                </div>
                <div class="wo-progress-labels">
                  <span>Reported</span>
                  <span class="font-semibold text-amber-500">Dispatched</span>
                  <span>Completed</span>
                </div>
              </div>

              <div class="wo-sla-guarantee">
                <Clock :size="13" class="text-muted" />
                <span class="text-xs text-dim">{{ t('landing.preview_wo_sla') }}</span>
              </div>
            </div>
          </div>

          <!-- Bento Card 4: OpenFreeMap Vector Integration -->
          <div class="bento-card card-flat">
            <div class="bento-card-header">
              <span class="bento-tag">{{ t('landing.preview_map_title') }}</span>
              <span class="status-badge-blue">VECTOR 2.0</span>
            </div>

            <div class="bento-map-widget">
              <div class="map-coordinates-bar">
                <div class="coord-pill">
                  <MapPin :size="11" class="text-emerald-500" />
                  <span>Phnom Penh: BKK1 • Bassac • Toul Kork</span>
                </div>
                <div class="coord-pill">
                  <MapPin :size="11" class="text-sky-500" />
                  <span>Siem Reap: Wat Bo • Riverside</span>
                </div>
              </div>

              <p class="bento-map-desc">
                {{ t('landing.preview_map_desc') }}
              </p>

              <NuxtLink to="/properties" class="btn-primary bento-map-cta">
                <Compass :size="14" />
                <span>{{ t('landing.preview_map_cta') }}</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Cambodia Regional Hubs Section -->
    <section class="regions-section">
      <div class="section-container">
        <div class="section-header">
          <span class="eyebrow">{{ t('landing.regions_eyebrow') }}</span>
          <h2>{{ t('landing.regions_title') }}</h2>
          <p class="section-subtitle">
            {{ t('landing.regions_subtitle') }}
          </p>
        </div>

        <div class="regions-grid">
          <NuxtLink
            v-for="city in featuredCities"
            :key="city.name"
            :to="`/properties?city=${encodeURIComponent(city.name)}`"
            class="region-card card-flat"
          >
            <div class="region-cover-wrap">
              <img :src="city.cover" :alt="city.name" class="region-cover-img" loading="lazy" />
              <div class="region-count-badge">{{ city.count }}</div>
              <div class="region-rent-badge">Avg. {{ city.avgRent }}/mo</div>
            </div>

            <div class="region-body">
              <div class="region-title-row">
                <h3>{{ city.name }}</h3>
                <ArrowRight :size="15" class="region-arrow-icon" />
              </div>
              <p class="region-desc-text">{{ city.desc }}</p>

              <div class="region-districts-row">
                <span v-for="d in city.districts" :key="d" class="district-chip">{{ d }}</span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Stakeholder Architecture (Role-Based Workflows) -->
    <section class="stakeholders-section">
      <div class="section-container">
        <div class="section-header">
          <span class="eyebrow">{{ t('landing.pillars_eyebrow') }}</span>
          <h2>{{ t('landing.pillars_heading') }}</h2>
          <p class="section-subtitle">
            {{ t('landing.pillars_subtitle') }}
          </p>
        </div>

        <div class="stakeholders-grid">
          <div v-for="(p, idx) in stakeholderPortals" :key="idx" class="stakeholder-card card-flat">
            <div class="stakeholder-header">
              <div class="stakeholder-icon-box">
                <component :is="p.icon" :size="20" />
              </div>
              <div>
                <span class="stakeholder-tag">{{ p.tag }}</span>
                <h3 class="stakeholder-role">{{ p.role }}</h3>
              </div>
            </div>

            <p class="stakeholder-desc">{{ p.desc }}</p>

            <ul class="stakeholder-features-list">
              <li v-for="(feat, fIdx) in p.features" :key="fIdx" class="stakeholder-feat-item">
                <Check :size="14" class="feat-check-icon" />
                <span>{{ feat }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Enterprise Security & Infrastructure Strip -->
    <section class="trust-banner-section">
      <div class="section-container">
        <div class="trust-strip card-flat">
          <div class="trust-col">
            <ShieldCheck :size="18" class="text-indigo-400 flex-shrink-0" />
            <div>
              <div class="trust-title">{{ t('landing.trust_audit') }}</div>
              <div class="trust-desc">{{ t('landing.trust_audit_desc') }}</div>
            </div>
          </div>

          <div class="trust-divider" />

          <div class="trust-col">
            <Lock :size="18" class="text-emerald-400 flex-shrink-0" />
            <div>
              <div class="trust-title">{{ t('landing.trust_rbac') }}</div>
              <div class="trust-desc">{{ t('landing.trust_rbac_desc') }}</div>
            </div>
          </div>

          <div class="trust-divider" />

          <div class="trust-col">
            <Database :size="18" class="text-amber-400 flex-shrink-0" />
            <div>
              <div class="trust-title">{{ t('landing.trust_crypto') }}</div>
              <div class="trust-desc">{{ t('landing.trust_crypto_desc') }}</div>
            </div>
          </div>

          <div class="trust-divider" />

          <div class="trust-col">
            <Compass :size="18" class="text-sky-400 flex-shrink-0" />
            <div>
              <div class="trust-title">{{ t('landing.trust_map') }}</div>
              <div class="trust-desc">{{ t('landing.trust_map_desc') }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.landing-page {
  display: flex;
  flex-direction: column;
  gap: 4rem;
  padding-bottom: 5rem;
}

/* -------------------------------------------------------------
 * Hero Section
 * ------------------------------------------------------------- */
.hero-section {
  padding: 4rem 1.5rem 1.5rem;
  text-align: center;
}

.hero-container {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.system-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  padding: 0.35rem 0.85rem;
  border-radius: var(--radius-full);
}

.status-indicator-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
}

.status-pill-text {
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.hero-title {
  font-size: 2.75rem;
  line-height: 1.18;
  letter-spacing: -0.03em;
  color: var(--text-main);
  font-weight: 800;
}

:lang(km) .hero-title {
  letter-spacing: normal;
  line-height: 1.35;
}

@media (min-width: 768px) {
  .hero-title {
    font-size: 3.25rem;
  }
}

.hero-subtitle {
  font-size: 1.05rem;
  color: var(--text-muted);
  max-width: 700px;
  line-height: 1.6;
}

/* -------------------------------------------------------------
 * Interactive Quick-Search Bar
 * ------------------------------------------------------------- */
.search-command-card {
  width: 100%;
  max-width: 860px;
  margin-top: 1rem;
  padding: 1rem 1.25rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-default);
  background: var(--bg-surface);
}

.search-command-form {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-wrap: wrap;
}

@media (min-width: 768px) {
  .search-command-form {
    flex-wrap: nowrap;
  }
}

.search-input-group {
  flex: 1;
  min-width: 160px;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: left;
}

.search-field-label {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.search-select {
  width: 100%;
  padding: 0.45rem 0.5rem;
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--text-main);
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.search-select:hover,
.search-select:focus {
  border-color: var(--border-default);
  background: var(--bg-subtle);
}

.search-divider-vertical {
  width: 1px;
  height: 36px;
  background: var(--border-subtle);
  display: none;
}

@media (min-width: 768px) {
  .search-divider-vertical {
    display: block;
  }
}

.btn-search-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: var(--primary);
  color: #ffffff;
  padding: 0.65rem 1.4rem;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s ease;
  white-space: nowrap;
  min-height: 42px;
}

.btn-search-submit:hover {
  opacity: 0.9;
}

.quick-tags-strip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.85rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-subtle);
  flex-wrap: wrap;
}

.quick-tags-label {
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--text-dim);
}

.tag-chip {
  background: var(--bg-subtle);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  padding: 0.2rem 0.65rem;
  font-size: 0.75rem;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.tag-chip:hover {
  background: var(--bg-surface-hover);
  color: var(--text-main);
  border-color: var(--border-default);
}

/* Secondary CTA Actions */
.hero-actions-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.85rem;
  margin-top: 0.5rem;
}

.hero-action-btn {
  padding: 0.6rem 1.2rem;
  font-size: 0.88rem;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.btn-ghost-action {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.15s ease;
}

.btn-ghost-action:hover {
  color: var(--text-main);
}

.cta-dot-separator {
  color: var(--text-dim);
  font-size: 0.8rem;
}

/* -------------------------------------------------------------
 * Operational Metrics Strip
 * ------------------------------------------------------------- */
.metrics-banner-section {
  padding: 0 1.5rem;
}

.section-container {
  max-width: 1240px;
  margin: 0 auto;
}

.metrics-strip {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  padding: 1.5rem 1.75rem;
}

@media (min-width: 640px) {
  .metrics-strip {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .metrics-strip {
    grid-template-columns: repeat(4, 1fr);
  }
}

.metric-col {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
}

.metric-icon-box {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  flex-shrink: 0;
}

.metric-info {
  display: flex;
  flex-direction: column;
}

.metric-val {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.02em;
}

:lang(km) .metric-val {
  letter-spacing: normal;
}

.metric-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-main);
  margin-top: 2px;
}

.metric-detail {
  font-size: 0.74rem;
  color: var(--text-dim);
  margin-top: 2px;
}

/* -------------------------------------------------------------
 * Platform Architecture / Bento Showcase
 * ------------------------------------------------------------- */
.bento-section {
  padding: 0 1.5rem;
}

.section-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 2.25rem;
}

.eyebrow {
  color: var(--primary);
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.section-header h2 {
  font-size: 2.15rem;
  font-weight: 800;
  letter-spacing: -0.025em;
}

:lang(km) .section-header h2 {
  letter-spacing: normal;
  line-height: 1.35;
}

.section-subtitle {
  color: var(--text-muted);
  font-size: 0.98rem;
  max-width: 650px;
  margin: 0 auto;
  line-height: 1.6;
}

.bento-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

@media (min-width: 900px) {
  .bento-grid {
    grid-template-columns: 1.4fr 1fr;
  }
}

.bento-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.bento-hero-card {
  grid-row: span 2;
}

.bento-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.bento-badge-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bento-tag {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-dim);
}

.status-badge-emerald {
  font-size: 0.68rem;
  font-weight: 700;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.25);
  padding: 2px 7px;
  border-radius: var(--radius-sm);
}

.status-badge-amber {
  font-size: 0.68rem;
  font-weight: 700;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.25);
  padding: 2px 7px;
  border-radius: var(--radius-sm);
}

.status-badge-blue {
  font-size: 0.68rem;
  font-weight: 700;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.25);
  padding: 2px 7px;
  border-radius: var(--radius-sm);
}

.bento-inspect-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--primary);
  text-decoration: none;
}

.bento-inspect-link:hover {
  text-decoration: underline;
}

/* Bento Unit Preview */
.bento-unit-preview {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.unit-image-wrapper {
  position: relative;
  width: 100%;
  height: 240px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--border-subtle);
}

.unit-preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.unit-price-overlay {
  position: absolute;
  bottom: 12px;
  left: 12px;
  background: #18181b;
  color: #ffffff;
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 0.95rem;
}

.unit-preview-details h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
}

.unit-loc-text {
  font-size: 0.84rem;
  color: var(--text-muted);
  margin-top: 0.2rem;
}

.unit-specs-chips {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin-top: 0.75rem;
}

.spec-chip {
  font-size: 0.74rem;
  font-weight: 500;
  background: var(--bg-subtle);
  border: 1px solid var(--border-subtle);
  color: var(--text-muted);
  padding: 0.2rem 0.55rem;
  border-radius: var(--radius-sm);
}

/* Bento Invoice Widget */
.bento-invoice-widget {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.invoice-mini-header {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.invoice-icon-box {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--primary-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
}

.invoice-id {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-main);
}

.invoice-tenant {
  font-size: 0.76rem;
  color: var(--text-dim);
}

.invoice-breakdown-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.45rem 0;
  border-bottom: 1px solid var(--border-subtle);
}

.invoice-reconciled-box {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  background: var(--bg-subtle);
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-subtle);
  margin-top: 0.25rem;
}

/* Bento Maintenance Widget */
.bento-wo-widget {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.wo-mini-header {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.wo-icon-box {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: rgba(245, 158, 11, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.wo-title-text {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-main);
}

.wo-sla-text {
  font-size: 0.74rem;
  color: var(--text-dim);
}

.wo-progress-bar-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.wo-progress-track {
  width: 100%;
  height: 6px;
  background: var(--bg-subtle);
  border-radius: 999px;
  overflow: hidden;
}

.wo-progress-fill {
  height: 100%;
  background: #f59e0b;
  border-radius: 999px;
}

.wo-progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: var(--text-dim);
}

.wo-sla-guarantee {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

/* Bento Map Widget */
.bento-map-widget {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.map-coordinates-bar {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.coord-pill {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.74rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
  background: var(--bg-subtle);
  padding: 0.35rem 0.65rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-subtle);
}

.bento-map-desc {
  font-size: 0.84rem;
  color: var(--text-muted);
  line-height: 1.5;
}

.bento-map-cta {
  padding: 0.55rem 1.1rem;
  font-size: 0.84rem;
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

/* -------------------------------------------------------------
 * Cambodia Regional Hubs Section
 * ------------------------------------------------------------- */
.regions-section {
  padding: 0 1.5rem;
}

.regions-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

@media (min-width: 640px) {
  .regions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .regions-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.region-card {
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  text-decoration: none;
  transition: border-color 0.15s ease;
}

.region-card:hover {
  border-color: var(--primary);
}

.region-cover-wrap {
  position: relative;
  width: 100%;
  height: 160px;
  background: var(--bg-subtle);
}

.region-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.region-count-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(9, 9, 11, 0.8);
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
}

.region-rent-badge {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(9, 9, 11, 0.85);
  color: #ffffff;
  font-size: 0.74rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
}

.region-body {
  padding: 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.region-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.region-title-row h3 {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-main);
}

.region-arrow-icon {
  color: var(--text-dim);
  transition: transform 0.15s ease, color 0.15s ease;
}

.region-card:hover .region-arrow-icon {
  color: var(--primary);
  transform: translateX(3px);
}

.region-desc-text {
  font-size: 0.78rem;
  color: var(--text-muted);
  line-height: 1.45;
  flex: 1;
}

.region-districts-row {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  margin-top: 0.25rem;
}

.district-chip {
  font-size: 0.68rem;
  background: var(--bg-subtle);
  border: 1px solid var(--border-subtle);
  color: var(--text-dim);
  padding: 1px 6px;
  border-radius: 3px;
}

/* -------------------------------------------------------------
 * Stakeholder Portals (Role-Based Workflows)
 * ------------------------------------------------------------- */
.stakeholders-section {
  padding: 0 1.5rem;
}

.stakeholders-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

@media (min-width: 640px) {
  .stakeholders-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .stakeholders-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.stakeholder-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.stakeholder-header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.stakeholder-icon-box {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-sm);
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  flex-shrink: 0;
}

.stakeholder-tag {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-dim);
}

.stakeholder-role {
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.3;
}

.stakeholder-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.5;
}

.stakeholder-features-list {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-top: 1px solid var(--border-subtle);
  padding-top: 0.75rem;
}

.stakeholder-feat-item {
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  font-size: 0.76rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.feat-check-icon {
  color: #10b981;
  flex-shrink: 0;
  margin-top: 2px;
}

/* -------------------------------------------------------------
 * Trust & Security Infrastructure Strip
 * ------------------------------------------------------------- */
.trust-banner-section {
  padding: 0 1.5rem;
}

.trust-strip {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  padding: 1.35rem 1.75rem;
  align-items: center;
}

@media (min-width: 640px) {
  .trust-strip {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .trust-strip {
    grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr;
  }
}

.trust-col {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.trust-title {
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--text-main);
}

.trust-desc {
  font-size: 0.72rem;
  color: var(--text-dim);
  margin-top: 1px;
}

.trust-divider {
  width: 1px;
  height: 32px;
  background: var(--border-subtle);
  display: none;
}

@media (min-width: 1024px) {
  .trust-divider {
    display: block;
  }
}
</style>
