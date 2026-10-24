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
  { roleKey: 'auth.demo_admin', email: 'admin@rentease.com', pass: 'RentEase123!', icon: ShieldCheck },
  { roleKey: 'auth.demo_landlord', email: 'landlord@rentease.com', pass: 'RentEase123!', icon: Building },
  { roleKey: 'auth.demo_tenant', email: 'tenant@rentease.com', pass: 'RentEase123!', icon: Key },
  { roleKey: 'auth.demo_technician', email: 'technician@rentease.com', pass: 'RentEase123!', icon: Wrench },
];

function fillDemo(item: typeof demoAccounts[0]) {
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
  <div class="login-view">
    <div class="card-header">
      <h2>{{ t('auth.welcome_back') }}</h2>
      <p class="subtitle">{{ t('auth.credentials_prompt') }}</p>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="alert-error">
      {{ error }}
    </div>

    <form @submit.prevent="handleLogin" class="login-form">
      <div class="form-group">
        <label for="login-email" class="form-label">{{ t('auth.email') }}</label>
        <input id="login-email" v-model="email" type="email" :placeholder="t('auth.email_placeholder')" required
          class="input-field" />
      </div>

      <div class="form-group">
        <div class="password-label-wrapper">
          <label for="login-password" class="form-label">{{ t('auth.password') }}</label>
        </div>
        <div class="password-input-wrap">
          <input
            id="login-password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            :placeholder="t('auth.password_placeholder')"
            required
            class="input-field password-input"
          />
          <button
            type="button"
            class="password-toggle-btn"
            @click="showPassword = !showPassword"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
          >
            <EyeOff v-if="showPassword" :size="15" />
            <Eye v-else :size="15" />
          </button>
        </div>
      </div>

      <button type="submit" :disabled="isLoading" class="btn-primary btn-block">
        <span v-if="isLoading">{{ t('auth.signing_in') }}</span>
        <span v-else>{{ t('auth.sign_in') }}</span>
      </button>
    </form>

    <!-- Quick Demo Accounts -->
    <div class="demo-section">
      <div class="divider">
        <span>{{ t('auth.quick_demo') }}</span>
      </div>
      <div class="demo-grid">
        <button v-for="item in demoAccounts" :key="item.roleKey" type="button" @click="fillDemo(item)"
          :class="['demo-chip', { 'demo-chip-active': email === item.email }]">
          <component :is="item.icon" :size="15" class="chip-icon" />
          <span class="chip-role">{{ t(item.roleKey) }}</span>
          <Check v-if="email === item.email" :size="13" class="chip-check" />
        </button>
      </div>
    </div>

    <div class="register-prompt">
      <span>{{ t('auth.dont_have_account') }}</span>
      <NuxtLink to="/register" class="register-link">{{ t('auth.create_account_now') }}</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.login-view {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.card-header {
  text-align: center;
}

.card-header h2 {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.subtitle {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.password-label-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.password-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input {
  width: 100%;
  padding-right: 2.5rem;
}

.password-toggle-btn {
  position: absolute;
  right: 0.75rem;
  background: transparent;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border-radius: var(--radius-sm);
  transition: color 0.15s ease;
}

.password-toggle-btn:hover {
  color: var(--text-main);
}

.btn-block {
  width: 100%;
  padding: 0.75rem;
  margin-top: 0.5rem;
  font-size: 0.95rem;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.25rem 0 0.75rem;
  color: var(--text-dim);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--border-subtle);
}

.divider span {
  padding: 0 0.75rem;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.demo-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.75rem;
  color: var(--text-muted);
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
  font-size: 0.85rem;
  font-weight: 500;
}

.demo-chip:hover {
  background: var(--bg-surface-hover);
  border-color: var(--primary);
  color: var(--text-main);
}

.demo-chip-active {
  background: var(--bg-surface-hover);
  border-color: var(--primary);
  color: var(--text-main);
  box-shadow: 0 0 0 1px var(--primary);
}

.chip-icon {
  color: var(--text-muted);
  flex-shrink: 0;
}

.demo-chip:hover .chip-icon,
.demo-chip-active .chip-icon {
  color: var(--primary);
}

.chip-check {
  margin-left: auto;
  color: var(--accent-emerald);
}

.register-prompt {
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.register-link {
  color: #818cf8;
  font-weight: 600;
  margin-left: 0.35rem;
}

.register-link:hover {
  text-decoration: underline;
}
</style>
