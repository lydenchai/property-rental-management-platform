<script setup lang="ts">
import { computed } from 'vue';
import {
  Building2,
  Users,
  Compass,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Clock,
  Layers,
  Award,
  HeartHandshake
} from '@lucide/vue';

definePageMeta({
  layout: 'default',
});

const { t } = useI18n();

useSeoMeta({
  title: 'About Us | RentEase Property Rental Management Platform',
  description: 'Learn about RentEase — Cambodia’s unified residential rental and property management platform connecting landlords, tenants, and field technicians with transparent operations.',
  ogTitle: 'About RentEase Platform',
  ogDescription: 'Unified residential rental and property management platform in Cambodia.',
});

const corePillars = computed(() => [
  {
    icon: Compass,
    title: t('about.pillar_map_title'),
    desc: t('about.pillar_map_desc')
  },
  {
    icon: ShieldCheck,
    title: t('about.pillar_sec_title'),
    desc: t('about.pillar_sec_desc')
  },
  {
    icon: Layers,
    title: t('about.pillar_life_title'),
    desc: t('about.pillar_life_desc')
  },
  {
    icon: Clock,
    title: t('about.pillar_maint_title'),
    desc: t('about.pillar_maint_desc')
  }
]);

const stakeholderProfiles = computed(() => [
  {
    role: t('about.landlord_title'),
    summary: t('about.landlord_desc'),
    highlights: [
      t('about.landlord_h1'),
      t('about.landlord_h2'),
      t('about.landlord_h3'),
      t('about.landlord_h4')
    ]
  },
  {
    role: t('about.tenant_title'),
    summary: t('about.tenant_desc'),
    highlights: [
      t('about.tenant_h1'),
      t('about.tenant_h2'),
      t('about.tenant_h3'),
      t('about.tenant_h4')
    ]
  },
  {
    role: t('about.tech_title'),
    summary: t('about.tech_desc'),
    highlights: [
      t('about.tech_h1'),
      t('about.tech_h2'),
      t('about.tech_h3'),
      t('about.tech_h4')
    ]
  },
  {
    role: t('about.admin_title'),
    summary: t('about.admin_desc'),
    highlights: [
      t('about.admin_h1'),
      t('about.admin_h2'),
      t('about.admin_h3'),
      t('about.admin_h4')
    ]
  }
]);

const cambodiaHubs = [
  { name: 'Phnom Penh', districts: 'BKK1, Bassac Garden, Toul Kork, Chroy Changvar', tag: 'Commercial & High-Rise Hub' },
  { name: 'Siem Reap', districts: 'Wat Bo, Old Market, Riverside Heritage Estates', tag: 'Heritage & Serviced Villas' },
  { name: 'Sihanoukville', districts: 'Otres Beach, Victory Hill, Coastal Residences', tag: 'Coastal Living Towers' },
  { name: 'Kampot', districts: 'Tuek Chhou, Riverside Colonial Estates', tag: 'Scenic & Riverside Living' },
];
</script>

<template>
  <div class="about-page">
    <!-- Header Hero Section -->
    <section class="about-hero-section">
      <div class="about-hero-container">
        <div class="about-badge">
          <Building2 :size="14" class="badge-icon" />
          <span>{{ t('about.badge') }}</span>
        </div>
        <h1 class="about-title">
          {{ t('about.title') }}
        </h1>
        <p class="about-lead">
          {{ t('about.lead') }}
        </p>
      </div>
    </section>

    <!-- Mission & Core Problem Statement -->
    <section class="mission-section">
      <div class="section-container">
        <div class="mission-grid">
          <div class="mission-card card-flat">
            <span class="card-eyebrow">{{ t('about.challenge_eyebrow') }}</span>
            <h2>{{ t('about.challenge_title') }}</h2>
            <p>
              {{ t('about.challenge_p1') }}
            </p>
            <p>
              {{ t('about.challenge_p2') }}
            </p>
          </div>

          <div class="mission-card card-flat accent-border">
            <span class="card-eyebrow text-emerald">{{ t('about.solution_eyebrow') }}</span>
            <h2>{{ t('about.solution_title') }}</h2>
            <p>
              {{ t('about.solution_p1') }}
            </p>
            <p>
              {{ t('about.solution_p2') }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Architectural Pillars -->
    <section class="pillars-section">
      <div class="section-container">
        <div class="section-header">
          <span class="eyebrow">{{ t('about.pillars_eyebrow') }}</span>
          <h2>{{ t('about.pillars_title') }}</h2>
          <p class="section-subtitle">
            {{ t('about.pillars_subtitle') }}
          </p>
        </div>

        <div class="pillars-grid">
          <div v-for="pillar in corePillars" :key="pillar.title" class="pillar-card card-flat">
            <div class="pillar-icon-box">
              <component :is="pillar.icon" :size="20" />
            </div>
            <h3>{{ pillar.title }}</h3>
            <p>{{ pillar.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stakeholder Breakdown -->
    <section class="stakeholders-section">
      <div class="section-container">
        <div class="section-header">
          <span class="eyebrow">{{ t('about.stakeholders_eyebrow') }}</span>
          <h2>{{ t('about.stakeholders_title') }}</h2>
          <p class="section-subtitle">
            {{ t('about.stakeholders_subtitle') }}
          </p>
        </div>

        <div class="stakeholder-cards-grid">
          <div v-for="profile in stakeholderProfiles" :key="profile.role" class="stakeholder-profile-card card-flat">
            <h3 class="profile-role-title">{{ profile.role }}</h3>
            <p class="profile-summary">{{ profile.summary }}</p>
            
            <div class="profile-highlights-divider" />
            
            <ul class="profile-highlights-list">
              <li v-for="(h, idx) in profile.highlights" :key="idx" class="highlight-item">
                <CheckCircle2 :size="14" class="check-icon" />
                <span>{{ h }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Cambodia Regional Reach -->
    <section class="regions-section">
      <div class="section-container">
        <div class="section-header">
          <span class="eyebrow">{{ t('about.regions_eyebrow') }}</span>
          <h2>{{ t('about.regions_title') }}</h2>
          <p class="section-subtitle">
            {{ t('about.regions_subtitle') }}
          </p>
        </div>

        <div class="regions-grid">
          <div v-for="hub in cambodiaHubs" :key="hub.name" class="hub-card card-flat">
            <div class="hub-header">
              <MapPin :size="16" class="hub-pin" />
              <h3>{{ hub.name }}</h3>
              <span class="hub-tag">{{ hub.tag }}</span>
            </div>
            <p class="hub-districts">{{ hub.districts }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Bottom Call-to-Action -->
    <section class="cta-banner-section">
      <div class="section-container">
        <div class="cta-banner card-flat">
          <div class="cta-content">
            <h2>{{ t('about.cta_title') }}</h2>
            <p>
              {{ t('about.cta_desc') }}
            </p>
          </div>
          <div class="cta-actions">
            <NuxtLink to="/properties" class="btn-primary">
              <span>{{ t('about.browse_vacancies') }}</span>
              <ArrowRight :size="15" />
            </NuxtLink>
            <NuxtLink to="/contact" class="btn-secondary">
              <span>{{ t('about.contact_support') }}</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-page {
  display: flex;
  flex-direction: column;
  gap: 3.5rem;
  padding-bottom: 3rem;
}

.section-container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Hero Section */
.about-hero-section {
  padding: 4rem 1.5rem 2rem;
  text-align: center;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-surface);
}

.about-hero-container {
  max-width: 820px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.about-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  padding: 0.35rem 0.85rem;
  border-radius: var(--radius-full);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-icon {
  color: var(--primary);
}

.about-title {
  font-size: 2.35rem;
  line-height: 1.22;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--text-main);
}

@media (min-width: 768px) {
  .about-title {
    font-size: 3rem;
  }
}

.about-lead {
  font-size: 1.05rem;
  line-height: 1.6;
  color: var(--text-muted);
  max-width: 720px;
}

/* Mission Section */
.mission-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .mission-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.mission-card {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card-eyebrow {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-dim);
}

.text-emerald {
  color: var(--accent-emerald);
}

.mission-card h2 {
  font-size: 1.45rem;
  line-height: 1.3;
}

.mission-card p {
  color: var(--text-muted);
  font-size: 0.92rem;
  line-height: 1.6;
}

.accent-border {
  border-left: 3px solid var(--accent-emerald);
}

/* Pillars Section */
.section-header {
  text-align: center;
  max-width: 700px;
  margin: 0 auto 2.5rem;
}

.eyebrow {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-indigo-accent);
  margin-bottom: 0.4rem;
}

.section-header h2 {
  font-size: 2rem;
  letter-spacing: -0.02em;
  margin-bottom: 0.65rem;
}

.section-subtitle {
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.55;
}

.pillars-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

@media (min-width: 640px) {
  .pillars-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.pillar-card {
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.pillar-icon-box {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
}

.pillar-card h3 {
  font-size: 1.15rem;
}

.pillar-card p {
  color: var(--text-muted);
  font-size: 0.88rem;
  line-height: 1.55;
}

/* Stakeholder Cards Grid */
.stakeholder-cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .stakeholder-cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stakeholder-profile-card {
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
}

.profile-role-title {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.profile-summary {
  color: var(--text-muted);
  font-size: 0.88rem;
  line-height: 1.5;
  margin-bottom: 1.25rem;
}

.profile-highlights-divider {
  height: 1px;
  background: var(--border-subtle);
  margin-bottom: 1.25rem;
}

.profile-highlights-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.highlight-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.85rem;
  color: var(--text-main);
}

.check-icon {
  color: var(--accent-emerald);
  flex-shrink: 0;
}

/* Regional Reach */
.regions-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
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

.hub-card {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.hub-header {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.hub-pin {
  color: var(--color-indigo-accent);
}

.hub-card h3 {
  font-size: 1.1rem;
}

.hub-tag {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.hub-districts {
  color: var(--text-muted);
  font-size: 0.82rem;
  line-height: 1.45;
}

/* CTA Banner */
.cta-banner {
  padding: 2.5rem 2rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: flex-start;
  justify-content: space-between;
}

@media (min-width: 768px) {
  .cta-banner {
    flex-direction: row;
    align-items: center;
  }
}

.cta-content {
  max-width: 600px;
}

.cta-content h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.cta-content p {
  color: var(--text-muted);
  font-size: 0.92rem;
  line-height: 1.5;
}

.cta-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
</style>
