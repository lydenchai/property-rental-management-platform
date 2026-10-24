<script setup lang="ts">
import { Building2 } from '@lucide/vue';
import { useAuth } from '../composables/useAuth';
import ThemeToggle from '../components/common/ThemeToggle.vue';
import LanguageSwitcher from '../components/common/LanguageSwitcher.vue';

const { t } = useI18n();
const { isAuthenticated, logout } = useAuth();
</script>

<template>
  <div class="site-wrapper">
    <!-- Navbar -->
    <header class="navbar">
      <div class="nav-container">
        <NuxtLink to="/" class="brand">
          <div class="brand-icon-wrapper">
            <Building2 :size="20" class="brand-icon-svg" />
          </div>
          <span class="brand-name">Rent<span class="brand-accent">Ease</span></span>
        </NuxtLink>

        <nav class="nav-links">
          <NuxtLink to="/" class="nav-link">{{ t('nav.home') }}</NuxtLink>
          <NuxtLink to="/properties" class="nav-link">{{ t('nav.properties') }}</NuxtLink>
          <NuxtLink to="/about" class="nav-link">{{ t('nav.about') }}</NuxtLink>
          <NuxtLink to="/faq" class="nav-link">{{ t('nav.faq') }}</NuxtLink>
          <NuxtLink to="/contact" class="nav-link">{{ t('nav.contact') }}</NuxtLink>
        </nav>

        <div class="nav-actions">
          <LanguageSwitcher />
          <ThemeToggle />
          <template v-if="isAuthenticated">
            <NuxtLink to="/dashboard" class="btn-primary">{{ t('nav.dashboard') }}</NuxtLink>
            <button @click="logout" class="btn-secondary">{{ t('nav.log_out') }}</button>
          </template>
          <template v-else>
            <NuxtLink to="/login" class="btn-secondary">{{ t('nav.sign_in') }}</NuxtLink>
            <NuxtLink to="/register" class="btn-primary">{{ t('nav.get_started') }}</NuxtLink>
          </template>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-container">
        <!-- Brand & Description Column -->
        <div class="footer-col footer-col-brand">
          <div class="brand">
            <div class="brand-icon-wrapper">
              <Building2 :size="18" class="brand-icon-svg" />
            </div>
            <span class="brand-name">Rent<span class="brand-accent">Ease</span></span>
          </div>
          <p class="footer-tagline">
            {{ t('brand.tagline') }}
          </p>
          <div class="footer-system-status">
            <span class="status-indicator-dot" />
            <span class="system-status-label">{{ t('footer.network_label') }}</span>
          </div>
        </div>

        <!-- Navigation Columns -->
        <div class="footer-nav-grid">
          <div class="footer-col">
            <h4 class="footer-col-title">{{ t('footer.col_properties') }}</h4>
            <ul class="footer-links-list">
              <li><NuxtLink to="/properties" class="footer-link">{{ t('nav.properties') }}</NuxtLink></li>
              <li><NuxtLink to="/properties?city=Phnom%20Penh" class="footer-link">{{ t('footer.phnom_penh') }}</NuxtLink></li>
              <li><NuxtLink to="/properties?city=Siem%20Reap" class="footer-link">{{ t('footer.siem_reap') }}</NuxtLink></li>
              <li><NuxtLink to="/properties?city=Sihanoukville" class="footer-link">{{ t('footer.sihanoukville') }}</NuxtLink></li>
              <li><NuxtLink to="/properties?city=Kampot" class="footer-link">{{ t('footer.kampot') }}</NuxtLink></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4 class="footer-col-title">{{ t('footer.col_company') }}</h4>
            <ul class="footer-links-list">
              <li><NuxtLink to="/about" class="footer-link">{{ t('nav.about') }}</NuxtLink></li>
              <li><NuxtLink to="/faq" class="footer-link">{{ t('nav.faq') }}</NuxtLink></li>
              <li><NuxtLink to="/contact" class="footer-link">{{ t('nav.contact') }}</NuxtLink></li>
              <li><NuxtLink to="/login" class="footer-link">{{ t('nav.sign_in') }}</NuxtLink></li>
              <li><NuxtLink to="/register" class="footer-link">{{ t('nav.get_started') }}</NuxtLink></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4 class="footer-col-title">{{ t('footer.col_legal') }}</h4>
            <ul class="footer-links-list">
              <li><NuxtLink to="/terms" class="footer-link">{{ t('nav.terms') }}</NuxtLink></li>
              <li><NuxtLink to="/privacy" class="footer-link">{{ t('nav.privacy') }}</NuxtLink></li>
              <li><span class="footer-version-tag">{{ t('footer.version') }}</span></li>
              <li><span class="footer-jurisdiction-note">{{ t('footer.draft_note') }}</span></li>
            </ul>
          </div>
        </div>
      </div>

      <div class="footer-bottom-bar">
        <div class="footer-bottom-container">
          <p class="footer-copyright">
            &copy; {{ new Date().getFullYear() }} {{ t('brand.copyright') }}
          </p>
          <p class="footer-disclaimer-note">
            {{ t('footer.disclaimer') }}
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.site-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-subtle);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.85rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
}

.brand-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--primary);
  color: #ffffff;
}

.brand-accent {
  color: var(--primary);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  color: var(--text-muted);
  font-weight: 500;
  font-size: 0.88rem;
  transition: color 0.15s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--text-main);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

@media (max-width: 768px) {
  .nav-container {
    padding: 0.75rem 1rem;
    gap: 0.5rem;
  }
  .nav-links {
    display: none;
  }
  .nav-actions {
    gap: 0.35rem;
  }
  .nav-actions .btn-secondary,
  .nav-actions .btn-primary {
    padding: 0.4rem 0.65rem;
    font-size: 0.78rem;
  }
}

.main-content {
  flex: 1;
}

/* -------------------------------------------------------------
 * Footer Styles
 * ------------------------------------------------------------- */
.footer {
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-secondary);
  padding: 3.5rem 1.5rem 2rem;
  margin-top: 4rem;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

@media (min-width: 900px) {
  .footer-container {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }
}

.footer-col-brand {
  max-width: 320px;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.footer-tagline {
  color: var(--text-muted);
  font-size: 0.85rem;
  line-height: 1.55;
}

.footer-system-status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  padding: 0.3rem 0.65rem;
  border-radius: var(--radius-full);
  width: fit-content;
}

.status-indicator-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
}

.system-status-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.footer-nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 2rem;
  flex: 1;
  max-width: 700px;
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.footer-col-title {
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-main);
}

.footer-links-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-link {
  color: var(--text-muted);
  font-size: 0.85rem;
  transition: color 0.15s ease;
}

.footer-link:hover {
  color: var(--text-main);
}

.footer-version-tag {
  color: var(--text-dim);
  font-size: 0.75rem;
  font-family: var(--font-mono);
}

.footer-jurisdiction-note {
  color: var(--text-dim);
  font-size: 0.75rem;
  font-style: italic;
}

.footer-bottom-bar {
  border-top: 1px solid var(--border-subtle);
  margin-top: 2.5rem;
  padding-top: 1.5rem;
}

.footer-bottom-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

@media (min-width: 768px) {
  .footer-bottom-container {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.footer-copyright {
  color: var(--text-dim);
  font-size: 0.8rem;
}

.footer-disclaimer-note {
  color: var(--text-dim);
  font-size: 0.74rem;
  max-width: 580px;
}
</style>
