<script setup lang="ts">
import { Building2, ArrowLeft } from '@lucide/vue';
</script>

<template>
  <div class="auth-layout">
    <div class="auth-container">
      <div class="auth-header">
        <NuxtLink to="/" class="brand">
          <div class="brand-icon-wrapper">
            <Building2 :size="20" class="brand-icon-svg" />
          </div>
          <span class="brand-name">Rent<span class="brand-accent">Ease</span></span>
        </NuxtLink>
      </div>

      <main class="auth-card card-flat">
        <slot />
      </main>

      <div class="auth-footer">
        <NuxtLink to="/" class="back-link">
          <ArrowLeft :size="14" />
          <span>Return to Home</span>
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
  padding: 2rem 1.5rem;
  background-color: var(--bg-primary);
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
  justify-content: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-main);
}

.brand-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: var(--radius-sm);
  background: var(--primary-subtle);
  color: #818cf8;
}

.brand-accent {
  color: #818cf8;
}

.auth-card {
  padding: 2rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
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
  transition: color 0.15s ease;
}

.back-link:hover {
  color: var(--text-main);
}
</style>
