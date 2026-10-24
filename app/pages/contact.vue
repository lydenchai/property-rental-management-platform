<script setup lang="ts">
import { ref } from 'vue';
import {
  Mail,
  Clock,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  FileQuestion
} from '@lucide/vue';
import type { ContactCategory } from '~~/shared/schemas/contact.schema';

definePageMeta({
  layout: 'default',
});

const { t } = useI18n();

useSeoMeta({
  title: 'Contact Us | RentEase Support & Inquiries',
  description: 'Get in touch with the RentEase platform support team for landlord onboarding, resident tenancy assistance, technical support, or legal inquiries in Cambodia.',
  ogTitle: 'Contact Support | RentEase',
  ogDescription: 'Contact RentEase support desk for property management assistance.',
});

const form = ref({
  fullName: '',
  email: '',
  category: 'GENERAL' as ContactCategory,
  propertyReference: '',
  subject: '',
  message: '',
});

const isSubmitting = ref(false);
const validationErrors = ref<Record<string, string>>({});
const submissionError = ref<string | null>(null);
const submissionSuccess = ref<{
  referenceNumber: string;
  message: string;
} | null>(null);

function validateForm(): boolean {
  validationErrors.value = {};

  if (!form.value.fullName.trim() || form.value.fullName.trim().length < 2) {
    validationErrors.value.fullName = 'Full name must be at least 2 characters';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!form.value.email.trim() || !emailRegex.test(form.value.email.trim())) {
    validationErrors.value.email = 'Please provide a valid email address';
  }

  if (!form.value.subject.trim() || form.value.subject.trim().length < 3) {
    validationErrors.value.subject = 'Subject must be at least 3 characters';
  }

  if (!form.value.message.trim() || form.value.message.trim().length < 10) {
    validationErrors.value.message = 'Please provide a detailed message (at least 10 characters)';
  }

  return Object.keys(validationErrors.value).length === 0;
}

async function handleSubmit() {
  submissionError.value = null;

  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;
  try {
    const response = await $fetch<{
      success: boolean;
      data?: {
        referenceNumber: string;
        message: string;
      };
      error?: {
        message: string;
      };
    }>('/api/v1/contact', {
      method: 'POST',
      body: {
        fullName: form.value.fullName.trim(),
        email: form.value.email.trim(),
        category: form.value.category,
        propertyReference: form.value.propertyReference.trim() || null,
        subject: form.value.subject.trim(),
        message: form.value.message.trim(),
      },
    });

    if (response?.success && response?.data) {
      submissionSuccess.value = {
        referenceNumber: response.data.referenceNumber,
        message: response.data.message,
      };
      // Reset form fields
      form.value = {
        fullName: '',
        email: '',
        category: 'GENERAL',
        propertyReference: '',
        subject: '',
        message: '',
      };
    } else {
      submissionError.value = response?.error?.message || 'Failed to submit inquiry. Please try again.';
    }
  } catch (err: any) {
    submissionError.value = err?.data?.error?.message || err?.message || 'Network error submitting request. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
}

function resetForm() {
  submissionSuccess.value = null;
  submissionError.value = null;
}
</script>

<template>
  <div class="contact-page">
    <!-- Hero Header -->
    <section class="contact-hero-section">
      <div class="contact-hero-container">
        <div class="contact-badge">
          <Mail :size="14" class="badge-icon" />
          <span>{{ t('contact.badge') }}</span>
        </div>
        <h1 class="contact-title">{{ t('contact.title') }}</h1>
        <p class="contact-lead">
          {{ t('contact.lead') }}
        </p>
      </div>
    </section>

    <!-- Main Content Section -->
    <section class="contact-main-section">
      <div class="contact-container">
        <div class="contact-grid">
          <!-- Information Sidebar (Left Column) -->
          <aside class="contact-info-col">
            <div class="info-card card-flat">
              <h2 class="info-card-title">{{ t('contact.hours_title') }}</h2>
              <div class="info-item">
                <Clock :size="18" class="info-icon" />
                <div>
                  <strong>{{ t('contact.hours_days') }}</strong>
                  <p>{{ t('contact.hours_time') }}</p>
                  <span class="info-subtext">{{ t('contact.hours_subtext') }}</span>
                </div>
              </div>

              <div class="info-divider" />

              <h2 class="info-card-title">{{ t('contact.channels_title') }}</h2>
              
              <div class="info-channel">
                <span class="channel-label">{{ t('contact.channel_resident') }}</span>
                <span class="channel-val">support@rentease.local</span>
              </div>

              <div class="info-channel">
                <span class="channel-label">{{ t('contact.channel_landlord') }}</span>
                <span class="channel-val">leasing@rentease.local</span>
              </div>

              <div class="info-channel">
                <span class="channel-label">{{ t('contact.channel_security') }}</span>
                <span class="channel-val">privacy@rentease.local</span>
              </div>

              <div class="info-divider" />

              <h2 class="info-card-title">{{ t('contact.hub_title') }}</h2>
              <div class="info-item">
                <MapPin :size="18" class="info-icon" />
                <div>
                  <strong>{{ t('contact.hub_name') }}</strong>
                  <p>{{ t('contact.hub_desc') }}</p>
                </div>
              </div>
            </div>

            <!-- FAQ Quick Link Box -->
            <div class="faq-helper-card card-flat">
              <FileQuestion :size="20" class="helper-icon" />
              <div>
                <h4>{{ t('contact.faq_box_title') }}</h4>
                <p>{{ t('contact.faq_box_desc') }}</p>
              </div>
              <NuxtLink to="/faq" class="btn-secondary btn-sm">
                <span>{{ t('contact.faq_box_btn') }}</span>
              </NuxtLink>
            </div>
          </aside>

          <!-- Contact Form (Right Column) -->
          <div class="contact-form-col">
            <!-- Success Confirmation Screen -->
            <div v-if="submissionSuccess" class="success-card card-flat">
              <div class="success-header">
                <div class="success-icon-wrap">
                  <CheckCircle2 :size="28" />
                </div>
                <div>
                  <h2>{{ t('contact.success_title') }}</h2>
                  <p class="ticket-ref-text">
                    {{ t('contact.ref_id') }}: <strong>{{ submissionSuccess.referenceNumber }}</strong>
                  </p>
                </div>
              </div>

              <p class="success-desc">
                {{ submissionSuccess.message }}
              </p>

              <div class="success-note-box">
                <p>
                  {{ t('contact.success_note') }}
                </p>
              </div>

              <div class="success-actions">
                <button type="button" @click="resetForm" class="btn-secondary">
                  <span>{{ t('contact.btn_another') }}</span>
                </button>
                <NuxtLink to="/properties" class="btn-primary">
                  <span>{{ t('contact.btn_explore') }}</span>
                </NuxtLink>
              </div>
            </div>

            <!-- Active Form -->
            <div v-else class="form-card card-flat">
              <div class="form-header">
                <h2>{{ t('contact.form_title') }}</h2>
                <p>{{ t('contact.form_subtitle') }}</p>
              </div>

              <!-- Top Error Alert -->
              <div v-if="submissionError" class="alert-error">
                <AlertCircle :size="16" />
                <span>{{ submissionError }}</span>
              </div>

              <form @submit.prevent="handleSubmit" class="contact-form" novalidate>
                <!-- Name & Email Row -->
                <div class="form-row">
                  <div class="form-group flex-1">
                    <label for="contact-name" class="form-label">{{ t('contact.label_name') }} *</label>
                    <input
                      id="contact-name"
                      v-model="form.fullName"
                      type="text"
                      placeholder="e.g., Lyden Chai"
                      required
                      class="input-field"
                      :class="{ 'input-error': validationErrors.fullName }"
                    />
                    <span v-if="validationErrors.fullName" class="field-error-msg">
                      {{ validationErrors.fullName }}
                    </span>
                  </div>

                  <div class="form-group flex-1">
                    <label for="contact-email" class="form-label">{{ t('contact.label_email') }} *</label>
                    <input
                      id="contact-email"
                      v-model="form.email"
                      type="email"
                      placeholder="e.g., name@example.com"
                      required
                      class="input-field"
                      :class="{ 'input-error': validationErrors.email }"
                    />
                    <span v-if="validationErrors.email" class="field-error-msg">
                      {{ validationErrors.email }}
                    </span>
                  </div>
                </div>

                <!-- Category & Property Reference Row -->
                <div class="form-row">
                  <div class="form-group flex-1">
                    <label for="contact-category" class="form-label">{{ t('contact.label_category') }} *</label>
                    <select
                      id="contact-category"
                      v-model="form.category"
                      class="select-field"
                    >
                      <option value="GENERAL">{{ t('contact.cat_general') }}</option>
                      <option value="LANDLORD_ONBOARDING">{{ t('contact.cat_onboarding') }}</option>
                      <option value="TENANT_SUPPORT">{{ t('contact.cat_tenant') }}</option>
                      <option value="TECHNICAL_SECURITY">{{ t('contact.cat_technical') }}</option>
                      <option value="BILLING">{{ t('contact.cat_billing') }}</option>
                    </select>
                  </div>

                  <div class="form-group flex-1">
                    <label for="contact-prop-ref" class="form-label">
                      {{ t('contact.label_prop_ref') }} <span class="text-dim text-xs">{{ t('contact.optional') }}</span>
                    </label>
                    <input
                      id="contact-prop-ref"
                      v-model="form.propertyReference"
                      type="text"
                      placeholder="e.g., Skyline Studio 402, BKK1"
                      class="input-field"
                    />
                  </div>
                </div>

                <!-- Subject -->
                <div class="form-group">
                  <label for="contact-subject" class="form-label">{{ t('contact.label_subject') }} *</label>
                  <input
                    id="contact-subject"
                    v-model="form.subject"
                    type="text"
                    placeholder="Brief summary of your question or request"
                    required
                    class="input-field"
                    :class="{ 'input-error': validationErrors.subject }"
                  />
                  <span v-if="validationErrors.subject" class="field-error-msg">
                    {{ validationErrors.subject }}
                  </span>
                </div>

                <!-- Message -->
                <div class="form-group">
                  <label for="contact-message" class="form-label">{{ t('contact.label_message') }} *</label>
                  <textarea
                    id="contact-message"
                    v-model="form.message"
                    rows="5"
                    placeholder="Provide specific details so our operations team can promptly assist you..."
                    required
                    class="textarea-field"
                    :class="{ 'input-error': validationErrors.message }"
                  ></textarea>
                  <span v-if="validationErrors.message" class="field-error-msg">
                    {{ validationErrors.message }}
                  </span>
                </div>

                <!-- Submit Button -->
                <button
                  type="submit"
                  :disabled="isSubmitting"
                  class="btn-primary btn-submit"
                >
                  <span v-if="isSubmitting">{{ t('contact.btn_submitting') }}</span>
                  <template v-else>
                    <Send :size="15" />
                    <span>{{ t('contact.btn_submit') }}</span>
                  </template>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.contact-page {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  padding-bottom: 4rem;
}

.contact-container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 1.5rem;
  width: 100%;
}

/* Hero Section */
.contact-hero-section {
  padding: 3.5rem 1.5rem 2rem;
  text-align: center;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-surface);
}

.contact-hero-container {
  max-width: 780px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.contact-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  padding: 0.35rem 0.85rem;
  border-radius: var(--radius-full);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-icon {
  color: var(--color-indigo-accent);
}

.contact-title {
  font-size: 2.25rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  color: var(--text-main);
}

@media (min-width: 768px) {
  .contact-title {
    font-size: 2.75rem;
  }
}

.contact-lead {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-muted);
  max-width: 660px;
}

/* Grid Layout */
.contact-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  align-items: flex-start;
}

@media (min-width: 900px) {
  .contact-grid {
    grid-template-columns: 360px 1fr;
  }
}

/* Left Sidebar Info Card */
.contact-info-col {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.info-card {
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.info-card-title {
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-main);
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
}

.info-icon {
  color: var(--primary);
  margin-top: 0.15rem;
  flex-shrink: 0;
}

.info-item strong {
  display: block;
  font-size: 0.92rem;
  color: var(--text-main);
}

.info-item p {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 0.15rem;
}

.info-subtext {
  display: block;
  font-size: 0.76rem;
  color: var(--text-dim);
  margin-top: 0.35rem;
  line-height: 1.4;
}

.info-divider {
  height: 1px;
  background: var(--border-subtle);
}

.info-channel {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.channel-label {
  font-size: 0.76rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 600;
}

.channel-val {
  font-size: 0.88rem;
  color: var(--text-main);
  font-family: var(--font-mono);
  font-weight: 500;
}

/* Helper Card */
.faq-helper-card {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  align-items: flex-start;
}

.helper-icon {
  color: var(--color-indigo-accent);
}

.faq-helper-card h4 {
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

.faq-helper-card p {
  color: var(--text-muted);
  font-size: 0.82rem;
  line-height: 1.45;
}

/* Right Form Card */
.form-card {
  padding: 2.25rem;
}

.form-header {
  margin-bottom: 1.75rem;
}

.form-header h2 {
  font-size: 1.45rem;
  margin-bottom: 0.35rem;
}

.form-header p {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-row {
  display: flex;
  gap: 1.25rem;
  flex-direction: column;
}

@media (min-width: 640px) {
  .form-row {
    flex-direction: row;
  }
}

.flex-1 {
  flex: 1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-main);
}

.input-field,
.select-field {
  width: 100%;
  padding: 0.65rem 0.85rem;
  background: var(--bg-input);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  color: var(--text-main);
  font-size: 0.9rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s ease;
}

.input-field:focus,
.select-field:focus,
.textarea-field:focus {
  border-color: var(--border-focus);
}

.textarea-field {
  width: 100%;
  padding: 0.75rem 0.85rem;
  background: var(--bg-input);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  color: var(--text-main);
  font-size: 0.9rem;
  font-family: inherit;
  outline: none;
  resize: vertical;
  min-height: 120px;
  line-height: 1.5;
  transition: border-color 0.15s ease;
}

.input-error {
  border-color: var(--color-rose-accent) !important;
}

.field-error-msg {
  font-size: 0.75rem;
  color: var(--color-rose-accent);
}

.btn-submit {
  align-self: flex-start;
  padding: 0.65rem 1.4rem;
  font-size: 0.9rem;
}

/* Success Card */
.success-card {
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.success-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.success-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  background: var(--accent-emerald-subtle);
  color: var(--accent-emerald);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.success-header h2 {
  font-size: 1.35rem;
}

.ticket-ref-text {
  font-size: 0.88rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
  margin-top: 0.2rem;
}

.success-desc {
  font-size: 0.95rem;
  color: var(--text-muted);
  line-height: 1.55;
}

.success-note-box {
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  padding: 1rem 1.25rem;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.5;
}

.success-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.alert-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--accent-rose-subtle);
  color: var(--color-rose-accent);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  margin-bottom: 1rem;
}
</style>
