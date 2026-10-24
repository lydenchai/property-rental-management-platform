<script setup lang="ts">
import { computed } from 'vue';
import {
  FileText,
  AlertCircle,
  CheckCircle2,
  Scale,
  ShieldAlert,
  ArrowRight
} from '@lucide/vue';

definePageMeta({
  layout: 'default',
});

const { t } = useI18n();

useSeoMeta({
  title: 'Terms & Conditions | RentEase Platform',
  description: 'Review the terms of service, account responsibilities, tenancy applications, digital leases, payment handling, and platform rules for RentEase in Cambodia.',
  ogTitle: 'Terms & Conditions | RentEase',
  ogDescription: 'Operating terms and conditions for RentEase property rental management platform.',
});

const termsSections = computed(() => [
  {
    id: 'acceptance',
    number: '1',
    title: t('terms.sec1_title'),
    clauses: [
      'By registering an account, submitting a rental application, executing a digital lease, or otherwise using the RentEase platform, you agree to be bound by these Terms & Conditions and acknowledge our Privacy Policy.',
      'To hold an active account, you must possess the legal capacity to enter into binding residential rental contracts under the laws of the Kingdom of Cambodia.',
      'If you represent an asset management entity or commercial property company, you affirm that you possess the requisite authority to bind that entity to these Terms.'
    ]
  },
  {
    id: 'accounts',
    number: '2',
    title: t('terms.sec2_title'),
    clauses: [
      'Accurate Information: You agree to provide true, accurate, current, and complete details during registration and to promptly update your profile if information changes.',
      'Role Selection: You must select the role accurately representing your capacity (e.g., Tenant or Landlord). Providing misleading role assertions is strictly prohibited.',
      'Credential Confidentiality: You are solely responsible for safeguarding your login credentials. Any activity originating from your authenticated session is deemed your authorized act.',
      'Notification of Breach: You must immediately report any suspected unauthorized access or compromise of your account through our Contact portal.'
    ]
  },
  {
    id: 'applications',
    number: '3',
    title: t('terms.sec3_title'),
    clauses: [
      'Application Accuracy: Tenants warrant that all income disclosures, identification details, and employment references provided in tenancy applications are truthful and verifiable.',
      'Landlord Authority: Landlords retain sole discretion to accept, decline, or request supplemental verification for rental applications in compliance with applicable housing laws.',
      'No Tenancy Guarantee: The submission of an application does not create a tenancy or grant access rights until a formal Lease Agreement has been digitally executed by both parties.'
    ]
  },
  {
    id: 'leases',
    number: '4',
    title: t('terms.sec4_title'),
    clauses: [
      'Binding Mutual Execution: When both the Landlord and Tenant complete digital execution of a lease agreement on RentEase, the agreement constitutes a legally binding rental contract between the two parties.',
      'Inventory Status Transition: Upon mutual signature, the assigned unit status automatically updates to OCCUPIED or RESERVED, preventing duplicate allocation.',
      'Direct Landlord-Tenant Relationship: RentEase provides the software infrastructure and legal state tracking. RentEase is not a party to the underlying tenancy contract, unless explicitly acting as designated asset manager.'
    ]
  },
  {
    id: 'invoicing-payments',
    number: '5',
    title: t('terms.sec5_title'),
    clauses: [
      'Automated Invoicing: Invoices are generated systematically according to the agreed lease terms, rent amounts, and due dates established by the landlord.',
      'Payment Records & Receipts: RentEase records settlement statuses (PAID, PARTIALLY_PAID, OVERDUE) and issues immutable digital payment receipts with itemized balances.',
      'Payment Channels: Underlying fund transfers occur via direct bank settlement, cash verification, or supported payment processors. RentEase does not hold escrow funds unless explicitly licensed and contracted.',
      'Delinquency Handling: Invoices remaining unpaid past their designated due date and grace period are flagged as OVERDUE, notifying both landlord and resident.'
    ]
  },
  {
    id: 'maintenance',
    number: '6',
    title: t('terms.sec6_title'),
    clauses: [
      'Resident Obligations: Residents must submit maintenance requests promptly upon discovering hazardous conditions, plumbing leaks, or electrical faults to mitigate property damage.',
      'Landlord & Technician Obligations: Landlords must address urgent and emergency maintenance tickets within reasonable operational SLAs. Dispatched technicians must respect resident privacy and agreed access hours.',
      'Resolution Sign-Off: Once a repair is completed, technicians document the resolution on-site, allowing residents and landlords to verify and close the work order.'
    ]
  },
  {
    id: 'acceptable-use',
    number: '7',
    title: t('terms.sec7_title'),
    clauses: [
      'Fraudulent Listings: Landlords may not list properties or units they do not own, manage, or have verified authority to lease.',
      'System Interference: Users may not probe, scan, or test the vulnerability of platform APIs, inject malicious scripts, or attempt to bypass session authorization.',
      'Automated Scraping: Scraping, data harvesting, or automated querying of property listings without explicit permission is strictly prohibited.'
    ]
  },
  {
    id: 'disputes-liability',
    number: '8',
    title: t('terms.sec8_title'),
    clauses: [
      'Tenancy Disputes: Disputes regarding lease obligations, security deposit deductions, or physical property conditions must be resolved directly between landlord and tenant under Cambodian law.',
      'Platform Disclaimer: RentEase provides the software "AS-IS" and "AS-AVAILABLE". RentEase disclaims warranties of merchantability, fitness for a specific purpose, or uninterrupted uptime.',
      'Limitation of Damages: To the maximum extent permitted by applicable law, RentEase shall not be liable for indirect, punitive, or consequential damages resulting from platform use.'
    ]
  },
  {
    id: 'amendments',
    number: '9',
    title: t('terms.sec9_title'),
    clauses: [
      'Material Changes: In the event of material revisions to these Terms, registered users will be notified via email or dashboard announcement at least 14 days before new terms take effect.',
      'Version Archival: Historic versions of these Terms are maintained with explicit version tags (current: v1.0-2026). Continued use following revisions constitutes acceptance of the updated terms.'
    ]
  }
]);
</script>

<template>
  <div class="legal-page">
    <!-- Header -->
    <section class="legal-header-section">
      <div class="legal-header-container">
        <div class="legal-badge">
          <Scale :size="14" class="badge-icon" />
          <span>{{ t('terms.badge') }}</span>
        </div>
        <h1 class="legal-title">{{ t('terms.title') }}</h1>
        <div class="legal-meta-row">
          <span class="meta-item">
            <strong>{{ t('terms.version_label') }}:</strong> v1.0-2026
          </span>
          <span class="meta-dot">•</span>
          <span class="meta-item">
            <strong>{{ t('terms.revised_label') }}:</strong> October 2026
          </span>
          <span class="meta-dot">•</span>
          <span class="meta-item">
            <strong>{{ t('terms.jurisdiction_label') }}:</strong> {{ t('terms.jurisdiction_val') }}
          </span>
        </div>
      </div>
    </section>

    <!-- Jurisdictional Disclaimer Alert -->
    <section class="disclaimer-alert-section">
      <div class="legal-container">
        <div class="alert-box card-flat">
          <AlertCircle :size="18" class="alert-icon flex-shrink-0" />
          <div class="alert-content">
            <h4>{{ t('terms.notice_title') }}</h4>
            <p>
              {{ t('terms.notice_desc') }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="legal-body-section">
      <div class="legal-container">
        <div class="legal-layout">
          <!-- Sidebar Navigation -->
          <aside class="legal-sidebar">
            <div class="toc-card card-flat">
              <span class="toc-title">{{ t('terms.toc_title') }}</span>
              <nav class="toc-nav">
                <a
                  v-for="section in termsSections"
                  :key="section.id"
                  :href="`#${section.id}`"
                  class="toc-link"
                >
                  <span class="toc-num">{{ section.number }}.</span>
                  <span>{{ section.title }}</span>
                </a>
                <a href="#support-contacts" class="toc-link">
                  <span class="toc-num">10.</span>
                  <span>{{ t('terms.sec10_title') }}</span>
                </a>
              </nav>
            </div>
          </aside>

          <!-- Content Column -->
          <article class="legal-article">
            <div
              v-for="section in termsSections"
              :key="section.id"
              :id="section.id"
              class="policy-block card-flat"
            >
              <div class="section-badge-row">
                <span class="section-pill">Section {{ section.number }}</span>
              </div>
              <h2 class="policy-section-title">{{ section.title }}</h2>

              <ul class="policy-items-list">
                <li v-for="(clause, idx) in section.clauses" :key="idx" class="policy-item">
                  <p>{{ clause }}</p>
                </li>
              </ul>
            </div>

            <!-- Support & Assistance Section -->
            <div id="support-contacts" class="policy-block card-flat highlight-block">
              <div class="section-badge-row">
                <span class="section-pill">Section 10</span>
              </div>
              <h2 class="policy-section-title">{{ t('terms.sec10_title') }}</h2>
              <p class="mb-4">
                {{ t('terms.sec10_desc') }}
              </p>

              <div class="contact-action-row">
                <NuxtLink to="/contact" class="btn-primary">
                  <span>{{ t('terms.contact_desk') }}</span>
                  <ArrowRight :size="14" />
                </NuxtLink>
                <NuxtLink to="/privacy" class="btn-secondary">
                  <span>{{ t('terms.view_privacy') }}</span>
                </NuxtLink>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.legal-page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding-bottom: 4rem;
}

.legal-container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 1.5rem;
  width: 100%;
}

/* Header */
.legal-header-section {
  padding: 3.5rem 1.5rem 2rem;
  text-align: center;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-surface);
}

.legal-header-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.legal-badge {
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
  color: var(--color-indigo-accent);
}

.legal-title {
  font-size: 2.25rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  color: var(--text-main);
}

@media (min-width: 768px) {
  .legal-title {
    font-size: 2.75rem;
  }
}

.legal-meta-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
  font-size: 0.84rem;
  color: var(--text-muted);
}

.meta-dot {
  color: var(--text-dim);
}

/* Alert Box */
.alert-box {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-left: 3px solid var(--accent-amber);
  background: var(--bg-surface);
}

.alert-icon {
  color: var(--accent-amber);
  margin-top: 0.15rem;
}

.alert-content h4 {
  font-size: 0.95rem;
  margin-bottom: 0.35rem;
}

.alert-content p {
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.5;
}

/* Layout */
.legal-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  align-items: flex-start;
}

@media (min-width: 900px) {
  .legal-layout {
    grid-template-columns: 280px 1fr;
  }
}

.legal-sidebar {
  position: sticky;
  top: 5.5rem;
}

.toc-card {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.toc-title {
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-dim);
}

.toc-nav {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.toc-link {
  font-size: 0.82rem;
  color: var(--text-muted);
  padding: 0.3rem 0.5rem;
  border-radius: var(--radius-sm);
  transition: all 0.15s ease;
  line-height: 1.35;
  display: flex;
  gap: 0.4rem;
}

.toc-num {
  font-weight: 600;
  color: var(--text-main);
}

.toc-link:hover {
  background: var(--bg-subtle);
  color: var(--text-main);
}

/* Article & Blocks */
.legal-article {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.policy-block {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.section-badge-row {
  display: flex;
}

.section-pill {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-indigo-accent);
  background: var(--bg-subtle);
  padding: 0.2rem 0.55rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-default);
}

.policy-section-title {
  font-size: 1.35rem;
  line-height: 1.3;
}

.policy-items-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.policy-item p {
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.6;
}

.highlight-block {
  border-left: 3px solid var(--primary);
}

.contact-action-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}
</style>
