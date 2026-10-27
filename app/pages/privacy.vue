<script setup lang="ts">
import { computed } from 'vue';
import { ShieldCheck, AlertCircle, ArrowRight } from '@lucide/vue';

definePageMeta({
  layout: 'default',
});

const { t } = useI18n();

useSeoMeta({
  title: 'Privacy Policy | RentEase Platform',
  description:
    'Understand how RentEase collects, processes, stores, and protects personal data across landlord, tenant, and technician accounts in Cambodia.',
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
      'Technical & Audit Logs: Client IP addresses, browser user-agent strings, session identifiers, and immutable event logs recorded when security-critical actions are performed.',
    ],
  },
  {
    id: 'purposes-processing',
    number: '2',
    title: t('privacy.sec2_title'),
    content: [
      'Platform Service Execution: To provision user accounts, process vacancy applications, execute digital leases, generate monthly invoices, and coordinate maintenance repairs.',
      'Identity Verification & Authorization: To enforce strict Role-Based Access Control (RBAC) ensuring users only access information permitted by their account type.',
      'Transactional Communication: To send essential platform notifications, including invoice availability, overdue payment alerts, maintenance status updates, and lease signature requests.',
      'System Auditability & Security: To maintain immutable audit records protecting tenants and landlords against unauthorized modifications, fraudulent transactions, or account takeovers.',
    ],
  },
  {
    id: 'storage-security',
    number: '3',
    title: t('privacy.sec3_title'),
    content: [
      'Multi-Tenant Data Isolation: Database queries strictly isolate records by ownership (e.g. landlords can only access units and applications belonging to their managed properties; tenants can only view their active leases and invoices).',
      'Cryptographic Session Protection: Authenticated sessions use cryptographically random 32-byte tokens delivered exclusively through HTTP-only, SameSite=Lax (or Strict in production), Secure cookies to defend against XSS and session hijacking.',
      'Password Security: All user passwords are salted and hashed using scrypt prior to storage. Plaintext passwords are never logged, stored, or accessible to platform administrators.',
      'Network Security: External communications are enforced over Transport Layer Security (TLS 1.3/1.2).',
    ],
  },
  {
    id: 'data-sharing',
    number: '4',
    title: t('privacy.sec4_title'),
    content: [
      'Landlord-Tenant Interaction: When a tenant submits an application or signs a lease, their declared contact details and application criteria are shared exclusively with the landlord managing that specific property.',
      'Technician Service Dispatch: Dispatched service technicians receive only the unit identifier, contact name, issue description, and repair media required to complete the scheduled maintenance ticket.',
      'Zero Advertising Monetization: RentEase does not sell, rent, or trade personal data to third-party marketing brokers or behavioral advertisement networks.',
      'OpenFreeMap Integration: Property location exploration utilizes OpenFreeMap public vector tiles without transmitting personal user identities or account identifiers.',
    ],
  },
  {
    id: 'retention-erasure',
    number: '5',
    title: t('privacy.sec5_title'),
    content: [
      'Active Tenancy Records: Account data, leases, and payment receipts are retained for the duration of the active tenancy and for a standard 5-year statutory period following lease termination to satisfy financial accounting and tax compliance.',
      'Application Data: Unapproved or withdrawn applications may be archived or purged by the applicant or landlord after 90 days.',
      'Account Erasure Requests: Users may request deletion of their account when no active, unfulfilled leases or pending financial obligations exist by submitting a request through our Contact Support form.',
    ],
  },
  {
    id: 'user-rights',
    number: '6',
    title: t('privacy.sec6_title'),
    content: [
      'Right to Access: You may inspect your account profile, lease agreements, invoices, and payment receipts directly within your dashboard at any time.',
      'Right to Rectification: You may correct inaccurate personal profile details by updating your account settings or contacting your landlord regarding lease amendments.',
      'Right to Export: Tenants and landlords may review and request copies of their digital payment records and executed lease agreements.',
      'Right to Dispute: Inquiries regarding data processing or privacy concerns should be directed to our dedicated support channel via the Contact Us portal.',
    ],
  },
]);
</script>

<template>
  <div class="flex flex-col gap-8 pb-16">
    <!-- Header -->
    <section
      class="border-b border-neutral-200 bg-white px-4 py-12 text-center transition-colors dark:border-neutral-800 dark:bg-neutral-950 sm:px-6"
    >
      <div class="mx-auto flex max-w-3xl flex-col items-center gap-4">
        <div
          class="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
        >
          <ShieldCheck :size="14" class="text-blue-600 dark:text-blue-400" />
          <span>{{ t('privacy.badge') }}</span>
        </div>
        <h1 class="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
          {{ t('privacy.title') }}
        </h1>
        <div
          class="flex flex-wrap items-center justify-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm"
        >
          <span
            ><strong>{{ t('privacy.version_label') }}:</strong> v1.0-2026</span
          >
          <span class="text-neutral-300 dark:text-neutral-700">•</span>
          <span
            ><strong>{{ t('privacy.revised_label') }}:</strong> October 2026</span
          >
          <span class="text-neutral-300 dark:text-neutral-700">•</span>
          <span
            ><strong>{{ t('privacy.jurisdiction_label') }}:</strong>
            {{ t('privacy.jurisdiction_val') }}</span
          >
        </div>
      </div>
    </section>

    <!-- Jurisdictional Disclaimer Alert -->
    <section class="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div
        class="flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-blue-900 dark:text-blue-200"
      >
        <AlertCircle :size="18" class="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
        <div class="flex flex-col gap-1 text-sm">
          <h4 class="font-bold text-blue-950 dark:text-blue-100">
            {{ t('privacy.notice_title') }}
          </h4>
          <p class="leading-relaxed opacity-90">
            {{ t('privacy.notice_desc') }}
          </p>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div class="grid grid-cols-1 items-start gap-8 lg:grid-cols-4">
        <!-- Sidebar Navigation for Desktop -->
        <aside class="lg:sticky lg:top-20 lg:col-span-1">
          <div
            class="shadow-xs rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <span
              class="mb-3 block text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500"
            >
              {{ t('privacy.toc_title') }}
            </span>
            <nav class="flex flex-col gap-1">
              <a
                v-for="section in policySections"
                :key="section.id"
                :href="`#${section.id}`"
                class="flex items-start gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
              >
                <span class="font-mono text-neutral-400 dark:text-neutral-500"
                  >{{ section.number }}.</span
                >
                <span>{{ section.title }}</span>
              </a>
              <a
                href="#contact-inquiries"
                class="flex items-start gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
              >
                <span class="font-mono text-neutral-400 dark:text-neutral-500">7.</span>
                <span>{{ t('privacy.sec7_title') }}</span>
              </a>
            </nav>
          </div>
        </aside>

        <!-- Content Column -->
        <article class="flex flex-col gap-6 lg:col-span-3">
          <div
            v-for="section in policySections"
            :key="section.id"
            :id="section.id"
            class="shadow-xs scroll-mt-24 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 sm:p-8"
          >
            <div class="mb-2">
              <span
                class="inline-flex items-center rounded bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
              >
                Section {{ section.number }}
              </span>
            </div>
            <h2 class="mb-4 text-xl font-bold text-neutral-900 dark:text-white">
              {{ section.title }}
            </h2>

            <ul
              class="flex list-inside list-disc flex-col gap-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300"
            >
              <li v-for="(item, idx) in section.content" :key="idx" class="pl-1">
                <span class="inline leading-relaxed">{{ item }}</span>
              </li>
            </ul>
          </div>

          <!-- Contact & Privacy Inquiries Section -->
          <div
            id="contact-inquiries"
            class="shadow-xs scroll-mt-24 rounded-xl border border-blue-200 bg-blue-50/50 p-6 dark:border-blue-900/50 dark:bg-neutral-900 sm:p-8"
          >
            <div class="mb-2">
              <span
                class="inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-900/60 dark:text-blue-300"
              >
                Section 7
              </span>
            </div>
            <h2 class="mb-3 text-xl font-bold text-neutral-900 dark:text-white">
              {{ t('privacy.sec7_title') }}
            </h2>
            <p class="mb-6 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
              {{ t('privacy.sec7_desc') }}
            </p>

            <div class="flex flex-wrap items-center gap-3">
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
    </section>
  </div>
</template>
