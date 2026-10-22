<script setup lang="ts">
import { Building2, ArrowLeft } from '@lucide/vue';
import ThemeToggle from '../components/common/ThemeToggle.vue';
</script>

<template>
  <div class="auth-layout">
    <div class="auth-container">
      <div class="auth-header">
        <NuxtLink to="/" class="brand">
          <div class="brand-icon-wrapper">
            <Building2 :size="18" class="brand-icon-svg" />
          </div>
          <span class="brand-name">Rent<span class="brand-accent">Ease</span></span>
        </NuxtLink>

        <div class="auth-theme-box">
          <ThemeToggle />
        </div>
      </div>

      <main class="auth-card card-flat">
        <slot />
      </main>

      <div class="auth-footer">
        <NuxtLink to="/" class="back-link">
          <ArrowLeft :size="14" />
          <span>Return to Homepage</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1.5rem;
  background-color: var(--bg-primary);
  transition: background-color 0.2s ease;
}

.auth-container {
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.auth-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.25rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: -0.02em;
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

.auth-card {
  padding: 2rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  box-shadow: none;
}

.auth-footer {
  text-align: center;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-dim);
  font-size: 0.85rem;
  font-weight: 500;
  transition: color 0.15s ease;
}

.back-link:hover {
  color: var(--text-main);
}
</style>
