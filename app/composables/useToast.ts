import { ref } from 'vue';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

const toasts = ref<ToastItem[]>([]);

export function useToast() {
  function add(toast: Omit<ToastItem, 'id'>) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastItem = {
      id,
      duration: 4000,
      ...toast,
    };

    toasts.value.push(newToast);

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        remove(id);
      }, newToast.duration);
    }

    return id;
  }

  function remove(id: string) {
    const idx = toasts.value.findIndex((t) => t.id === id);
    if (idx !== -1) {
      toasts.value.splice(idx, 1);
    }
  }

  function success(message: string, title?: string, duration = 4000) {
    return add({ type: 'success', message, title, duration });
  }

  function error(message: string, title?: string, duration = 5000) {
    return add({ type: 'error', message, title: title || 'Error', duration });
  }

  function warning(message: string, title?: string, duration = 4500) {
    return add({ type: 'warning', message, title, duration });
  }

  function info(message: string, title?: string, duration = 4000) {
    return add({ type: 'info', message, title, duration });
  }

  function clear() {
    toasts.value = [];
  }

  return {
    toasts,
    add,
    remove,
    success,
    error,
    warning,
    info,
    clear,
  };
}
