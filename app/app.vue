<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useTheme } from './composables/useTheme';

const { initTheme } = useTheme();
const { locale } = useI18n();

useHead({
  htmlAttrs: {
    lang: computed(() => locale.value || 'en'),
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
