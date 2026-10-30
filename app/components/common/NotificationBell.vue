<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Bell, CheckCheck, X } from '@lucide/vue';
import type { ApiResponse } from '../../../shared/types/api';
import type { NotificationDetail } from '../../../shared/types/notification';

const { t } = useI18n();
const containerRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);
const isLoading = ref(false);
const notifications = ref<NotificationDetail[]>([]);
const unreadCount = ref(0);

async function fetchNotifications() {
  isLoading.value = true;
  try {
    const res =
      await $fetch<ApiResponse<{ notifications: NotificationDetail[]; unreadCount: number }>>(
        '/api/v1/notifications'
      );
    if (res.success && res.data) {
      notifications.value = res.data.notifications;
      unreadCount.value = res.data.unreadCount;
    }
  } catch (err) {
    // Silent fail for polling
  } finally {
    isLoading.value = false;
  }
}

async function toggleDropdown() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    await fetchNotifications();
  }
}

async function handleNotificationClick(notif: NotificationDetail) {
  if (!notif.isRead) {
    notif.isRead = true;
    unreadCount.value = Math.max(0, unreadCount.value - 1);
    $fetch(`/api/v1/notifications/${notif.id}/read`, { method: 'POST' }).catch(() => {});
  }
  isOpen.value = false;
  if (notif.link) {
    await navigateTo(notif.link);
  }
}

async function markAllRead() {
  try {
    notifications.value.forEach((n) => {
      n.isRead = true;
    });
    unreadCount.value = 0;
    await $fetch('/api/v1/notifications/read-all', { method: 'POST' });
  } catch (err) {
    // Ignore error
  }
}

function timeAgo(dateStr: string | Date) {
  const d = new Date(dateStr);
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diffSec < 60) return t('notifications.just_now');
  if (diffSec < 3600) return t('notifications.minutes_ago', { count: Math.floor(diffSec / 60) });
  if (diffSec < 86400) return t('notifications.hours_ago', { count: Math.floor(diffSec / 3600) });
  return t('notifications.days_ago', { count: Math.floor(diffSec / 86400) });
}

function handleDocumentClick(event: MouseEvent) {
  if (isOpen.value && containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isOpen.value) {
    isOpen.value = false;
  }
}

let pollInterval: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  fetchNotifications();
  pollInterval = setInterval(fetchNotifications, 15000);
  document.addEventListener('click', handleDocumentClick);
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
  document.removeEventListener('click', handleDocumentClick);
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div ref="containerRef" class="relative">
    <button
      type="button"
      @click="toggleDropdown"
      class="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition-colors hover:border-neutral-300 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-700 dark:hover:text-white"
      :class="{ 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400': isOpen }"
      :title="t('notifications.title')"
      aria-label="Toggle notifications menu"
      :aria-expanded="isOpen"
    >
      <Bell :size="16" />
      <span
        v-if="unreadCount > 0"
        class="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-neutral-900"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="isOpen"
      class="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900 sm:w-96"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between border-b border-neutral-100 px-4 py-3 dark:border-neutral-800"
      >
        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold text-neutral-900 dark:text-white">{{
            t('notifications.title')
          }}</span>
          <span
            v-if="unreadCount > 0"
            class="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300"
          >
            {{ t('notifications.new', { count: unreadCount }) }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="unreadCount > 0"
            type="button"
            @click="markAllRead"
            class="inline-flex cursor-pointer items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
            :title="t('notifications.mark_all_read')"
          >
            <CheckCheck :size="13" />
            <span>{{ t('notifications.mark_all_read') }}</span>
          </button>
          <button
            type="button"
            @click="isOpen = false"
            class="cursor-pointer text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            aria-label="Close"
          >
            <X :size="16" />
          </button>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="max-h-80 overflow-y-auto">
        <div
          v-if="notifications.length === 0"
          class="flex flex-col items-center justify-center px-4 py-8 text-center text-neutral-400"
        >
          <Bell :size="24" class="mb-2 opacity-50" />
          <p class="text-xs">{{ t('notifications.empty') }}</p>
        </div>

        <div v-else class="divide-y divide-neutral-100 dark:divide-neutral-800/60">
          <div
            v-for="notif in notifications"
            :key="notif.id"
            class="flex cursor-pointer items-start gap-3 p-3.5 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
            :class="{ 'bg-blue-50/40 dark:bg-blue-950/20': !notif.isRead }"
            @click="handleNotificationClick(notif)"
          >
            <div class="shrink-0 pt-0.5">
              <span
                class="block h-2 w-2 rounded-full"
                :class="{
                  'bg-amber-500': notif.type === 'WARNING',
                  'bg-emerald-500': notif.type === 'SUCCESS',
                  'bg-blue-500': notif.type === 'INFO',
                  'bg-rose-500': notif.type === 'ERROR',
                }"
              />
            </div>
            <div class="min-w-0 flex-1 space-y-0.5">
              <div
                class="truncate text-xs font-semibold"
                :class="
                  notif.isRead
                    ? 'text-neutral-700 dark:text-neutral-300'
                    : 'text-neutral-900 dark:text-white font-bold'
                "
              >
                {{ notif.title }}
              </div>
              <div
                class="line-clamp-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400"
              >
                {{ notif.message }}
              </div>
              <div class="mt-1 text-[10px] text-neutral-400 dark:text-neutral-500">
                {{ timeAgo(notif.createdAt) }}
              </div>
            </div>
            <div
              v-if="!notif.isRead"
              class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
