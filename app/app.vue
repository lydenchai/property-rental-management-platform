<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useTheme } from './composables/useTheme';

const { isDark, initTheme } = useTheme();
const { locale } = useI18n();

useHead({
  htmlAttrs: {
    lang: computed(() => locale.value || 'en'),
    class: computed(() => (isDark.value ? 'dark' : 'light')),
  },
});

onMounted(() => {
  initTheme();
});
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
