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
  MessageSquare,
} from '@lucide/vue';

definePageMeta({
  layout: 'default',
});

const { t } = useI18n();

useSeoMeta({
  title: 'Help Center & FAQ | RentEase Platform',
  description:
    'Find answers to common questions about accounts, property listings, rental applications, digital lease signing, invoices, and maintenance on RentEase.',
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
    answer: t('faq.items.a_account_1'),
  },
  {
    id: 'account-2',
    category: 'ACCOUNTS',
    question: t('faq.items.q_account_2'),
    answer: t('faq.items.a_account_2'),
  },
  {
    id: 'account-3',
    category: 'ACCOUNTS',
    question: t('faq.items.q_account_3'),
    answer: t('faq.items.a_account_3'),
  },

  // Properties & Units
  {
    id: 'property-1',
    category: 'PROPERTIES',
    question: t('faq.items.q_property_1'),
    answer: t('faq.items.a_property_1'),
  },
  {
    id: 'property-2',
    category: 'PROPERTIES',
    question: t('faq.items.q_property_2'),
    answer: t('faq.items.a_property_2'),
  },
  {
    id: 'property-3',
    category: 'PROPERTIES',
    question: t('faq.items.q_property_3'),
    answer: t('faq.items.a_property_3'),
  },

  // Applications
  {
    id: 'app-1',
    category: 'APPLICATIONS',
    question: t('faq.items.q_app_1'),
    answer: t('faq.items.a_app_1'),
  },
  {
    id: 'app-2',
    category: 'APPLICATIONS',
    question: t('faq.items.q_app_2'),
    answer: t('faq.items.a_app_2'),
  },

  // Leases
  {
    id: 'lease-1',
    category: 'LEASES',
    question: t('faq.items.q_lease_1'),
    answer: t('faq.items.a_lease_1'),
  },
  {
    id: 'lease-2',
    category: 'LEASES',
    question: t('faq.items.q_lease_2'),
    answer: t('faq.items.a_lease_2'),
  },
  {
    id: 'lease-3',
    category: 'LEASES',
    question: t('faq.items.q_lease_3'),
    answer: t('faq.items.a_lease_3'),
  },

  // Payments & Invoicing
  {
    id: 'payment-1',
    category: 'PAYMENTS',
    question: t('faq.items.q_payment_1'),
    answer: t('faq.items.a_payment_1'),
  },
  {
    id: 'payment-2',
    category: 'PAYMENTS',
    question: t('faq.items.q_payment_2'),
    answer: t('faq.items.a_payment_2'),
  },
  {
    id: 'payment-3',
    category: 'PAYMENTS',
    question: t('faq.items.q_payment_3'),
    answer: t('faq.items.a_payment_3'),
  },

  // Maintenance
  {
    id: 'maint-1',
    category: 'MAINTENANCE',
    question: t('faq.items.q_maint_1'),
    answer: t('faq.items.a_maint_1'),
  },
  {
    id: 'maint-2',
    category: 'MAINTENANCE',
    question: t('faq.items.q_maint_2'),
    answer: t('faq.items.a_maint_2'),
  },
]);

const filteredFaqs = computed(() => {
  return faqList.value.filter((faq) => {
    const matchesCategory = activeCategory.value === 'ALL' || faq.category === activeCategory.value;
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
  <div class="flex flex-col gap-10 pb-16">
    <!-- Hero Header -->
    <section
      class="border-b border-neutral-200 bg-white px-4 py-12 text-center transition-colors dark:border-neutral-800 dark:bg-neutral-950 sm:px-6"
    >
      <div class="mx-auto flex max-w-3xl flex-col items-center gap-4">
        <div
          class="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
        >
          <HelpCircle :size="14" class="text-blue-600 dark:text-blue-400" />
          <span>{{ t('faq.badge') }}</span>
        </div>
        <h1 class="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
          {{ t('faq.title') }}
        </h1>
        <p
          class="max-w-2xl text-sm leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-base"
        >
          {{ t('faq.lead') }}
        </p>

        <!-- Search Input -->
        <div
          class="shadow-xs relative mt-2 flex w-full max-w-xl items-center rounded-xl border border-neutral-300 bg-white px-4 py-2.5 transition-all focus-within:ring-2 focus-within:ring-blue-600 dark:border-neutral-700 dark:bg-neutral-900 dark:focus-within:ring-blue-500"
        >
          <Search :size="18" class="mr-3 shrink-0 text-neutral-400 dark:text-neutral-500" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('faq.search_placeholder')"
            class="w-full border-none bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none dark:text-white"
            aria-label="Search frequently asked questions"
          />
          <button
            v-if="searchQuery"
            type="button"
            @click="searchQuery = ''"
            class="ml-2 text-xs font-semibold text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            {{ t('faq.clear') }}
          </button>
        </div>
      </div>
    </section>

    <!-- Main Content Section -->
    <section class="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 sm:px-6">
      <!-- Topic Categories Tabs Strip -->
      <div class="flex flex-wrap items-center justify-center gap-2">
        <button
          v-for="cat in categories"
          :key="cat.id"
          type="button"
          :class="[
            'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
            activeCategory === cat.id
              ? 'shadow-xs border-neutral-900 bg-neutral-900 text-white dark:border-blue-600 dark:bg-blue-600 dark:text-white'
              : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white',
          ]"
          @click="activeCategory = cat.id"
        >
          <component :is="cat.icon" :size="14" />
          <span>{{ cat.label }}</span>
        </button>
      </div>

      <!-- FAQ Items Accordion -->
      <div class="flex flex-col gap-3">
        <div
          v-if="filteredFaqs.length === 0"
          class="rounded-xl border border-neutral-200 bg-white px-4 py-12 text-center dark:border-neutral-800 dark:bg-neutral-900"
        >
          <HelpCircle :size="32" class="mx-auto mb-3 text-neutral-400 dark:text-neutral-500" />
          <h3 class="text-base font-bold text-neutral-900 dark:text-white">
            {{ t('faq.no_results_title') }}
          </h3>
          <p
            class="mx-auto mt-1 max-w-sm text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm"
          >
            {{ t('faq.no_results_desc') }}
          </p>
          <button
            type="button"
            @click="
              searchQuery = '';
              activeCategory = 'ALL';
            "
            class="btn-secondary btn-sm mt-4"
          >
            {{ t('faq.reset_filters') }}
          </button>
        </div>

        <div
          v-for="faq in filteredFaqs"
          :key="faq.id"
          :class="[
            'shadow-xs overflow-hidden rounded-xl border bg-white transition-colors dark:bg-neutral-900',
            expandedIds.has(faq.id)
              ? 'border-neutral-300 dark:border-neutral-700'
              : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700',
          ]"
        >
          <button
            type="button"
            class="flex w-full items-center justify-between p-4 text-left transition-colors sm:p-5"
            :aria-expanded="expandedIds.has(faq.id)"
            @click="toggleFaq(faq.id)"
          >
            <span
              class="pr-4 text-sm font-semibold text-neutral-900 dark:text-white sm:text-base"
              >{{ faq.question }}</span
            >
            <ChevronDown
              :size="18"
              :class="[
                'shrink-0 text-neutral-400 transition-transform duration-200 dark:text-neutral-500',
                { 'rotate-180': expandedIds.has(faq.id) },
              ]"
            />
          </button>

          <div
            v-show="expandedIds.has(faq.id)"
            class="mt-1 border-t border-neutral-100 px-4 pb-5 pt-0 dark:border-neutral-800/60 sm:px-5"
          >
            <p class="pt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
              {{ faq.answer }}
            </p>
          </div>
        </div>
      </div>

      <!-- Contact Support Banner -->
      <div
        class="shadow-xs flex flex-col items-start justify-between gap-6 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 sm:flex-row sm:items-center sm:p-8"
      >
        <div class="flex items-start gap-4">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-800/40 dark:bg-blue-950/40 dark:text-blue-400"
          >
            <MessageSquare :size="20" />
          </div>
          <div class="flex flex-col gap-1">
            <h3 class="text-base font-bold text-neutral-900 dark:text-white">
              {{ t('faq.banner_title') }}
            </h3>
            <p class="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-sm">
              {{ t('faq.banner_desc') }}
            </p>
          </div>
        </div>
        <NuxtLink to="/contact" class="btn-primary w-full shrink-0 sm:w-auto">
          <span>{{ t('faq.contact_support') }}</span>
          <ArrowRight :size="15" />
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
