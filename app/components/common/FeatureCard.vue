<script setup lang="ts">
import type { Component } from 'vue';

interface Props {
  title: string;
  description: string;
  icon?: Component;
  badge?: string;
  to?: string;
  iconColor?: 'blue' | 'indigo' | 'emerald' | 'amber' | 'rose';
}

withDefaults(defineProps<Props>(), {
  iconColor: 'blue',
});
</script>

<template>
  <component :is="to ? 'NuxtLink' : 'div'" :to="to" class="feature-card group">
    <!-- Icon Container in signature rounded squircle -->
    <div class="feature-card-icon-box" :class="`icon-theme-${iconColor}`">
      <component :is="icon" v-if="icon" :size="20" class="feature-card-icon" />
      <slot name="icon" v-else />
    </div>

    <!-- Title and optional badge -->
    <div class="feature-card-header">
      <h3 class="feature-card-title">{{ title }}</h3>
      <span v-if="badge" class="feature-card-badge">{{ badge }}</span>
    </div>

    <!-- Description -->
    <p class="feature-card-desc">
      {{ description }}
    </p>

    <!-- Optional slot for actions / extra content -->
    <div v-if="$slots.default" class="feature-card-content">
      <slot />
    </div>
  </component>
</template>

<style scoped>
.feature-card {
  background: #ffffff;
  border: 1px solid #edf2f7;
  border-radius: 1.25rem;
  padding: 2.25rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.03), 0 2px 6px -1px rgba(15, 23, 42, 0.02);
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.22s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.22s ease;
  text-decoration: none;
  position: relative;
  height: 100%;
}

:root.dark .feature-card,
html.dark .feature-card {
  background: #121214;
  border-color: #27272a;
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.35);
}

.feature-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px -4px rgba(15, 23, 42, 0.08), 0 4px 10px -2px rgba(15, 23, 42, 0.03);
  border-color: #cbd5e1;
}

:root.dark .feature-card:hover,
html.dark .feature-card:hover {
  border-color: #3f3f46;
  box-shadow: 0 12px 32px -4px rgba(0, 0, 0, 0.6);
}

/* Icon Box Styling */
.feature-card-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.feature-card:hover .feature-card-icon-box {
  transform: scale(1.05);
}

/* Primary Light Blue Theme matching reference screenshot */
.icon-theme-blue {
  background: #eff6ff;
  border: 1px solid #dbeafe;
  color: #2563eb;
}

:root.dark .icon-theme-blue,
html.dark .icon-theme-blue {
  background: rgba(37, 99, 235, 0.15);
  border-color: rgba(37, 99, 235, 0.35);
  color: #60a5fa;
}

.icon-theme-indigo {
  background: #eef2ff;
  border: 1px solid #e0e7ff;
  color: #4f46e5;
}

:root.dark .icon-theme-indigo,
html.dark .icon-theme-indigo {
  background: rgba(79, 70, 229, 0.15);
  border-color: rgba(79, 70, 229, 0.35);
  color: #818cf8;
}

.icon-theme-emerald {
  background: #ecfdf5;
  border: 1px solid #d1fae5;
  color: #059669;
}

:root.dark .icon-theme-emerald,
html.dark .icon-theme-emerald {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.35);
  color: #34d399;
}

.icon-theme-amber {
  background: #fffbeb;
  border: 1px solid #fef3c7;
  color: #d97706;
}

:root.dark .icon-theme-amber,
html.dark .icon-theme-amber {
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.35);
  color: #fbbf24;
}

.icon-theme-rose {
  background: #fff1f2;
  border: 1px solid #ffe4e6;
  color: #e11d48;
}

:root.dark .icon-theme-rose,
html.dark .icon-theme-rose {
  background: rgba(225, 29, 72, 0.15);
  border-color: rgba(225, 29, 72, 0.35);
  color: #fb7185;
}

.feature-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 0.65rem;
}

.feature-card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.015em;
  line-height: 1.35;
  margin: 0;
}

:root.dark .feature-card-title,
html.dark .feature-card-title {
  color: #ffffff;
}

.feature-card-badge {
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

:root.dark .feature-card-badge,
html.dark .feature-card-badge {
  background: #18181b;
  color: #a1a1aa;
  border-color: #27272a;
}

.feature-card-desc {
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.625;
  margin: 0;
}

:root.dark .feature-card-desc,
html.dark .feature-card-desc {
  color: #a1a1aa;
}

.feature-card-content {
  margin-top: 1rem;
  width: 100%;
}
</style>
