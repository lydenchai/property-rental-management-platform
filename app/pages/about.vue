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
  HeartHandshake,
} from '@lucide/vue';

definePageMeta({
  layout: 'default',
});

const { t } = useI18n();

useSeoMeta({
  title: 'About Us | RentEase Property Rental Management Platform',
  description:
    'Learn about RentEase — Cambodia’s unified residential rental and property management platform connecting landlords, tenants, and field technicians with transparent operations.',
  ogTitle: 'About RentEase Platform',
  ogDescription: 'Unified residential rental and property management platform in Cambodia.',
});

const corePillars = computed(() => [
  {
    icon: Compass,
    title: t('about.pillar_map_title'),
    desc: t('about.pillar_map_desc'),
  },
  {
    icon: ShieldCheck,
    title: t('about.pillar_sec_title'),
    desc: t('about.pillar_sec_desc'),
  },
  {
    icon: Layers,
    title: t('about.pillar_life_title'),
    desc: t('about.pillar_life_desc'),
  },
  {
    icon: Clock,
    title: t('about.pillar_maint_title'),
    desc: t('about.pillar_maint_desc'),
  },
]);

const stakeholderProfiles = computed(() => [
  {
    role: t('about.landlord_title'),
    summary: t('about.landlord_desc'),
    highlights: [
      t('about.landlord_h1'),
      t('about.landlord_h2'),
      t('about.landlord_h3'),
      t('about.landlord_h4'),
    ],
  },
  {
    role: t('about.tenant_title'),
    summary: t('about.tenant_desc'),
    highlights: [
      t('about.tenant_h1'),
      t('about.tenant_h2'),
      t('about.tenant_h3'),
      t('about.tenant_h4'),
    ],
  },
  {
    role: t('about.tech_title'),
    summary: t('about.tech_desc'),
    highlights: [t('about.tech_h1'), t('about.tech_h2'), t('about.tech_h3'), t('about.tech_h4')],
  },
  {
    role: t('about.admin_title'),
    summary: t('about.admin_desc'),
    highlights: [
      t('about.admin_h1'),
      t('about.admin_h2'),
      t('about.admin_h3'),
      t('about.admin_h4'),
    ],
  },
]);

const cambodiaHubs = [
  {
    name: 'Phnom Penh',
    districts: 'BKK1, Bassac Garden, Toul Kork, Chroy Changvar',
    tag: 'Commercial & High-Rise Hub',
  },
  {
    name: 'Siem Reap',
    districts: 'Wat Bo, Old Market, Riverside Heritage Estates',
    tag: 'Heritage & Serviced Villas',
  },
  {
    name: 'Sihanoukville',
    districts: 'Otres Beach, Victory Hill, Coastal Residences',
    tag: 'Coastal Living Towers',
  },
  {
    name: 'Kampot',
    districts: 'Tuek Chhou, Riverside Colonial Estates',
    tag: 'Scenic & Riverside Living',
  },
];
</script>

<template>
  <div class="flex flex-col gap-14 pb-16">
    <!-- Header Hero Section -->
    <section
      class="border-b border-neutral-200 bg-white px-4 py-14 text-center transition-colors dark:border-neutral-800 dark:bg-neutral-950 sm:px-6"
    >
      <div class="mx-auto flex max-w-3xl flex-col items-center gap-4">
        <div
          class="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
        >
          <Building2 :size="14" class="text-blue-600 dark:text-blue-400" />
          <span>{{ t('about.badge') }}</span>
        </div>
        <h1 class="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-5xl">
          {{ t('about.title') }}
        </h1>
        <p
          class="max-w-2xl text-base leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-lg"
        >
          {{ t('about.lead') }}
        </p>
      </div>
    </section>

    <!-- Mission & Core Problem Statement -->
    <section class="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div
          class="shadow-xs flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 sm:p-8"
        >
          <span
            class="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500"
            >{{ t('about.challenge_eyebrow') }}</span
          >
          <h2 class="text-xl font-bold text-neutral-900 dark:text-white">
            {{ t('about.challenge_title') }}
          </h2>
          <p class="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            {{ t('about.challenge_p1') }}
          </p>
          <p class="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            {{ t('about.challenge_p2') }}
          </p>
        </div>

        <div
          class="shadow-xs flex flex-col gap-3 rounded-xl border border-emerald-500/30 bg-white p-6 dark:bg-neutral-900 sm:p-8"
        >
          <span
            class="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400"
            >{{ t('about.solution_eyebrow') }}</span
          >
          <h2 class="text-xl font-bold text-neutral-900 dark:text-white">
            {{ t('about.solution_title') }}
          </h2>
          <p class="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            {{ t('about.solution_p1') }}
          </p>
          <p class="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            {{ t('about.solution_p2') }}
          </p>
        </div>
      </div>
    </section>

    <!-- Architectural Pillars -->
    <section class="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div class="mx-auto mb-10 flex max-w-2xl flex-col items-center gap-2 text-center">
        <span class="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">{{
          t('about.pillars_eyebrow')
        }}</span>
        <h2 class="text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">
          {{ t('about.pillars_title') }}
        </h2>
        <p class="text-sm text-neutral-500 dark:text-neutral-400">
          {{ t('about.pillars_subtitle') }}
        </p>
      </div>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="pillar in corePillars"
          :key="pillar.title"
          class="shadow-xs flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-6 transition-colors hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
        >
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-800/40 dark:bg-blue-950/40 dark:text-blue-400"
          >
            <component :is="pillar.icon" :size="20" />
          </div>
          <h3 class="text-base font-bold text-neutral-900 dark:text-white">{{ pillar.title }}</h3>
          <p class="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-sm">
            {{ pillar.desc }}
          </p>
        </div>
      </div>
    </section>

    <!-- Stakeholder Breakdown -->
    <section class="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div class="mx-auto mb-10 flex max-w-2xl flex-col items-center gap-2 text-center">
        <span class="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">{{
          t('about.stakeholders_eyebrow')
        }}</span>
        <h2 class="text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">
          {{ t('about.stakeholders_title') }}
        </h2>
        <p class="text-sm text-neutral-500 dark:text-neutral-400">
          {{ t('about.stakeholders_subtitle') }}
        </p>
      </div>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="profile in stakeholderProfiles"
          :key="profile.role"
          class="shadow-xs flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-6 transition-colors hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
        >
          <div>
            <h3 class="mb-2 text-base font-bold text-neutral-900 dark:text-white">
              {{ profile.role }}
            </h3>
            <p
              class="mb-4 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-sm"
            >
              {{ profile.summary }}
            </p>
          </div>

          <div class="border-t border-neutral-100 pt-4 dark:border-neutral-800/80">
            <ul class="flex flex-col gap-2">
              <li
                v-for="(h, idx) in profile.highlights"
                :key="idx"
                class="flex items-start gap-2 text-xs text-neutral-600 dark:text-neutral-300"
              >
                <CheckCircle2
                  :size="14"
                  class="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                />
                <span>{{ h }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Cambodia Regional Reach -->
    <section class="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div class="mx-auto mb-10 flex max-w-2xl flex-col items-center gap-2 text-center">
        <span class="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">{{
          t('about.regions_eyebrow')
        }}</span>
        <h2 class="text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">
          {{ t('about.regions_title') }}
        </h2>
        <p class="text-sm text-neutral-500 dark:text-neutral-400">
          {{ t('about.regions_subtitle') }}
        </p>
      </div>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="hub in cambodiaHubs"
          :key="hub.name"
          class="shadow-xs flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div class="flex items-center gap-2">
            <MapPin :size="16" class="shrink-0 text-rose-500" />
            <h3 class="text-base font-bold text-neutral-900 dark:text-white">{{ hub.name }}</h3>
          </div>
          <span
            class="inline-flex items-center text-[11px] font-semibold text-blue-600 dark:text-blue-400"
            >{{ hub.tag }}</span
          >
          <p class="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            {{ hub.districts }}
          </p>
        </div>
      </div>
    </section>

    <!-- Bottom Call-to-Action -->
    <section class="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div
        class="shadow-xs flex flex-col items-start justify-between gap-6 rounded-xl border border-neutral-200 bg-white p-8 dark:border-neutral-800 dark:bg-neutral-900 sm:flex-row sm:items-center"
      >
        <div class="flex max-w-xl flex-col gap-1">
          <h2 class="text-xl font-bold text-neutral-900 dark:text-white sm:text-2xl">
            {{ t('about.cta_title') }}
          </h2>
          <p class="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
            {{ t('about.cta_desc') }}
          </p>
        </div>
        <div class="flex w-full shrink-0 flex-wrap items-center gap-3 sm:w-auto">
          <NuxtLink to="/properties" class="btn-primary">
            <span>{{ t('about.browse_vacancies') }}</span>
            <ArrowRight :size="15" />
          </NuxtLink>
          <NuxtLink to="/contact" class="btn-secondary">
            <span>{{ t('about.contact_support') }}</span>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
