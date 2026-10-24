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
  <div class="register-view">
    <div class="card-header">
      <h2>{{ t('auth.join_title') }}</h2>
      <p class="subtitle">{{ t('auth.join_subtitle') }}</p>
    </div>

    <!-- Error Alerts -->
    <div v-if="validationError || error" class="alert-error">
      {{ validationError || error }}
    </div>

    <form @submit.prevent="handleRegister" class="register-form">
      <div class="form-group">
        <label for="reg-name" class="form-label">{{ t('auth.full_name') }}</label>
        <input id="reg-name" v-model="fullName" type="text" :placeholder="t('auth.full_name_placeholder')" required
          class="input-field" />
      </div>

      <div class="form-group">
        <label for="reg-email" class="form-label">{{ t('auth.email') }}</label>
        <input id="reg-email" v-model="email" type="email" :placeholder="t('auth.email_placeholder')" required
          class="input-field" />
      </div>

      <div class="form-group">
        <label for="reg-phone" class="form-label">{{ t('auth.phone_optional') }}</label>
        <input id="reg-phone" v-model="phone" type="tel" :placeholder="t('auth.phone_placeholder')"
          class="input-field" />
      </div>

      <div class="form-group">
        <label class="form-label">{{ t('auth.register_as') }}</label>
        <div class="role-selector">
          <label class="role-option" :class="{ selected: role === 'TENANT' }">
            <input type="radio" v-model="role" value="TENANT" class="radio-hidden" />
            <div class="role-icon-box">
              <Key :size="16" />
            </div>
            <div class="role-text">
              <span class="role-title">{{ t('auth.role_tenant') }}</span>
              <span class="role-desc">{{ t('auth.role_tenant_desc') }}</span>
            </div>
          </label>

          <label class="role-option" :class="{ selected: role === 'LANDLORD' }">
            <input type="radio" v-model="role" value="LANDLORD" class="radio-hidden" />
            <div class="role-icon-box">
              <Building :size="16" />
            </div>
            <div class="role-text">
              <span class="role-title">{{ t('auth.role_landlord') }}</span>
              <span class="role-desc">{{ t('auth.role_landlord_desc') }}</span>
            </div>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label for="reg-password" class="form-label">{{ t('auth.password') }}</label>
        <div class="password-input-wrap">
          <input
            id="reg-password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            :placeholder="t('auth.password_hint')"
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

      <div class="form-group">
        <label for="reg-confirm" class="form-label">{{ t('auth.confirm_password') }}</label>
        <div class="password-input-wrap">
          <input
            id="reg-confirm"
            v-model="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            :placeholder="t('auth.confirm_password_placeholder')"
            required
            class="input-field password-input"
          />
          <button
            type="button"
            class="password-toggle-btn"
            @click="showConfirmPassword = !showConfirmPassword"
            :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
          >
            <EyeOff v-if="showConfirmPassword" :size="15" />
            <Eye v-else :size="15" />
          </button>
        </div>
      </div>

      <!-- Legal Terms and Privacy Policy Consent Checkbox -->
      <div class="form-group consent-group">
        <label class="consent-checkbox-label">
          <input
            id="reg-terms-consent"
            v-model="termsAccepted"
            type="checkbox"
            class="checkbox-input"
            required
          />
          <span class="consent-text">
            {{ t('auth.terms_consent_prefix') }}
            <NuxtLink to="/terms" target="_blank" class="legal-link">
              {{ t('auth.terms_link') }}
            </NuxtLink>
            {{ t('auth.terms_consent_and') }}
            <NuxtLink to="/privacy" target="_blank" class="legal-link">
              {{ t('auth.privacy_link') }}
            </NuxtLink>
            <span class="version-tag">{{ t('auth.terms_version_tag') }}</span>.
          </span>
        </label>
      </div>

      <button type="submit" :disabled="isLoading" class="btn-primary btn-block">
        <span v-if="isLoading">{{ t('auth.creating_account') }}</span>
        <span v-else>{{ t('auth.register_account') }}</span>
      </button>
    </form>

    <div class="signin-prompt">
      <span>{{ t('auth.already_have_account') }}</span>
      <NuxtLink to="/login" class="signin-link">{{ t('auth.sign_in') }}</NuxtLink>
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

.signin-prompt {
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.signin-link {
  color: var(--primary);
  font-weight: 600;
  margin-left: 0.35rem;
}

.signin-link:hover {
  text-decoration: underline;
}

.consent-group {
  margin: 0.5rem 0 0.25rem;
}

.consent-checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  cursor: pointer;
  user-select: none;
}

.checkbox-input {
  margin-top: 0.2rem;
  width: 16px;
  height: 16px;
  accent-color: var(--primary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  flex-shrink: 0;
}

.consent-text {
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.45;
}

.legal-link {
  color: var(--primary);
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.legal-link:hover {
  color: var(--primary-hover);
}

.version-tag {
  color: var(--text-dim);
  font-size: 0.75rem;
  margin-left: 0.2rem;
}
</style>
