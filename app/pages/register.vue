<script setup lang="ts">
import { ref } from 'vue';
import { Key, Building } from '@lucide/vue';
import { useAuth } from '../composables/useAuth';

definePageMeta({
  layout: 'auth',
});

const { register, isLoading, error } = useAuth();
const router = useRouter();

const fullName = ref('');
const email = ref('');
const phone = ref('');
const role = ref<'TENANT' | 'LANDLORD'>('TENANT');
const password = ref('');
const confirmPassword = ref('');
const validationError = ref<string | null>(null);

async function handleRegister() {
  validationError.value = null;

  if (password.value !== confirmPassword.value) {
    validationError.value = 'Passwords do not match';
    return;
  }

  if (password.value.length < 8) {
    validationError.value = 'Password must be at least 8 characters long';
    return;
  }

  const result = await register({
    fullName: fullName.value,
    email: email.value,
    phone: phone.value || null,
    role: role.value,
    password: password.value,
  });

  if (result.success) {
    router.push('/dashboard');
  }
}
</script>

<template>
  <div class="register-view">
    <div class="card-header">
      <h2>Join RentEase</h2>
      <p class="subtitle">Create an account to start managing or renting properties</p>
    </div>

    <!-- Error Alerts -->
    <div v-if="validationError || error" class="alert-error">
      {{ validationError || error }}
    </div>

    <form @submit.prevent="handleRegister" class="register-form">
      <div class="form-group">
        <label for="reg-name" class="form-label">Full Name</label>
        <input
          id="reg-name"
          v-model="fullName"
          type="text"
          placeholder="Jane Doe"
          required
          class="input-field"
        />
      </div>

      <div class="form-group">
        <label for="reg-email" class="form-label">Email Address</label>
        <input
          id="reg-email"
          v-model="email"
          type="email"
          placeholder="name@example.com"
          required
          class="input-field"
        />
      </div>

      <div class="form-group">
        <label for="reg-phone" class="form-label">Phone Number (Optional)</label>
        <input
          id="reg-phone"
          v-model="phone"
          type="tel"
          placeholder="+855 12 345 678"
          class="input-field"
        />
      </div>

      <div class="form-group">
        <label class="form-label">I want to register as</label>
        <div class="role-selector">
          <label class="role-option" :class="{ selected: role === 'TENANT' }">
            <input type="radio" v-model="role" value="TENANT" class="radio-hidden" />
            <div class="role-icon-box">
              <Key :size="16" />
            </div>
            <div class="role-text">
              <span class="role-title">Tenant</span>
              <span class="role-desc">Rent units & pay invoices</span>
            </div>
          </label>

          <label class="role-option" :class="{ selected: role === 'LANDLORD' }">
            <input type="radio" v-model="role" value="LANDLORD" class="radio-hidden" />
            <div class="role-icon-box">
              <Building :size="16" />
            </div>
            <div class="role-text">
              <span class="role-title">Landlord</span>
              <span class="role-desc">Manage properties & leases</span>
            </div>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label for="reg-password" class="form-label">Password</label>
        <input
          id="reg-password"
          v-model="password"
          type="password"
          placeholder="At least 8 characters (1 uppercase, 1 number)"
          required
          class="input-field"
        />
      </div>

      <div class="form-group">
        <label for="reg-confirm" class="form-label">Confirm Password</label>
        <input
          id="reg-confirm"
          v-model="confirmPassword"
          type="password"
          placeholder="Re-enter your password"
          required
          class="input-field"
        />
      </div>

      <button type="submit" :disabled="isLoading" class="btn-primary btn-block">
        <span v-if="isLoading">Creating account...</span>
        <span v-else>Register Account</span>
      </button>
    </form>

    <div class="signin-prompt">
      <span>Already have an account?</span>
      <NuxtLink to="/login" class="signin-link">Sign in</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.register-view {
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

.role-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.role-option {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.65rem 0.75rem;
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.role-option:hover {
  background: var(--bg-surface-hover);
  border-color: var(--text-muted);
}

.role-option.selected {
  border-color: var(--primary);
  background: var(--primary-subtle);
}

.role-option.selected .role-icon-box {
  color: #818cf8;
}

.radio-hidden {
  display: none;
}

.role-icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  flex-shrink: 0;
}

.role-text {
  display: flex;
  flex-direction: column;
}

.role-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-main);
}

.role-desc {
  font-size: 0.72rem;
  color: var(--text-dim);
}

.btn-block {
  width: 100%;
  padding: 0.75rem;
  margin-top: 0.5rem;
  font-size: 0.95rem;
}

.signin-prompt {
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.signin-link {
  color: #818cf8;
  font-weight: 600;
  margin-left: 0.35rem;
}

.signin-link:hover {
  text-decoration: underline;
}
</style>
