<script setup lang="ts">
import { ref } from 'vue';
import DashboardSidebar from '../components/dashboard/DashboardSidebar.vue';
import DashboardNavbar from '../components/dashboard/DashboardNavbar.vue';
import AppToastContainer from '../components/common/AppToastContainer.vue';

const isMobileNavOpen = ref(false);
</script>

<template>
  <div
    class="flex h-screen max-h-screen w-full overflow-hidden bg-neutral-100 font-sans text-neutral-900 transition-colors duration-200 dark:bg-black dark:text-neutral-100"
  >
    <!-- Separated Dashboard Sidebar -->
    <DashboardSidebar v-model="isMobileNavOpen" />

    <!-- Main Content Area -->
    <div class="relative flex h-screen max-h-screen min-w-0 flex-1 flex-col overflow-hidden">
      <!-- Separated Dashboard Navbar -->
      <DashboardNavbar @toggle-sidebar="isMobileNavOpen = !isMobileNavOpen" />

      <main
        class="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth bg-neutral-100 p-3.5 dark:bg-black sm:p-6 lg:p-8"
      >
        <slot />
      </main>
    </div>

    <!-- Global Toast Notifications -->
    <AppToastContainer />
  </div>
</template>
