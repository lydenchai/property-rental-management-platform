<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { X } from '@lucide/vue';

interface Props {
  modelValue?: boolean;
  isOpen?: boolean;
  title?: string;
  subtitle?: string;
  icon?: any;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  closeOnEsc?: boolean;
  closeOnClickOutside?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  isOpen: undefined,
  title: '',
  subtitle: '',
  icon: null,
  size: 'lg',
  closeOnEsc: true,
  closeOnClickOutside: true,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'close'): void;
}>();

const isVisible = computed<boolean>(() => {
  if (props.modelValue !== undefined) return Boolean(props.modelValue);
  if (props.isOpen !== undefined) return Boolean(props.isOpen);
  return false;
});

const sizeClasses: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

function closeModal() {
  emit('update:modelValue', false);
  emit('close');
}

function handleBackdropClick(e: MouseEvent) {
  if (props.closeOnClickOutside && e.target === e.currentTarget) {
    closeModal();
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (props.closeOnEsc && e.key === 'Escape' && isVisible.value) {
    closeModal();
  }
}

const showTeleport = ref(false);

watch(
  isVisible,
  (open) => {
    if (open) {
      showTeleport.value = true;
    }
    if (typeof document !== 'undefined') {
      if (open) {
        document.body.classList.add('overflow-hidden');
      } else {
        document.body.classList.remove('overflow-hidden');
      }
    }
  },
  { immediate: true }
);

function onAfterLeave() {
  showTeleport.value = false;
}

const isMounted = ref(false);

onMounted(() => {
  isMounted.value = true;
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  if (typeof document !== 'undefined') {
    document.body.classList.remove('overflow-hidden');
  }
});
</script>

<template>
  <Teleport v-if="isMounted && (isVisible || showTeleport)" to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
      @after-leave="onAfterLeave"
    >
      <div
        v-if="isVisible"
        class="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        @click="handleBackdropClick"
        role="dialog"
        aria-modal="true"
      >
        <div
          :class="[
            'flex max-h-[90vh] w-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900',
            sizeClasses[size] || 'max-w-lg',
          ]"
        >
          <!-- Header slot or default header -->
          <slot name="header">
            <div
              v-if="title || $slots.header"
              class="flex shrink-0 items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800"
            >
              <div class="flex min-w-0 items-center gap-3 pr-4">
                <div
                  v-if="icon"
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                >
                  <component :is="icon" :size="18" />
                </div>
                <div class="min-w-0">
                  <h3 class="truncate text-base font-semibold text-neutral-900 dark:text-white">
                    {{ title }}
                  </h3>
                  <p
                    v-if="subtitle"
                    class="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400"
                  >
                    {{ subtitle }}
                  </p>
                </div>
              </div>
              <button
                type="button"
                @click="closeModal"
                class="cursor-pointer rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                aria-label="Close"
              >
                <X :size="18" />
              </button>
            </div>
          </slot>

          <!-- Scrollable Body -->
          <div class="flex-1 overflow-y-auto p-6">
            <slot />
          </div>

          <!-- Optional Footer -->
          <div
            v-if="$slots.footer"
            class="shrink-0 border-t border-neutral-200 bg-neutral-50 px-6 py-3 dark:border-neutral-800 dark:bg-neutral-900/50"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
