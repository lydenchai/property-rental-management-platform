<script setup lang="ts">
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X
} from '@lucide/vue';
import { useToast, type ToastItem } from '../../composables/useToast';

const { toasts, remove } = useToast();

function getIcon(type: ToastItem['type']) {
  switch (type) {
    case 'success':
      return CheckCircle2;
    case 'error':
      return AlertCircle;
    case 'warning':
      return AlertTriangle;
    case 'info':
    default:
      return Info;
  }
}
</script>

<template>
  <div class="toast-viewport" aria-live="polite" aria-atomic="true">
    <TransitionGroup name="toast" tag="div" class="toast-stack">
      <div v-for="toast in toasts" :key="toast.id" :class="['toast-card', `toast-${toast.type}`]" role="alert">
        <div class="toast-icon-wrap">
          <component :is="getIcon(toast.type)" :size="18" />
        </div>

        <div class="toast-body">
          <div v-if="toast.title" class="toast-title">{{ toast.title }}</div>
          <div class="toast-message">{{ toast.message }}</div>
        </div>

        <button type="button" class="toast-close-btn" @click="remove(toast.id)" aria-label="Close notification">
          <X :size="14" />
        </button>

        <div v-if="toast.duration && toast.duration > 0" class="toast-progress"
          :style="{ animationDuration: `${toast.duration}ms` }" />
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-viewport {
  position: fixed;
  top: 1.25rem;
  right: 1.25rem;
  z-index: 99999;
  pointer-events: none;
  max-width: 420px;
  width: calc(100% - 2.5rem);
}

.toast-stack {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.toast-card {
  position: relative;
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.85rem 1rem 0.95rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  transition: all 0.25s ease;
}

html.dark .toast-card {
  background: #18181b;
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.toast-icon-wrap {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}

/* Success */
.toast-success {
  border-left: 3px solid #10b981;
}

.toast-success .toast-icon-wrap {
  background: #ecfdf5;
  color: #059669;
}

html.dark .toast-success .toast-icon-wrap {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
}

.toast-success .toast-progress {
  background: #10b981;
}

/* Error */
.toast-error {
  border-left: 3px solid #ef4444;
}

.toast-error .toast-icon-wrap {
  background: #fef2f2;
  color: #dc2626;
}

html.dark .toast-error .toast-icon-wrap {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.toast-error .toast-progress {
  background: #ef4444;
}

/* Warning */
.toast-warning {
  border-left: 3px solid #f59e0b;
}

.toast-warning .toast-icon-wrap {
  background: #fffbeb;
  color: #d97706;
}

html.dark .toast-warning .toast-icon-wrap {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}

.toast-warning .toast-progress {
  background: #f59e0b;
}

/* Info */
.toast-info {
  border-left: 3px solid #2563eb;
}

.toast-info .toast-icon-wrap {
  background: #eff6ff;
  color: #2563eb;
}

html.dark .toast-info .toast-icon-wrap {
  background: rgba(37, 99, 235, 0.15);
  color: #60a5fa;
}

.toast-info .toast-progress {
  background: #2563eb;
}

.toast-body {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--text-main);
  margin-bottom: 0.15rem;
}

.toast-message {
  font-size: 0.825rem;
  color: var(--text-muted);
  line-height: 1.45;
  word-break: break-word;
}

.toast-close-btn {
  background: transparent;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  padding: 3px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  margin-top: 1px;
}

.toast-close-btn:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  width: 100%;
  opacity: 0.6;
  animation: shrink-progress linear forwards;
}

@keyframes shrink-progress {
  from {
    width: 100%;
  }

  to {
    width: 0%;
  }
}

/* TransitionGroup Animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-12px) scale(0.96);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(30px) scale(0.96);
}
</style>
