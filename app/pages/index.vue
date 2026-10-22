<script setup lang="ts">
import { 
  Building, 
  Key, 
  Wrench, 
  ShieldCheck, 
  ArrowRight, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Compass,
  Layers,
  Sparkles
} from '@lucide/vue';
import { useAuth } from '../composables/useAuth';

const { isAuthenticated } = useAuth();

const keyMetrics = [
  { label: 'Managed Units', val: '1,200+', detail: 'Verified residences in Cambodia', icon: Building },
  { label: 'On-Time Rent Settlement', val: '99.8%', detail: 'Automated invoice workflows', icon: CheckCircle2 },
  { label: 'Maintenance SLA', val: '< 24 Hours', detail: 'Rapid technician dispatch', icon: Clock },
  { label: 'Vector Mapping', val: 'OpenFreeMap', detail: 'High-res interactive tiles', icon: Compass },
];

const featuredCities = [
  { name: 'Phnom Penh', desc: 'BKK1, Bassac Garden, Toul Kork & Chroy Changvar high-rises', count: '5 Complexes' },
  { name: 'Siem Reap', desc: 'Heritage boutique villas and riverside serviced residences', count: '2 Complexes' },
  { name: 'Sihanoukville', desc: 'Modern coastal sea-view residential towers & suites', count: '1 Complex' },
  { name: 'Kampot', desc: 'Riverside colonial estates and scenic garden residences', count: '1 Complex' },
];
</script>

<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-container">
        
        <h1 class="hero-title">
          Modern Property Operations &amp; Real Estate Management
        </h1>
        
        <p class="hero-subtitle">
          RentEase unifies property owners, residents, and field service technicians on a single, high-performance platform — combining verified vacancies, automated invoicing, digital lease workflows, and interactive OpenFreeMap vector navigation.
        </p>

        <div class="hero-cta-group">
          <NuxtLink v-if="isAuthenticated" to="/dashboard" class="btn-primary hero-btn">
            <span>Access Portal Dashboard</span>
            <ArrowRight :size="16" />
          </NuxtLink>
          <template v-else>
            <NuxtLink to="/properties" class="btn-primary hero-btn">
              <Compass :size="16" />
              <span>Explore Vacancies on Map</span>
            </NuxtLink>
            <NuxtLink to="/login" class="btn-secondary hero-btn">
              <span>Sign In / Demo Accounts</span>
            </NuxtLink>
          </template>
        </div>
      </div>
    </section>

    <!-- Operational Metrics Banner -->
    <section class="metrics-banner-section">
      <div class="section-container">
        <div class="metrics-strip card-flat">
          <div 
            v-for="(m, idx) in keyMetrics" 
            :key="idx" 
            class="metric-col"
          >
            <div class="metric-icon-box">
              <component :is="m.icon" :size="18" />
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

    <!-- OpenFreeMap Spotlight Callout -->
    <section class="map-spotlight-section">
      <div class="section-container">
        <div class="spotlight-card card-flat">
          <div class="spotlight-content">
            <span class="eyebrow">Interactive Vector Navigation</span>
            <h2>Locate Your Next Home with OpenFreeMap</h2>
            <p>
              RentEase features full OpenFreeMap vector tile integration. Explore properties across Phnom Penh, Siem Reap, Sihanoukville, and Kampot with interactive markers, neighborhood inspection, zoom controls, and directions.
            </p>
            <div class="spotlight-actions">
              <NuxtLink to="/properties" class="btn-primary">
                <span>View Full Cambodia Map</span>
                <ArrowRight :size="15" />
              </NuxtLink>
            </div>
          </div>

          <!-- City Chips Grid -->
          <div class="cities-preview-grid">
            <NuxtLink 
              v-for="city in featuredCities" 
              :key="city.name" 
              :to="`/properties?city=${encodeURIComponent(city.name)}`" 
              class="city-chip-card"
            >
              <div class="city-chip-top">
                <div class="city-name-row">
                  <MapPin :size="14" class="text-emerald-500" />
                  <strong>{{ city.name }}</strong>
                </div>
                <span class="city-count-badge">{{ city.count }}</span>
              </div>
              <p class="city-desc">{{ city.desc }}</p>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Key Pillars Section -->
    <section class="pillars-section">
      <div class="section-container">
        <div class="section-header">
          <span class="eyebrow">Modular Architecture</span>
          <h2>Engineered for Every Stakeholder</h2>
          <p class="section-subtitle">
            Role-based interfaces ensure each user sees exactly the operational controls and data they need.
          </p>
        </div>

        <div class="pillars-grid">
          <div class="pillar-card card-flat">
            <div class="pillar-icon bg-indigo">
              <Building :size="20" />
            </div>
            <h3>Landlords &amp; Asset Managers</h3>
            <p>
              Maintain accurate unit inventories, publish listings, evaluate incoming applications, and track recurring rent schedules.
            </p>
          </div>

          <div class="pillar-card card-flat">
            <div class="pillar-icon bg-emerald">
              <Key :size="20" />
            </div>
            <h3>Tenants &amp; Residents</h3>
            <p>
              Inspect floor plans and room galleries, submit digital applications, sign leases, and pay invoices with instant digital receipts.
            </p>
          </div>

          <div class="pillar-card card-flat">
            <div class="pillar-icon bg-amber">
              <Wrench :size="20" />
            </div>
            <h3>Operations &amp; Technicians</h3>
            <p>
              Receive assigned maintenance work orders, view unit specifications, report progress notes, and confirm repair resolutions.
            </p>
          </div>

          <div class="pillar-card card-flat">
            <div class="pillar-icon bg-rose">
              <ShieldCheck :size="20" />
            </div>
            <h3>Platform Administrators</h3>
            <p>
              Oversee cross-organization user accounts, verify platform system health, and inspect immutable security audit logs.
            </p>
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
  gap: 3.5rem;
}

.hero-section {
  padding: 4.5rem 1.5rem 2rem;
  text-align: center;
}

.hero-container {
  max-width: 820px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.hero-title {
  font-size: 2.75rem;
  line-height: 1.18;
  letter-spacing: -0.03em;
  color: var(--text-main);
  font-weight: 800;
}

@media (min-width: 768px) {
  .hero-title {
    font-size: 3.25rem;
  }
}

.hero-subtitle {
  font-size: 1.05rem;
  color: var(--text-muted);
  max-width: 680px;
  line-height: 1.6;
}

.hero-cta-group {
  display: flex;
  gap: 0.85rem;
  margin-top: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.hero-btn {
  padding: 0.75rem 1.5rem;
  font-size: 0.92rem;
  gap: 0.5rem;
}

/* Metrics Strip */
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
  padding: 1.75rem;
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

/* Map Spotlight */
.map-spotlight-section {
  padding: 0 1.5rem;
}

.spotlight-card {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  padding: 2.25rem;
  align-items: center;
}

@media (min-width: 992px) {
  .spotlight-card {
    grid-template-columns: 1.2fr 1fr;
  }
}

.spotlight-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.spotlight-content h2 {
  font-size: 1.75rem;
  line-height: 1.25;
}

.spotlight-content p {
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.6;
}

.spotlight-actions {
  margin-top: 0.75rem;
}

.cities-preview-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

@media (min-width: 600px) {
  .cities-preview-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.city-chip-card {
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  transition: all 0.15s ease;
  text-decoration: none;
}

.city-chip-card:hover {
  border-color: var(--primary);
  background: var(--bg-surface-hover);
}

.city-chip-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.city-name-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  color: var(--text-main);
}

.city-count-badge {
  font-size: 0.68rem;
  font-weight: 600;
  background: var(--bg-surface);
  color: var(--text-muted);
  border: 1px solid var(--border-subtle);
  padding: 1px 6px;
  border-radius: 4px;
}

.city-desc {
  font-size: 0.74rem;
  color: var(--text-dim);
  line-height: 1.4;
}

/* Pillars Section */
.pillars-section {
  padding: 0 1.5rem 2rem;
}

.section-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 2rem;
}

.eyebrow {
  color: var(--primary);
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.section-header h2 {
  font-size: 1.9rem;
}

.section-subtitle {
  color: var(--text-muted);
  font-size: 0.95rem;
  max-width: 600px;
  margin: 0 auto;
}

.pillars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
}

.pillar-card {
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.pillar-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-indigo { background: var(--primary-subtle); color: var(--primary); border: 1px solid rgba(79, 70, 229, 0.2); }
.bg-emerald { background: var(--accent-emerald-subtle); color: var(--accent-emerald); border: 1px solid rgba(16, 185, 129, 0.2); }
.bg-amber { background: var(--accent-amber-subtle); color: var(--accent-amber); border: 1px solid rgba(245, 158, 11, 0.2); }
.bg-rose { background: var(--accent-rose-subtle); color: var(--accent-rose); border: 1px solid rgba(239, 68, 68, 0.2); }

.pillar-card h3 {
  font-size: 1.1rem;
  font-weight: 700;
}

.pillar-card p {
  color: var(--text-muted);
  font-size: 0.875rem;
  line-height: 1.55;
}
</style>
