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
    const res = await $fetch<ApiResponse<{ notifications: NotificationDetail[]; unreadCount: number }>>('/api/v1/notifications');
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
  <div class="notification-wrapper">
    <button @click="isOpen = !isOpen" class="bell-btn" :class="{ 'has-unread': unreadCount > 0, active: isOpen }"
      :title="t('notifications.title')">
      <Bell :size="16" />
      <span v-if="unreadCount > 0" class="unread-pill">{{ unreadCount }}</span>
    </button>

    <!-- Dropdown Menu -->
    <div v-if="isOpen" class="notif-dropdown card-flat">
      <div class="notif-header">
        <div class="notif-title-row">
          <span class="notif-title">{{ t('notifications.title') }}</span>
          <span v-if="unreadCount > 0" class="badge badge-info">{{ t('notifications.new', { count: unreadCount }) }}</span>
        </div>
        <div class="notif-header-actions">
          <button v-if="unreadCount > 0" @click="markAllRead" class="action-link" :title="t('notifications.mark_all_read')">
            <CheckCheck :size="13" />
            <span>{{ t('notifications.mark_all_read') }}</span>
          </button>
          <button @click="isOpen = false" class="close-btn">&times;</button>
        </div>
      </div>

      <div class="notif-body">
        <div v-if="notifications.length === 0" class="notif-empty">
          <Bell :size="24" class="empty-icon" />
          <p>{{ t('notifications.empty') }}</p>
        </div>

        <div v-else class="notif-list">
          <div v-for="notif in notifications" :key="notif.id" class="notif-item" :class="{ unread: !notif.isRead }"
            @click="markAsRead(notif.id, notif.link)">
            <div class="notif-indicator-col">
              <span class="status-dot" :class="{
                warning: notif.type === 'WARNING',
                success: notif.type === 'SUCCESS',
                info: notif.type === 'INFO',
                error: notif.type === 'ERROR',
              }"></span>
            </div>
            <div class="notif-text-col">
              <div class="notif-item-title">{{ notif.title }}</div>
              <div class="notif-item-msg">{{ notif.message }}</div>
              <div class="notif-item-time">{{ timeAgo(notif.createdAt) }}</div>
            </div>
            <div v-if="!notif.isRead" class="notif-unread-dot"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notification-wrapper {
  position: relative;
}

.bell-btn {
  position: relative;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  color: var(--text-muted);
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.bell-btn:hover,
.bell-btn.active {
  color: var(--text-main);
  border-color: var(--border-focus);
}

.unread-pill {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--primary);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  border: 2px solid var(--bg-surface);
}

.notif-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  width: 340px;
  max-height: 420px;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
  z-index: 200;
  display: flex;
  flex-direction: column;
}

.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-subtle);
}

.notif-title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.notif-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-main);
}

.notif-header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-link {
  background: none;
  border: none;
  color: var(--text-dim);
  font-size: 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
}

.action-link:hover {
  color: var(--primary);
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-dim);
  font-size: 1.25rem;
  cursor: pointer;
  line-height: 1;
}

.notif-body {
  overflow-y: auto;
  max-height: 350px;
}

.notif-empty {
  padding: 2.5rem 1rem;
  text-align: center;
  color: var(--text-dim);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.825rem;
}

.empty-icon {
  color: var(--text-dim);
  opacity: 0.6;
}

.notif-list {
  display: flex;
  flex-direction: column;
}

.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-subtle);
  cursor: pointer;
  transition: background 0.15s ease;
  position: relative;
}

.notif-item:hover {
  background: var(--bg-hover);
}

.notif-item.unread {
  background: rgba(79, 70, 229, 0.05);
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  margin-top: 0.4rem;
  display: inline-block;
}

.status-dot.info {
  background: var(--primary);
}

.status-dot.warning {
  background: #fbbf24;
}

.status-dot.success {
  background: #34d399;
}

.status-dot.error {
  background: #f87171;
}

.notif-text-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.notif-item-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-main);
}

.notif-item-msg {
  font-size: 0.775rem;
  color: var(--text-muted);
  line-height: 1.35;
}

.notif-item-time {
  font-size: 0.7rem;
  color: var(--text-dim);
  margin-top: 0.2rem;
}

.notif-unread-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--primary);
  margin-top: 0.4rem;
}
</style>
