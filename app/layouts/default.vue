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
        <div class="footer-brand">
          <div class="brand">
            <div class="brand-icon-wrapper">
              <Building2 :size="18" class="brand-icon-svg" />
            </div>
            <span class="brand-name">Rent<span class="brand-accent">Ease</span></span>
          </div>
          <p class="footer-tagline">
            {{ t('brand.tagline') }}
          </p>
        </div>
        <div class="footer-copyright">
          &copy; {{ new Date().getFullYear() }} {{ t('brand.copyright') }}
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
  background: var(--primary-subtle);
  color: #818cf8;
}

.brand-accent {
  color: #818cf8;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.75rem;
}

.nav-link {
  color: var(--text-muted);
  font-weight: 500;
  font-size: 0.9rem;
  transition: color 0.15s ease;
}

.nav-link:hover {
  color: var(--text-main);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.main-content {
  flex: 1;
}

.footer {
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-secondary);
  padding: 2.25rem 1.5rem;
  margin-top: 4rem;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
  text-align: center;
}

.footer-tagline {
  color: var(--text-dim);
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.footer-copyright {
  color: var(--text-dim);
  font-size: 0.8rem;
}

@media (min-width: 768px) {
  .footer-container {
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
  }
}
</style>
