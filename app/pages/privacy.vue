<script setup lang="ts">
import { computed } from 'vue';
import {
  ShieldCheck,
  Lock,
  Database,
  FileText,
  AlertCircle,
  Clock,
  ArrowRight
} from '@lucide/vue';

definePageMeta({
  layout: 'default',
});

const { t } = useI18n();

useSeoMeta({
  title: 'Privacy Policy | RentEase Platform',
  description: 'Understand how RentEase collects, processes, stores, and protects personal data across landlord, tenant, and technician accounts in Cambodia.',
  ogTitle: 'Privacy Policy | RentEase',
  ogDescription: 'Data protection and privacy policy for the RentEase rental management platform.',
});

const policySections = computed(() => [
  {
    id: 'data-collection',
    number: '1',
    title: t('privacy.sec1_title'),
    content: [
      'Account Credentials & Profile: Full name, verified email address, phone number, encrypted password hash (derived via cryptographic scrypt), and selected platform role (Landlord or Tenant).',
      'Tenancy Applications: Identification references, employment status, declared monthly income, emergency contact details, and rental history submitted voluntarily when applying for vacant units.',
      'Lease & Contract Records: Assigned unit identifiers, rental terms, agreed monthly rent amounts, security deposit sums, lease start/end dates, and digital execution timestamps.',
      'Financial & Billing Transactions: System-generated invoice numbers, payment status records (PAID, PARTIALLY_PAID, OVERDUE), recorded payment methods (Bank Transfer, Credit Card, Cash), and partial settlement audit trails. RentEase does not store raw credit card numbers or banking passwords.',
      'Maintenance Work Orders: Repair descriptions, uploaded photographic attachments of maintenance issues, technician inspection notes, and completion verification timestamps.',
      'Technical & Audit Logs: Client IP addresses, browser user-agent strings, session identifiers, and immutable event logs recorded when security-critical actions are performed.'
    ]
  },
  {
    id: 'purposes-processing',
    number: '2',
    title: t('privacy.sec2_title'),
    content: [
      'Platform Service Execution: To provision user accounts, process vacancy applications, execute digital leases, generate monthly invoices, and coordinate maintenance repairs.',
      'Identity Verification & Authorization: To enforce strict Role-Based Access Control (RBAC) ensuring users only access information permitted by their account type.',
      'Transactional Communication: To send essential platform notifications, including invoice availability, overdue payment alerts, maintenance status updates, and lease signature requests.',
      'System Auditability & Security: To maintain immutable audit records protecting tenants and landlords against unauthorized modifications, fraudulent transactions, or account takeovers.'
    ]
  },
  {
    id: 'storage-security',
    number: '3',
    title: t('privacy.sec3_title'),
    content: [
      'Multi-Tenant Data Isolation: Database queries strictly isolate records by ownership (e.g. landlords can only access units and applications belonging to their managed properties; tenants can only view their active leases and invoices).',
      'Cryptographic Session Protection: Authenticated sessions use cryptographically random 32-byte tokens delivered exclusively through HTTP-only, SameSite=Lax (or Strict in production), Secure cookies to defend against XSS and session hijacking.',
      'Password Security: All user passwords are salted and hashed using scrypt prior to storage. Plaintext passwords are never logged, stored, or accessible to platform administrators.',
      'Network Security: External communications are enforced over Transport Layer Security (TLS 1.3/1.2).'
    ]
  },
  {
    id: 'data-sharing',
    number: '4',
    title: t('privacy.sec4_title'),
    content: [
      'Landlord-Tenant Interaction: When a tenant submits an application or signs a lease, their declared contact details and application criteria are shared exclusively with the landlord managing that specific property.',
      'Technician Service Dispatch: Dispatched service technicians receive only the unit identifier, contact name, issue description, and repair media required to complete the scheduled maintenance ticket.',
      'Zero Advertising Monetization: RentEase does not sell, rent, or trade personal data to third-party marketing brokers or behavioral advertisement networks.',
      'OpenFreeMap Integration: Property location exploration utilizes OpenFreeMap public vector tiles without transmitting personal user identities or account identifiers.'
    ]
  },
  {
    id: 'retention-erasure',
    number: '5',
    title: t('privacy.sec5_title'),
    content: [
      'Active Tenancy Records: Account data, leases, and payment receipts are retained for the duration of the active tenancy and for a standard 5-year statutory period following lease termination to satisfy financial accounting and tax compliance.',
      'Application Data: Unapproved or withdrawn applications may be archived or purged by the applicant or landlord after 90 days.',
      'Account Erasure Requests: Users may request deletion of their account when no active, unfulfilled leases or pending financial obligations exist by submitting a request through our Contact Support form.'
    ]
  },
  {
    id: 'user-rights',
    number: '6',
    title: t('privacy.sec6_title'),
    content: [
      'Right to Access: You may inspect your account profile, lease agreements, invoices, and payment receipts directly within your dashboard at any time.',
      'Right to Rectification: You may correct inaccurate personal profile details by updating your account settings or contacting your landlord regarding lease amendments.',
      'Right to Export: Tenants and landlords may review and request copies of their digital payment records and executed lease agreements.',
      'Right to Dispute: Inquiries regarding data processing or privacy concerns should be directed to our dedicated support channel via the Contact Us portal.'
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
          <ShieldCheck :size="14" class="badge-icon" />
          <span>{{ t('privacy.badge') }}</span>
        </div>
        <h1 class="legal-title">{{ t('privacy.title') }}</h1>
        <div class="legal-meta-row">
          <span class="meta-item">
            <strong>{{ t('privacy.version_label') }}:</strong> v1.0-2026
          </span>
          <span class="meta-dot">•</span>
          <span class="meta-item">
            <strong>{{ t('privacy.revised_label') }}:</strong> October 2026
          </span>
          <span class="meta-dot">•</span>
          <span class="meta-item">
            <strong>{{ t('privacy.jurisdiction_label') }}:</strong> {{ t('privacy.jurisdiction_val') }}
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
            <h4>{{ t('privacy.notice_title') }}</h4>
            <p>
              {{ t('privacy.notice_desc') }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="legal-body-section">
      <div class="legal-container">
        <div class="legal-layout">
          <!-- Sidebar Navigation for Desktop -->
          <aside class="legal-sidebar">
            <div class="toc-card card-flat">
              <span class="toc-title">{{ t('privacy.toc_title') }}</span>
              <nav class="toc-nav">
                <a
                  v-for="section in policySections"
                  :key="section.id"
                  :href="`#${section.id}`"
                  class="toc-link"
                >
                  <span class="toc-num">{{ section.number }}.</span>
                  <span>{{ section.title }}</span>
                </a>
                <a href="#contact-inquiries" class="toc-link">
                  <span class="toc-num">7.</span>
                  <span>{{ t('privacy.sec7_title') }}</span>
                </a>
              </nav>
            </div>
          </aside>

          <!-- Content Column -->
          <article class="legal-article">
            <div
              v-for="section in policySections"
              :key="section.id"
              :id="section.id"
              class="policy-block card-flat"
            >
              <div class="section-badge-row">
                <span class="section-pill">Section {{ section.number }}</span>
              </div>
              <h2 class="policy-section-title">{{ section.title }}</h2>

              <ul class="policy-items-list">
                <li v-for="(item, idx) in section.content" :key="idx" class="policy-item">
                  <p>{{ item }}</p>
                </li>
              </ul>
            </div>

            <!-- Contact & Privacy Inquiries Section -->
            <div id="contact-inquiries" class="policy-block card-flat highlight-block">
              <div class="section-badge-row">
                <span class="section-pill">Section 7</span>
              </div>
              <h2 class="policy-section-title">{{ t('privacy.sec7_title') }}</h2>
              <p class="mb-4">
                {{ t('privacy.sec7_desc') }}
              </p>

              <div class="contact-action-row">
                <NuxtLink to="/contact" class="btn-primary">
                  <span>{{ t('privacy.submit_inquiry') }}</span>
                  <ArrowRight :size="14" />
                </NuxtLink>
                <NuxtLink to="/terms" class="btn-secondary">
                  <span>{{ t('privacy.view_terms') }}</span>
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

/* Header Section */
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
  color: var(--accent-emerald);
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
