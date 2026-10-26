<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Bell, Check, CheckCheck, Clock, AlertTriangle, Info, CheckCircle2, X } from '@lucide/vue';
import type { ApiResponse } from '../../../shared/types/api';
import type { NotificationDetail } from '../../../shared/types/notification';

const { t } = useI18n();
const isOpen = ref(false);
const notifications = ref<NotificationDetail[]>([]);
const unreadCount = ref(0);
const isLoading = ref(false);

async function fetchNotifications() {
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
  }
}

async function markAsRead(id: string, link?: string | null) {
  try {
    await $fetch(`/api/v1/notifications/${id}/read`, { method: 'POST' });
    const target = notifications.value.find((n) => n.id === id);
    if (target && !target.isRead) {
      target.isRead = true;
      unreadCount.value = Math.max(0, unreadCount.value - 1);
    }
    if (link) {
      isOpen.value = false;
      await navigateTo(link);
    }
  } catch (err) {
    // Ignore error
  }
}

async function markAllRead() {
  try {
    await $fetch('/api/v1/notifications/read-all', { method: 'POST' });
    notifications.value.forEach((n) => {
      n.isRead = true;
    });
    unreadCount.value = 0;
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

let pollInterval: any = null;

onMounted(() => {
  fetchNotifications();
  pollInterval = setInterval(fetchNotifications, 15000);
});

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
});
</script>

<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      class="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition-colors hover:border-neutral-300 hover:text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:text-white"
      :class="{ 'border-primary-500 text-primary-600 dark:text-primary-400': isOpen }"
      :title="t('notifications.title')"
    >
      <Bell :size="16" />
      <span
        v-if="unreadCount > 0"
        class="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-neutral-900"
      >
        {{ unreadCount }}
      </span>
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="isOpen"
      class="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900 sm:w-96"
    >
      <div
        class="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800"
      >
        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold text-neutral-900 dark:text-white">{{
            t('notifications.title')
          }}</span>
          <span
            v-if="unreadCount > 0"
            class="rounded-full border border-primary-200 bg-primary-50 px-2 py-0.5 text-[10px] font-medium text-primary-700 dark:border-primary-800 dark:bg-primary-950/40 dark:text-primary-300"
          >
            {{ t('notifications.new', { count: unreadCount }) }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="unreadCount > 0"
            @click="markAllRead"
            class="inline-flex cursor-pointer items-center gap-1 text-xs text-primary-600 hover:underline dark:text-primary-400"
            :title="t('notifications.mark_all_read')"
          >
            <CheckCheck :size="13" />
            <span>{{ t('notifications.mark_all_read') }}</span>
          </button>
          <button
            @click="isOpen = false"
            class="cursor-pointer text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X :size="16" />
          </button>
        </div>
      </div>

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
            :class="{ 'bg-primary-50/30 dark:bg-primary-950/10': !notif.isRead }"
            @click="markAsRead(notif.id, notif.link)"
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
              ></span>
            </div>
            <div class="min-w-0 flex-1 space-y-0.5">
              <div class="truncate text-xs font-semibold text-neutral-900 dark:text-white">
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
              class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-600"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
