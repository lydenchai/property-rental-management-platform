<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  HelpCircle,
  Search,
  ChevronDown,
  Building,
  Key,
  CreditCard,
  Wrench,
  FileText,
  ShieldCheck,
  ArrowRight,
  MessageSquare
} from '@lucide/vue';

definePageMeta({
  layout: 'default',
});

const { t } = useI18n();

useSeoMeta({
  title: 'Help Center & FAQ | RentEase Platform',
  description: 'Find answers to common questions about accounts, property listings, rental applications, digital lease signing, invoices, and maintenance on RentEase.',
  ogTitle: 'Help Center & FAQ | RentEase',
  ogDescription: 'Frequently asked questions and support guide for RentEase users.',
});

interface FaqItem {
  id: string;
  category: 'ACCOUNTS' | 'PROPERTIES' | 'APPLICATIONS' | 'LEASES' | 'PAYMENTS' | 'MAINTENANCE';
  question: string;
  answer: string;
}

const activeCategory = ref<string>('ALL');
const searchQuery = ref<string>('');
const expandedIds = ref<Set<string>>(new Set(['lease-1', 'payment-1']));

function toggleFaq(id: string) {
  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id);
  } else {
    expandedIds.value.add(id);
  }
}

const categories = computed(() => [
  { id: 'ALL', label: t('faq.all_topics'), icon: HelpCircle },
  { id: 'ACCOUNTS', label: t('faq.cat_accounts'), icon: ShieldCheck },
  { id: 'PROPERTIES', label: t('faq.cat_properties'), icon: Building },
  { id: 'APPLICATIONS', label: t('faq.cat_applications'), icon: FileText },
  { id: 'LEASES', label: t('faq.cat_leases'), icon: Key },
  { id: 'PAYMENTS', label: t('faq.cat_payments'), icon: CreditCard },
  { id: 'MAINTENANCE', label: t('faq.cat_maintenance'), icon: Wrench },
]);

const faqList = computed<FaqItem[]>(() => [
  // Accounts
  {
    id: 'account-1',
    category: 'ACCOUNTS',
    question: t('faq.items.q_account_1'),
    answer: t('faq.items.a_account_1')
  },
  {
    id: 'account-2',
    category: 'ACCOUNTS',
    question: t('faq.items.q_account_2'),
    answer: t('faq.items.a_account_2')
  },
  {
    id: 'account-3',
    category: 'ACCOUNTS',
    question: t('faq.items.q_account_3'),
    answer: t('faq.items.a_account_3')
  },

  // Properties & Units
  {
    id: 'property-1',
    category: 'PROPERTIES',
    question: t('faq.items.q_property_1'),
    answer: t('faq.items.a_property_1')
  },
  {
    id: 'property-2',
    category: 'PROPERTIES',
    question: t('faq.items.q_property_2'),
    answer: t('faq.items.a_property_2')
  },
  {
    id: 'property-3',
    category: 'PROPERTIES',
    question: t('faq.items.q_property_3'),
    answer: t('faq.items.a_property_3')
  },

  // Applications
  {
    id: 'app-1',
    category: 'APPLICATIONS',
    question: t('faq.items.q_app_1'),
    answer: t('faq.items.a_app_1')
  },
  {
    id: 'app-2',
    category: 'APPLICATIONS',
    question: t('faq.items.q_app_2'),
    answer: t('faq.items.a_app_2')
  },

  // Leases
  {
    id: 'lease-1',
    category: 'LEASES',
    question: t('faq.items.q_lease_1'),
    answer: t('faq.items.a_lease_1')
  },
  {
    id: 'lease-2',
    category: 'LEASES',
    question: t('faq.items.q_lease_2'),
    answer: t('faq.items.a_lease_2')
  },
  {
    id: 'lease-3',
    category: 'LEASES',
    question: t('faq.items.q_lease_3'),
    answer: t('faq.items.a_lease_3')
  },

  // Payments & Invoicing
  {
    id: 'payment-1',
    category: 'PAYMENTS',
    question: t('faq.items.q_payment_1'),
    answer: t('faq.items.a_payment_1')
  },
  {
    id: 'payment-2',
    category: 'PAYMENTS',
    question: t('faq.items.q_payment_2'),
    answer: t('faq.items.a_payment_2')
  },
  {
    id: 'payment-3',
    category: 'PAYMENTS',
    question: t('faq.items.q_payment_3'),
    answer: t('faq.items.a_payment_3')
  },

  // Maintenance
  {
    id: 'maint-1',
    category: 'MAINTENANCE',
    question: t('faq.items.q_maint_1'),
    answer: t('faq.items.a_maint_1')
  },
  {
    id: 'maint-2',
    category: 'MAINTENANCE',
    question: t('faq.items.q_maint_2'),
    answer: t('faq.items.a_maint_2')
  }
]);

const filteredFaqs = computed(() => {
  return faqList.value.filter((faq) => {
    const matchesCategory =
      activeCategory.value === 'ALL' || faq.category === activeCategory.value;
    const query = searchQuery.value.trim().toLowerCase();
    const matchesSearch =
      !query ||
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });
});
</script>

<template>
  <div class="faq-page">
    <!-- Hero Header -->
    <section class="faq-hero-section">
      <div class="faq-hero-container">
        <div class="faq-badge">
          <HelpCircle :size="14" class="badge-icon" />
          <span>{{ t('faq.badge') }}</span>
        </div>
        <h1 class="faq-title">{{ t('faq.title') }}</h1>
        <p class="faq-lead">
          {{ t('faq.lead') }}
        </p>

        <!-- Search Input -->
        <div class="faq-search-wrapper card-flat">
          <Search :size="18" class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('faq.search_placeholder')"
            class="faq-search-input"
            aria-label="Search frequently asked questions"
          />
          <button
            v-if="searchQuery"
            type="button"
            @click="searchQuery = ''"
            class="search-clear-btn"
          >
            {{ t('faq.clear') }}
          </button>
        </div>
      </div>
    </section>

    <!-- Main Content Section -->
    <section class="faq-content-section">
      <div class="faq-container">
        <!-- Topic Categories Tabs Strip -->
        <div class="category-tabs-strip">
          <button
            v-for="cat in categories"
            :key="cat.id"
            type="button"
            :class="['category-tab-btn', { active: activeCategory === cat.id }]"
            @click="activeCategory = cat.id"
          >
            <component :is="cat.icon" :size="15" />
            <span>{{ cat.label }}</span>
          </button>
        </div>

        <!-- FAQ Items Accordion -->
        <div class="faq-accordion-list">
          <div v-if="filteredFaqs.length === 0" class="empty-faq card-flat">
            <HelpCircle :size="28" class="empty-icon" />
            <h3>{{ t('faq.no_results_title') }}</h3>
            <p>{{ t('faq.no_results_desc') }}</p>
            <button
              type="button"
              @click="searchQuery = ''; activeCategory = 'ALL'"
              class="btn-secondary btn-sm mt-3"
            >
              {{ t('faq.reset_filters') }}
            </button>
          </div>

          <div
            v-for="faq in filteredFaqs"
            :key="faq.id"
            :class="['faq-card', 'card-flat', { 'is-expanded': expandedIds.has(faq.id) }]"
          >
            <button
              type="button"
              class="faq-header-btn"
              :aria-expanded="expandedIds.has(faq.id)"
              @click="toggleFaq(faq.id)"
            >
              <span class="faq-question-text">{{ faq.question }}</span>
              <ChevronDown
                :size="18"
                :class="['chevron-icon', { 'rotate-180': expandedIds.has(faq.id) }]"
              />
            </button>

            <div v-show="expandedIds.has(faq.id)" class="faq-answer-panel">
              <p>{{ faq.answer }}</p>
            </div>
          </div>
        </div>

        <!-- Contact Support Banner -->
        <div class="faq-support-banner card-flat">
          <div class="support-banner-content">
            <div class="support-icon-box">
              <MessageSquare :size="20" />
            </div>
            <div>
              <h3>{{ t('faq.banner_title') }}</h3>
              <p>
                {{ t('faq.banner_desc') }}
              </p>
            </div>
          </div>
          <NuxtLink to="/contact" class="btn-primary">
            <span>{{ t('faq.contact_support') }}</span>
            <ArrowRight :size="15" />
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.faq-page {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  padding-bottom: 4rem;
}

.faq-container {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 1.5rem;
  width: 100%;
}

/* Hero Section */
.faq-hero-section {
  padding: 3.5rem 1.5rem 2rem;
  text-align: center;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-surface);
}

.faq-hero-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.faq-badge {
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

.faq-title {
  font-size: 2.25rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  color: var(--text-main);
}

@media (min-width: 768px) {
  .faq-title {
    font-size: 2.75rem;
  }
}

.faq-lead {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-muted);
  max-width: 680px;
}

/* Search Box */
.faq-search-wrapper {
  width: 100%;
  max-width: 680px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 1rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  margin-top: 0.5rem;
}

.search-icon {
  color: var(--text-dim);
  flex-shrink: 0;
}

.faq-search-input {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-main);
  font-size: 0.92rem;
  font-family: inherit;
}

.faq-search-input::placeholder {
  color: var(--text-dim);
}

.search-clear-btn {
  background: transparent;
  border: none;
  color: var(--text-dim);
  font-size: 0.78rem;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
  border-radius: var(--radius-sm);
}

.search-clear-btn:hover {
  color: var(--text-main);
}

/* Category Tabs Strip */
.category-tabs-strip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  margin-bottom: 2rem;
  scrollbar-width: thin;
}

.category-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.95rem;
  border-radius: var(--radius-sm);
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  color: var(--text-muted);
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.category-tab-btn:hover {
  color: var(--text-main);
  border-color: var(--text-dim);
}

.category-tab-btn.active {
  background: var(--primary);
  color: #ffffff;
  border-color: var(--primary);
}

/* Accordion Cards */
.faq-accordion-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.faq-card {
  padding: 0;
  overflow: hidden;
  transition: border-color 0.15s ease;
}

.faq-card.is-expanded {
  border-color: var(--text-dim);
}

.faq-header-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  color: var(--text-main);
  font-family: inherit;
}

.faq-question-text {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
}

.chevron-icon {
  color: var(--text-dim);
  flex-shrink: 0;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.rotate-180 {
  transform: rotate(180deg);
}

.faq-answer-panel {
  padding: 0 1.5rem 1.25rem;
  border-top: 1px solid var(--border-subtle);
  padding-top: 1rem;
}

.faq-answer-panel p {
  color: var(--text-muted);
  font-size: 0.92rem;
  line-height: 1.65;
}

/* Empty State */
.empty-faq {
  padding: 3rem 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.empty-icon {
  color: var(--text-dim);
  margin-bottom: 0.5rem;
}

.empty-faq h3 {
  font-size: 1.15rem;
}

.empty-faq p {
  color: var(--text-muted);
  font-size: 0.88rem;
}

/* Support Banner */
.faq-support-banner {
  margin-top: 3rem;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: flex-start;
  justify-content: space-between;
}

@media (min-width: 768px) {
  .faq-support-banner {
    flex-direction: row;
    align-items: center;
  }
}

.support-banner-content {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  max-width: 600px;
}

.support-icon-box {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-indigo-accent);
  flex-shrink: 0;
}

.support-banner-content h3 {
  font-size: 1.15rem;
  margin-bottom: 0.35rem;
}

.support-banner-content p {
  color: var(--text-muted);
  font-size: 0.88rem;
  line-height: 1.5;
}

.mt-3 {
  margin-top: 0.75rem;
}
</style>
