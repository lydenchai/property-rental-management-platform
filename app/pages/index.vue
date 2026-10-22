<script setup lang="ts">
import { Building, Key, Wrench, ShieldCheck, ArrowRight } from '@lucide/vue';
import { useAuth } from '../composables/useAuth';

const { isAuthenticated } = useAuth();
</script>

<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-container">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          <span>Property Rental Management Platform</span>
        </div>
        <h1 class="hero-title">
          Modern Property Operations & Rental Management
        </h1>
        <p class="hero-subtitle">
          RentEase connects property owners, tenants, and maintenance teams through an intuitive,
          centralized workflow — handling leasing, automated invoicing, and maintenance tracking.
        </p>

        <div class="hero-cta-group">
          <NuxtLink v-if="isAuthenticated" to="/dashboard" class="btn-primary hero-btn">
            <span>Open Dashboard</span>
            <ArrowRight :size="16" />
          </NuxtLink>
          <template v-else>
            <NuxtLink to="/login" class="btn-primary hero-btn">
              <span>Sign In / Demo Access</span>
              <ArrowRight :size="16" />
            </NuxtLink>
            <NuxtLink to="/register" class="btn-secondary hero-btn">
              <span>Register Account</span>
            </NuxtLink>
          </template>
        </div>
      </div>
    </section>

    <!-- Key Pillars Section -->
    <section class="pillars-section">
      <div class="section-container">
        <div class="section-header">
          <span class="eyebrow">Role-Based Architecture</span>
          <h2>Tailored for Every Stakeholder</h2>
        </div>

        <div class="pillars-grid">
          <div class="pillar-card card-flat">
            <div class="pillar-icon bg-indigo">
              <Building :size="22" />
            </div>
            <h3>For Landlords</h3>
            <p>
              Publish listings, manage unit availability, review tenant applications, and monitor monthly rental income from a unified console.
            </p>
          </div>

          <div class="pillar-card card-flat">
            <div class="pillar-icon bg-emerald">
              <Key :size="22" />
            </div>
            <h3>For Tenants</h3>
            <p>
              Browse listings, submit digital rental applications, view lease agreements, track invoices, and file maintenance requests directly.
            </p>
          </div>

          <div class="pillar-card card-flat">
            <div class="pillar-icon bg-amber">
              <Wrench :size="22" />
            </div>
            <h3>For Technicians</h3>
            <p>
              Receive dispatched work orders, view unit details, update progress status in real-time, and log completed repairs.
            </p>
          </div>

          <div class="pillar-card card-flat">
            <div class="pillar-icon bg-rose">
              <ShieldCheck :size="22" />
            </div>
            <h3>For Administrators</h3>
            <p>
              Manage cross-platform user permissions, monitor system-wide invoice settlements, and inspect immutable audit logs.
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
  gap: 4rem;
}

.hero-section {
  padding: 5rem 1.5rem 3rem;
  text-align: center;
}

.hero-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  padding: 0.35rem 0.85rem;
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 500;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--primary);
}

.hero-title {
  font-size: 2.75rem;
  line-height: 1.2;
  letter-spacing: -0.03em;
  color: var(--text-main);
}

.hero-subtitle {
  font-size: 1.1rem;
  color: var(--text-muted);
  max-width: 640px;
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
  padding: 0.75rem 1.6rem;
  font-size: 0.95rem;
}

.pillars-section {
  padding: 1rem 1.5rem 4rem;
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.section-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.eyebrow {
  color: #818cf8;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.section-header h2 {
  font-size: 1.85rem;
}

.pillars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.25rem;
}

.pillar-card {
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
}

.pillar-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-indigo { background: var(--primary-subtle); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.2); }
.bg-emerald { background: var(--accent-emerald-subtle); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.2); }
.bg-amber { background: var(--accent-amber-subtle); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.2); }
.bg-rose { background: var(--accent-rose-subtle); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2); }

.pillar-card h3 {
  font-size: 1.15rem;
  font-weight: 600;
}

.pillar-card p {
  color: var(--text-muted);
  font-size: 0.875rem;
  line-height: 1.55;
}
</style>
