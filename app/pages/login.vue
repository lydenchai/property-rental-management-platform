<script setup lang="ts">
import { ref } from 'vue';
import { ShieldCheck, Building, Key, Wrench, Check, Eye, EyeOff } from '@lucide/vue';
import { useAuth } from '../composables/useAuth';

definePageMeta({
  layout: 'auth',
});

const { t } = useI18n();
const { login, isLoading, error } = useAuth();
const router = useRouter();
const route = useRoute();

const email = ref('');
const password = ref('');
const showPassword = ref(false);

const demoAccounts = [
  {
    roleKey: 'auth.demo_admin',
    email: 'admin@rentease.com',
    pass: 'RentEase123!',
    icon: ShieldCheck,
  },
  {
    roleKey: 'auth.demo_landlord',
    email: 'landlord@rentease.com',
    pass: 'RentEase123!',
    icon: Building,
  },
  { roleKey: 'auth.demo_tenant', email: 'tenant@rentease.com', pass: 'RentEase123!', icon: Key },
  {
    roleKey: 'auth.demo_technician',
    email: 'technician@rentease.com',
    pass: 'RentEase123!',
    icon: Wrench,
  },
];

function fillDemo(item: (typeof demoAccounts)[0]) {
  email.value = item.email;
  password.value = item.pass;
}

async function handleLogin() {
  const result = await login({
    email: email.value,
    password: password.value,
  });

  if (result.success) {
    const redirectUrl = (route.query.redirect as string) || '/dashboard';
    router.push(redirectUrl);
  }
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="text-center">
      <h2 class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
        {{ t('auth.welcome_back') }}
      </h2>
      <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        {{ t('auth.credentials_prompt') }}
      </p>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="alert-error">
      {{ error }}
    </div>

    <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
      <div class="flex flex-col gap-1.5">
        <label
          for="login-email"
          class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
        >
          {{ t('auth.email') }}
        </label>
        <input
          id="login-email"
          v-model="email"
          type="email"
          :placeholder="t('auth.email_placeholder')"
          required
          class="w-full rounded-md border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 transition-colors placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:focus:ring-blue-500"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <div class="flex items-center justify-between">
          <label
            for="login-password"
            class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
          >
            {{ t('auth.password') }}
          </label>
        </div>
        <div class="relative flex items-center">
          <input
            id="login-password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            :placeholder="t('auth.password_placeholder')"
            required
            class="w-full rounded-md border border-neutral-300 bg-white py-2.5 pl-3.5 pr-10 text-sm text-neutral-900 transition-colors placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:focus:ring-blue-500"
          />
          <button
            type="button"
            class="absolute right-3 p-1 text-neutral-400 transition-colors hover:text-neutral-700 dark:hover:text-neutral-200"
            @click="showPassword = !showPassword"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
          >
            <EyeOff v-if="showPassword" :size="16" />
            <Eye v-else :size="16" />
          </button>
        </div>
      </div>

      <button
        type="submit"
        :disabled="isLoading"
        class="mt-2 inline-flex w-full items-center justify-center rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
      >
        <span v-if="isLoading">{{ t('auth.signing_in') }}</span>
        <span v-else>{{ t('auth.sign_in') }}</span>
      </button>
    </form>

    <!-- Quick Demo Accounts -->
    <div class="mt-2">
      <div class="relative flex items-center py-2">
        <div class="flex-grow border-t border-neutral-200 dark:border-neutral-800" />
        <span
          class="mx-3 flex-shrink text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500"
          >{{ t('auth.quick_demo') }}</span
        >
        <div class="flex-grow border-t border-neutral-200 dark:border-neutral-800" />
      </div>
      <div class="mt-2 grid grid-cols-2 gap-2">
        <button
          v-for="item in demoAccounts"
          :key="item.roleKey"
          type="button"
          @click="fillDemo(item)"
          :class="[
            'flex items-center gap-2 rounded-md border p-2.5 text-left text-xs font-medium transition-colors',
            email === item.email
              ? 'shadow-xs border-blue-600 bg-neutral-100 text-neutral-900 dark:border-blue-500 dark:bg-neutral-800 dark:text-white'
              : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-white',
          ]"
        >
          <component :is="item.icon" :size="16" class="shrink-0 text-blue-600 dark:text-blue-400" />
          <span class="truncate">{{ t(item.roleKey) }}</span>
          <Check
            v-if="email === item.email"
            :size="14"
            class="ml-auto shrink-0 text-emerald-600 dark:text-emerald-400"
          />
        </button>
      </div>
    </div>

    <div class="text-center text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm">
      <span>{{ t('auth.dont_have_account') }}</span>
      <NuxtLink
        to="/register"
        class="ml-1 font-semibold text-blue-600 hover:underline dark:text-blue-400"
      >
        {{ t('auth.create_account_now') }}
      </NuxtLink>
    </div>
  </div>
</template>
