<script setup lang="ts">
import { Building2 } from '@lucide/vue';
import { useAuth } from '../composables/useAuth';
import ThemeToggle from '../components/common/ThemeToggle.vue';
import LanguageSwitcher from '../components/common/LanguageSwitcher.vue';

const { t } = useI18n();
const { isAuthenticated, logout } = useAuth();
</script>

<template>
  <div
    class="flex min-h-screen flex-col bg-neutral-100 font-sans text-neutral-900 transition-colors duration-200 dark:bg-black dark:text-neutral-100"
  >
    <!-- Navbar -->
    <header
      class="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur-sm transition-colors duration-200 dark:border-neutral-800 dark:bg-neutral-950/95"
    >
      <div
        class="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3.5 sm:px-6 md:gap-0"
      >
        <NuxtLink
          to="/"
          class="flex items-center gap-2.5 text-xl font-bold text-neutral-900 transition-opacity hover:opacity-90 dark:text-white"
        >
          <div
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-neutral-900 text-white shadow-sm dark:bg-blue-600"
          >
            <Building2 :size="18" />
          </div>
          <span>Rent<span class="text-blue-600 dark:text-blue-500">Ease</span></span>
        </NuxtLink>

        <nav class="hidden items-center gap-6 md:flex">
          <NuxtLink
            to="/"
            class="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white [&.router-link-active]:font-semibold [&.router-link-active]:text-neutral-900 dark:[&.router-link-active]:text-white"
          >
            {{ t('nav.home') }}
          </NuxtLink>
          <NuxtLink
            to="/properties"
            class="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white [&.router-link-active]:font-semibold [&.router-link-active]:text-neutral-900 dark:[&.router-link-active]:text-white"
          >
            {{ t('nav.properties') }}
          </NuxtLink>
          <NuxtLink
            to="/about"
            class="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white [&.router-link-active]:font-semibold [&.router-link-active]:text-neutral-900 dark:[&.router-link-active]:text-white"
          >
            {{ t('nav.about') }}
          </NuxtLink>
          <NuxtLink
            to="/faq"
            class="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white [&.router-link-active]:font-semibold [&.router-link-active]:text-neutral-900 dark:[&.router-link-active]:text-white"
          >
            {{ t('nav.faq') }}
          </NuxtLink>
          <NuxtLink
            to="/contact"
            class="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white [&.router-link-active]:font-semibold [&.router-link-active]:text-neutral-900 dark:[&.router-link-active]:text-white"
          >
            {{ t('nav.contact') }}
          </NuxtLink>
        </nav>

        <div class="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
          <template v-if="isAuthenticated">
            <NuxtLink
              to="/dashboard"
              class="inline-flex items-center justify-center rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-neutral-800 dark:bg-blue-600 dark:hover:bg-blue-700 sm:px-4 sm:py-2 sm:text-sm"
            >
              {{ t('nav.dashboard') }}
            </NuxtLink>
            <button
              @click="logout"
              class="inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-900 shadow-sm transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800 sm:px-4 sm:py-2 sm:text-sm"
            >
              {{ t('nav.log_out') }}
            </button>
          </template>
          <template v-else>
            <NuxtLink
              to="/login"
              class="inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-900 shadow-sm transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800 sm:px-4 sm:py-2 sm:text-sm"
            >
              {{ t('nav.sign_in') }}
            </NuxtLink>
            <NuxtLink
              to="/register"
              class="inline-flex items-center justify-center rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-neutral-800 dark:bg-blue-600 dark:hover:bg-blue-700 sm:px-4 sm:py-2 sm:text-sm"
            >
              {{ t('nav.get_started') }}
            </NuxtLink>
          </template>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer
      class="mt-16 border-t border-neutral-200 bg-white px-4 pb-8 pt-14 transition-colors duration-200 dark:border-neutral-800 dark:bg-neutral-950 sm:px-6"
    >
      <div class="mx-auto flex max-w-7xl flex-col items-start justify-between gap-10 lg:flex-row">
        <!-- Brand & Description Column -->
        <div class="flex max-w-xs flex-col gap-3.5">
          <div class="flex items-center gap-2.5 text-lg font-bold text-neutral-900 dark:text-white">
            <div
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-neutral-900 text-white dark:bg-blue-600"
            >
              <Building2 :size="16" />
            </div>
            <span>Rent<span class="text-blue-600 dark:text-blue-500">Ease</span></span>
          </div>
          <p class="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
            {{ t('brand.tagline') }}
          </p>
          <div
            class="inline-flex w-fit items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            <span
              class="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
              >{{ t('footer.network_label') }}</span
            >
          </div>
        </div>

        <!-- Navigation Columns -->
        <div class="grid w-full max-w-2xl flex-1 grid-cols-2 gap-8 sm:grid-cols-3">
          <div class="flex flex-col gap-3">
            <h4
              class="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
            >
              {{ t('footer.col_properties') }}
            </h4>
            <ul class="m-0 flex list-none flex-col gap-2 p-0">
              <li>
                <NuxtLink
                  to="/properties"
                  class="text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  {{ t('nav.properties') }}</NuxtLink
                >
              </li>
              <li>
                <NuxtLink
                  to="/properties?city=Phnom%20Penh"
                  class="text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  {{ t('footer.phnom_penh') }}</NuxtLink
                >
              </li>
              <li>
                <NuxtLink
                  to="/properties?city=Siem%20Reap"
                  class="text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  {{ t('footer.siem_reap') }}</NuxtLink
                >
              </li>
              <li>
                <NuxtLink
                  to="/properties?city=Sihanoukville"
                  class="text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  {{ t('footer.sihanoukville') }}</NuxtLink
                >
              </li>
              <li>
                <NuxtLink
                  to="/properties?city=Kampot"
                  class="text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  {{ t('footer.kampot') }}</NuxtLink
                >
              </li>
            </ul>
          </div>

          <div class="flex flex-col gap-3">
            <h4
              class="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
            >
              {{ t('footer.col_company') }}
            </h4>
            <ul class="m-0 flex list-none flex-col gap-2 p-0">
              <li>
                <NuxtLink
                  to="/about"
                  class="text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  {{ t('nav.about') }}</NuxtLink
                >
              </li>
              <li>
                <NuxtLink
                  to="/faq"
                  class="text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  {{ t('nav.faq') }}</NuxtLink
                >
              </li>
              <li>
                <NuxtLink
                  to="/contact"
                  class="text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  {{ t('nav.contact') }}</NuxtLink
                >
              </li>
              <li>
                <NuxtLink
                  to="/login"
                  class="text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  {{ t('nav.sign_in') }}</NuxtLink
                >
              </li>
              <li>
                <NuxtLink
                  to="/register"
                  class="text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  {{ t('nav.get_started') }}</NuxtLink
                >
              </li>
            </ul>
          </div>

          <div class="flex flex-col gap-3">
            <h4
              class="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
            >
              {{ t('footer.col_legal') }}
            </h4>
            <ul class="m-0 flex list-none flex-col gap-2 p-0">
              <li>
                <NuxtLink
                  to="/terms"
                  class="text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  {{ t('nav.terms') }}</NuxtLink
                >
              </li>
              <li>
                <NuxtLink
                  to="/privacy"
                  class="text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  {{ t('nav.privacy') }}</NuxtLink
                >
              </li>
              <li>
                <span class="font-mono text-xs text-neutral-400 dark:text-neutral-500">{{
                  t('footer.version')
                }}</span>
              </li>
              <li>
                <span class="text-xs italic text-neutral-400 dark:text-neutral-500">{{
                  t('footer.draft_note')
                }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="mt-10 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <div
          class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-center md:flex-row md:text-left"
        >
          <p class="text-xs text-neutral-500 dark:text-neutral-400">
            &copy; {{ new Date().getFullYear() }} {{ t('brand.copyright') }}
          </p>
          <p class="max-w-xl text-[11px] text-neutral-400 dark:text-neutral-500">
            {{ t('footer.disclaimer') }}
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>
