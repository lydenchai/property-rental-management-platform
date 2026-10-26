<script setup lang="ts">
import { computed } from 'vue';
import { FileText, AlertCircle, CheckCircle2, Scale, ShieldAlert, ArrowRight } from '@lucide/vue';

definePageMeta({
  layout: 'default',
});

const { t } = useI18n();

useSeoMeta({
  title: 'Terms & Conditions | RentEase Platform',
  description:
    'Review the terms of service, account responsibilities, tenancy applications, digital leases, payment handling, and platform rules for RentEase in Cambodia.',
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
      'If you represent an asset management entity or commercial property company, you affirm that you possess the requisite authority to bind that entity to these Terms.',
    ],
  },
  {
    id: 'accounts',
    number: '2',
    title: t('terms.sec2_title'),
    clauses: [
      'Accurate Information: You agree to provide true, accurate, current, and complete details during registration and to promptly update your profile if information changes.',
      'Role Selection: You must select the role accurately representing your capacity (e.g., Tenant or Landlord). Providing misleading role assertions is strictly prohibited.',
      'Credential Confidentiality: You are solely responsible for safeguarding your login credentials. Any activity originating from your authenticated session is deemed your authorized act.',
      'Notification of Breach: You must immediately report any suspected unauthorized access or compromise of your account through our Contact portal.',
    ],
  },
  {
    id: 'applications',
    number: '3',
    title: t('terms.sec3_title'),
    clauses: [
      'Application Accuracy: Tenants warrant that all income disclosures, identification details, and employment references provided in tenancy applications are truthful and verifiable.',
      'Landlord Authority: Landlords retain sole discretion to accept, decline, or request supplemental verification for rental applications in compliance with applicable housing laws.',
      'No Tenancy Guarantee: The submission of an application does not create a tenancy or grant access rights until a formal Lease Agreement has been digitally executed by both parties.',
    ],
  },
  {
    id: 'leases',
    number: '4',
    title: t('terms.sec4_title'),
    clauses: [
      'Binding Mutual Execution: When both the Landlord and Tenant complete digital execution of a lease agreement on RentEase, the agreement constitutes a legally binding rental contract between the two parties.',
      'Inventory Status Transition: Upon mutual signature, the assigned unit status automatically updates to OCCUPIED or RESERVED, preventing duplicate allocation.',
      'Direct Landlord-Tenant Relationship: RentEase provides the software infrastructure and legal state tracking. RentEase is not a party to the underlying tenancy contract, unless explicitly acting as designated asset manager.',
    ],
  },
  {
    id: 'invoicing-payments',
    number: '5',
    title: t('terms.sec5_title'),
    clauses: [
      'Automated Invoicing: Invoices are generated systematically according to the agreed lease terms, rent amounts, and due dates established by the landlord.',
      'Payment Records & Receipts: RentEase records settlement statuses (PAID, PARTIALLY_PAID, OVERDUE) and issues immutable digital payment receipts with itemized balances.',
      'Payment Channels: Underlying fund transfers occur via direct bank settlement, cash verification, or supported payment processors. RentEase does not hold escrow funds unless explicitly licensed and contracted.',
      'Delinquency Handling: Invoices remaining unpaid past their designated due date and grace period are flagged as OVERDUE, notifying both landlord and resident.',
    ],
  },
  {
    id: 'maintenance',
    number: '6',
    title: t('terms.sec6_title'),
    clauses: [
      'Resident Obligations: Residents must submit maintenance requests promptly upon discovering hazardous conditions, plumbing leaks, or electrical faults to mitigate property damage.',
      'Landlord & Technician Obligations: Landlords must address urgent and emergency maintenance tickets within reasonable operational SLAs. Dispatched technicians must respect resident privacy and agreed access hours.',
      'Resolution Sign-Off: Once a repair is completed, technicians document the resolution on-site, allowing residents and landlords to verify and close the work order.',
    ],
  },
  {
    id: 'acceptable-use',
    number: '7',
    title: t('terms.sec7_title'),
    clauses: [
      'Fraudulent Listings: Landlords may not list properties or units they do not own, manage, or have verified authority to lease.',
      'System Interference: Users may not probe, scan, or test the vulnerability of platform APIs, inject malicious scripts, or attempt to bypass session authorization.',
      'Automated Scraping: Scraping, data harvesting, or automated querying of property listings without explicit permission is strictly prohibited.',
    ],
  },
  {
    id: 'disputes-liability',
    number: '8',
    title: t('terms.sec8_title'),
    clauses: [
      'Tenancy Disputes: Disputes regarding lease obligations, security deposit deductions, or physical property conditions must be resolved directly between landlord and tenant under Cambodian law.',
      'Platform Disclaimer: RentEase provides the software "AS-IS" and "AS-AVAILABLE". RentEase disclaims warranties of merchantability, fitness for a specific purpose, or uninterrupted uptime.',
      'Limitation of Damages: To the maximum extent permitted by applicable law, RentEase shall not be liable for indirect, punitive, or consequential damages resulting from platform use.',
    ],
  },
  {
    id: 'amendments',
    number: '9',
    title: t('terms.sec9_title'),
    clauses: [
      'Material Changes: In the event of material revisions to these Terms, registered users will be notified via email or dashboard announcement at least 14 days before new terms take effect.',
      'Version Archival: Historic versions of these Terms are maintained with explicit version tags (current: v1.0-2026). Continued use following revisions constitutes acceptance of the updated terms.',
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
          <Scale :size="14" class="text-blue-600 dark:text-blue-400" />
          <span>{{ t('terms.badge') }}</span>
        </div>
        <h1 class="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
          {{ t('terms.title') }}
        </h1>
        <div
          class="flex flex-wrap items-center justify-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm"
        >
          <span
            ><strong>{{ t('terms.version_label') }}:</strong> v1.0-2026</span
          >
          <span class="text-neutral-300 dark:text-neutral-700">•</span>
          <span
            ><strong>{{ t('terms.revised_label') }}:</strong> October 2026</span
          >
          <span class="text-neutral-300 dark:text-neutral-700">•</span>
          <span
            ><strong>{{ t('terms.jurisdiction_label') }}:</strong>
            {{ t('terms.jurisdiction_val') }}</span
          >
        </div>
      </div>
    </section>

    <!-- Jurisdictional Disclaimer Alert -->
    <section class="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div
        class="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-200"
      >
        <AlertCircle :size="18" class="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div class="flex flex-col gap-1 text-sm">
          <h4 class="font-bold text-amber-950 dark:text-amber-100">
            {{ t('terms.notice_title') }}
          </h4>
          <p class="leading-relaxed opacity-90">
            {{ t('terms.notice_desc') }}
          </p>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div class="grid grid-cols-1 items-start gap-8 lg:grid-cols-4">
        <!-- Sidebar Navigation -->
        <aside class="lg:sticky lg:top-20 lg:col-span-1">
          <div
            class="shadow-xs rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <span
              class="mb-3 block text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500"
            >
              {{ t('terms.toc_title') }}
            </span>
            <nav class="flex flex-col gap-1">
              <a
                v-for="section in termsSections"
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
                href="#support-contacts"
                class="flex items-start gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
              >
                <span class="font-mono text-neutral-400 dark:text-neutral-500">10.</span>
                <span>{{ t('terms.sec10_title') }}</span>
              </a>
            </nav>
          </div>
        </aside>

        <!-- Content Column -->
        <article class="flex flex-col gap-6 lg:col-span-3">
          <div
            v-for="section in termsSections"
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
              <li v-for="(clause, idx) in section.clauses" :key="idx" class="pl-1">
                <span class="inline leading-relaxed">{{ clause }}</span>
              </li>
            </ul>
          </div>

          <!-- Support & Assistance Section -->
          <div
            id="support-contacts"
            class="shadow-xs scroll-mt-24 rounded-xl border border-blue-200 bg-blue-50/50 p-6 dark:border-blue-900/50 dark:bg-neutral-900 sm:p-8"
          >
            <div class="mb-2">
              <span
                class="inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-900/60 dark:text-blue-300"
              >
                Section 10
              </span>
            </div>
            <h2 class="mb-3 text-xl font-bold text-neutral-900 dark:text-white">
              {{ t('terms.sec10_title') }}
            </h2>
            <p class="mb-6 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
              {{ t('terms.sec10_desc') }}
            </p>

            <div class="flex flex-wrap items-center gap-3">
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
    </section>
  </div>
</template>
