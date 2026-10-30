<script setup lang="ts">
import { ref } from 'vue';
import { Key, Building, Eye, EyeOff } from '@lucide/vue';
import { useAuth } from '../composables/useAuth';

definePageMeta({
  layout: 'auth',
});

const { t } = useI18n();
const { register, isLoading, error } = useAuth();
const router = useRouter();

const fullName = ref('');
const email = ref('');
const phone = ref('');
const role = ref<'TENANT' | 'LANDLORD'>('TENANT');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const termsAccepted = ref(false);
const validationError = ref<string | null>(null);

async function handleRegister() {
  validationError.value = null;

  if (password.value !== confirmPassword.value) {
    validationError.value = t('auth.password_mismatch');
    return;
  }

  if (password.value.length < 8) {
    validationError.value = t('auth.password_too_short');
    return;
  }

  if (!termsAccepted.value) {
    validationError.value = t('auth.terms_required_error');
    return;
  }

  const result = await register({
    fullName: fullName.value,
    email: email.value,
    phone: phone.value || null,
    role: role.value,
    password: password.value,
    termsAccepted: true,
    termsVersion: 'v1.0-2026',
  });

  if (result.success) {
    router.push('/dashboard');
  }
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="text-center">
      <h2 class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
        {{ t('auth.join_title') }}
      </h2>
      <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        {{ t('auth.join_subtitle') }}
      </p>
    </div>

    <!-- Error Alerts -->
    <div v-if="validationError || error" class="alert-error">
      {{ validationError || error }}
    </div>

    <form @submit.prevent="handleRegister" class="flex flex-col gap-4">
      <div class="flex flex-col gap-1.5">
        <label
          for="reg-name"
          class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
        >
          {{ t('auth.full_name') }}
        </label>
        <input
          id="reg-name"
          v-model="fullName"
          type="text"
          :placeholder="t('auth.full_name_placeholder')"
          required
          class="w-full rounded-md border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 transition-colors placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:focus:ring-blue-500"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label
          for="reg-email"
          class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
        >
          {{ t('auth.email') }}
        </label>
        <input
          id="reg-email"
          v-model="email"
          type="email"
          :placeholder="t('auth.email_placeholder')"
          required
          class="w-full rounded-md border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 transition-colors placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:focus:ring-blue-500"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label
          for="reg-phone"
          class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
        >
          {{ t('auth.phone_optional') }}
        </label>
        <input
          id="reg-phone"
          v-model="phone"
          type="tel"
          :placeholder="t('auth.phone_placeholder')"
          class="w-full rounded-md border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 transition-colors placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:focus:ring-blue-500"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label
          class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
        >
          {{ t('auth.register_as') }}
        </label>
        <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
          <label
            :class="[
              'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
              role === 'TENANT'
                ? 'border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/20'
                : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:bg-neutral-900',
            ]"
          >
            <input type="radio" v-model="role" value="TENANT" class="sr-only" />
            <div
              :class="[
                'rounded-md p-2',
                role === 'TENANT'
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
              ]"
            >
              <Key :size="16" />
            </div>
            <div class="flex min-w-0 flex-col">
              <span class="text-xs font-bold text-neutral-900 dark:text-white">{{
                t('auth.role_tenant')
              }}</span>
              <span class="truncate text-[11px] text-neutral-500 dark:text-neutral-400">{{
                t('auth.role_tenant_desc')
              }}</span>
            </div>
          </label>

          <label
            :class="[
              'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
              role === 'LANDLORD'
                ? 'border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/20'
                : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:bg-neutral-900',
            ]"
          >
            <input type="radio" v-model="role" value="LANDLORD" class="sr-only" />
            <div
              :class="[
                'rounded-md p-2',
                role === 'LANDLORD'
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
              ]"
            >
              <Building :size="16" />
            </div>
            <div class="flex min-w-0 flex-col">
              <span class="text-xs font-bold text-neutral-900 dark:text-white">{{
                t('auth.role_landlord')
              }}</span>
              <span class="truncate text-[11px] text-neutral-500 dark:text-neutral-400">{{
                t('auth.role_landlord_desc')
              }}</span>
            </div>
          </label>
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <label
          for="reg-password"
          class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
        >
          {{ t('auth.password') }}
        </label>
        <div class="relative flex items-center">
          <input
            id="reg-password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            :placeholder="t('auth.password_hint')"
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

      <div class="flex flex-col gap-1.5">
        <label
          for="reg-confirm"
          class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
        >
          {{ t('auth.confirm_password') }}
        </label>
        <div class="relative flex items-center">
          <input
            id="reg-confirm"
            v-model="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            :placeholder="t('auth.confirm_password_placeholder')"
            required
            class="w-full rounded-md border border-neutral-300 bg-white py-2.5 pl-3.5 pr-10 text-sm text-neutral-900 transition-colors placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:focus:ring-blue-500"
          />
          <button
            type="button"
            class="absolute right-3 p-1 text-neutral-400 transition-colors hover:text-neutral-700 dark:hover:text-neutral-200"
            @click="showConfirmPassword = !showConfirmPassword"
            :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
          >
            <EyeOff v-if="showConfirmPassword" :size="16" />
            <Eye v-else :size="16" />
          </button>
        </div>
      </div>

      <!-- Legal Terms and Privacy Policy Consent Checkbox -->
      <div class="my-1">
        <label class="flex cursor-pointer select-none items-start gap-2.5">
          <input
            id="reg-terms-consent"
            v-model="termsAccepted"
            type="checkbox"
            class="mt-1 h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 dark:border-neutral-700"
            required
          />
          <span class="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
            {{ t('auth.terms_consent_prefix') }}
            <NuxtLink
              to="/terms"
              target="_blank"
              class="font-semibold text-blue-600 underline underline-offset-2 hover:opacity-80 dark:text-blue-400"
            >
              {{ t('auth.terms_link') }}
            </NuxtLink>
            {{ t('auth.terms_consent_and') }}
            <NuxtLink
              to="/privacy"
              target="_blank"
              class="font-semibold text-blue-600 underline underline-offset-2 hover:opacity-80 dark:text-blue-400"
            >
              {{ t('auth.privacy_link') }}
            </NuxtLink>
            <span class="ml-1 font-mono text-neutral-400 dark:text-neutral-500">{{
              t('auth.terms_version_tag')
            }}</span
            >.
          </span>
        </label>
      </div>

      <button
        type="submit"
        :disabled="isLoading"
        class="mt-2 inline-flex w-full items-center justify-center rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
      >
        <span v-if="isLoading">{{ t('auth.creating_account') }}</span>
        <span v-else>{{ t('auth.register_account') }}</span>
      </button>
    </form>

    <div class="text-center text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm">
      <span>{{ t('auth.already_have_account') }}</span>
      <NuxtLink
        to="/login"
        class="ml-1 font-semibold text-blue-600 hover:underline dark:text-blue-400"
      >
        {{ t('auth.sign_in') }}
      </NuxtLink>
    </div>
  </div>
</template>
