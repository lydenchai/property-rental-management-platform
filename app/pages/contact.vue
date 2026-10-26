<script setup lang="ts">
import { ref } from 'vue';
import { Mail, Clock, MapPin, Send, CheckCircle2, AlertCircle, FileQuestion } from '@lucide/vue';
import type { ContactCategory } from '~~/shared/schemas/contact.schema';

definePageMeta({
  layout: 'default',
});

const { t } = useI18n();

useSeoMeta({
  title: 'Contact Us | RentEase Support & Inquiries',
  description:
    'Get in touch with the RentEase platform support team for landlord onboarding, resident tenancy assistance, technical support, or legal inquiries in Cambodia.',
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
      submissionError.value =
        response?.error?.message || 'Failed to submit inquiry. Please try again.';
    }
  } catch (err: any) {
    submissionError.value =
      err?.data?.error?.message ||
      err?.message ||
      'Network error submitting request. Please try again.';
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
  <div class="flex flex-col gap-10 pb-16">
    <!-- Hero Header -->
    <section
      class="border-b border-neutral-200 bg-white px-4 py-12 text-center transition-colors dark:border-neutral-800 dark:bg-neutral-950 sm:px-6"
    >
      <div class="mx-auto flex max-w-3xl flex-col items-center gap-4">
        <div
          class="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
        >
          <Mail :size="14" class="text-blue-600 dark:text-blue-400" />
          <span>{{ t('contact.badge') }}</span>
        </div>
        <h1 class="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
          {{ t('contact.title') }}
        </h1>
        <p
          class="max-w-2xl text-sm leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-base"
        >
          {{ t('contact.lead') }}
        </p>
      </div>
    </section>

    <!-- Main Content Section -->
    <section class="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div class="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <!-- Information Sidebar (Left Column) -->
        <aside class="flex flex-col gap-6 lg:col-span-5">
          <div
            class="shadow-xs flex flex-col gap-6 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div>
              <h2
                class="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500"
              >
                {{ t('contact.hours_title') }}
              </h2>
              <div class="flex items-start gap-3 text-sm">
                <Clock :size="18" class="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
                <div class="flex flex-col gap-0.5">
                  <strong class="text-neutral-900 dark:text-white">{{
                    t('contact.hours_days')
                  }}</strong>
                  <p class="text-neutral-600 dark:text-neutral-300">
                    {{ t('contact.hours_time') }}
                  </p>
                  <span class="text-xs text-neutral-400 dark:text-neutral-500">{{
                    t('contact.hours_subtext')
                  }}</span>
                </div>
              </div>
            </div>

            <div class="border-t border-neutral-100 dark:border-neutral-800" />

            <div>
              <h2
                class="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500"
              >
                {{ t('contact.channels_title') }}
              </h2>

              <div class="flex flex-col gap-2.5 text-xs sm:text-sm">
                <div
                  class="flex items-center justify-between border-b border-neutral-100 py-1 dark:border-neutral-800/60"
                >
                  <span class="text-neutral-500 dark:text-neutral-400">{{
                    t('contact.channel_resident')
                  }}</span>
                  <span class="font-mono text-neutral-900 dark:text-white"
                    >support@rentease.local</span
                  >
                </div>

                <div
                  class="flex items-center justify-between border-b border-neutral-100 py-1 dark:border-neutral-800/60"
                >
                  <span class="text-neutral-500 dark:text-neutral-400">{{
                    t('contact.channel_landlord')
                  }}</span>
                  <span class="font-mono text-neutral-900 dark:text-white"
                    >leasing@rentease.local</span
                  >
                </div>

                <div class="flex items-center justify-between py-1">
                  <span class="text-neutral-500 dark:text-neutral-400">{{
                    t('contact.channel_security')
                  }}</span>
                  <span class="font-mono text-neutral-900 dark:text-white"
                    >privacy@rentease.local</span
                  >
                </div>
              </div>
            </div>

            <div class="border-t border-neutral-100 dark:border-neutral-800" />

            <div>
              <h2
                class="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500"
              >
                {{ t('contact.hub_title') }}
              </h2>
              <div class="flex items-start gap-3 text-sm">
                <MapPin :size="18" class="mt-0.5 shrink-0 text-rose-500" />
                <div class="flex flex-col gap-0.5">
                  <strong class="text-neutral-900 dark:text-white">{{
                    t('contact.hub_name')
                  }}</strong>
                  <p class="text-xs text-neutral-600 dark:text-neutral-300 sm:text-sm">
                    {{ t('contact.hub_desc') }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- FAQ Quick Link Box -->
          <div
            class="shadow-xs flex items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-900/60"
          >
            <div class="flex items-center gap-3">
              <FileQuestion :size="20" class="shrink-0 text-blue-600 dark:text-blue-400" />
              <div>
                <h4 class="text-xs font-bold text-neutral-900 dark:text-white sm:text-sm">
                  {{ t('contact.faq_box_title') }}
                </h4>
                <p class="text-[11px] text-neutral-500 dark:text-neutral-400 sm:text-xs">
                  {{ t('contact.faq_box_desc') }}
                </p>
              </div>
            </div>
            <NuxtLink to="/faq" class="btn-secondary btn-sm shrink-0">
              <span>{{ t('contact.faq_box_btn') }}</span>
            </NuxtLink>
          </div>
        </aside>

        <!-- Contact Form (Right Column) -->
        <div class="lg:col-span-7">
          <!-- Success Confirmation Screen -->
          <div
            v-if="submissionSuccess"
            class="shadow-xs flex flex-col gap-5 rounded-xl border border-emerald-500/30 bg-white p-6 dark:bg-neutral-900 sm:p-8"
          >
            <div class="flex items-start gap-4">
              <div
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-400"
              >
                <CheckCircle2 :size="24" />
              </div>
              <div class="flex flex-col gap-1">
                <h2 class="text-xl font-bold text-neutral-900 dark:text-white">
                  {{ t('contact.success_title') }}
                </h2>
                <p class="text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm">
                  {{ t('contact.ref_id') }}:
                  <strong class="font-mono text-neutral-900 dark:text-white">{{
                    submissionSuccess.referenceNumber
                  }}</strong>
                </p>
              </div>
            </div>

            <p class="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
              {{ submissionSuccess.message }}
            </p>

            <div
              class="rounded-lg border border-neutral-200 bg-neutral-50 p-3.5 text-xs text-neutral-500 dark:border-neutral-700/60 dark:bg-neutral-800/50 dark:text-neutral-400"
            >
              <p>{{ t('contact.success_note') }}</p>
            </div>

            <div class="flex flex-wrap items-center gap-3 pt-2">
              <button type="button" @click="resetForm" class="btn-secondary">
                <span>{{ t('contact.btn_another') }}</span>
              </button>
              <NuxtLink to="/properties" class="btn-primary">
                <span>{{ t('contact.btn_explore') }}</span>
              </NuxtLink>
            </div>
          </div>

          <!-- Active Form -->
          <div
            v-else
            class="shadow-xs flex flex-col gap-5 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 sm:p-8"
          >
            <div>
              <h2 class="text-xl font-bold text-neutral-900 dark:text-white">
                {{ t('contact.form_title') }}
              </h2>
              <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm">
                {{ t('contact.form_subtitle') }}
              </p>
            </div>

            <!-- Top Error Alert -->
            <div v-if="submissionError" class="alert-error">
              <AlertCircle :size="16" />
              <span>{{ submissionError }}</span>
            </div>

            <form @submit.prevent="handleSubmit" class="flex flex-col gap-4" novalidate>
              <!-- Name & Email Row -->
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div class="flex flex-col gap-1.5">
                  <label
                    for="contact-name"
                    class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
                  >
                    {{ t('contact.label_name') }} *
                  </label>
                  <input
                    id="contact-name"
                    v-model="form.fullName"
                    type="text"
                    placeholder="e.g., Lyden Chai"
                    required
                    class="w-full rounded-md border bg-white px-3.5 py-2.5 text-sm text-neutral-900 transition-colors placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-neutral-950 dark:text-white dark:focus:ring-blue-500"
                    :class="
                      validationErrors.fullName
                        ? 'border-rose-500'
                        : 'border-neutral-300 dark:border-neutral-700'
                    "
                  />
                  <span v-if="validationErrors.fullName" class="text-xs text-rose-500">
                    {{ validationErrors.fullName }}
                  </span>
                </div>

                <div class="flex flex-col gap-1.5">
                  <label
                    for="contact-email"
                    class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
                  >
                    {{ t('contact.label_email') }} *
                  </label>
                  <input
                    id="contact-email"
                    v-model="form.email"
                    type="email"
                    placeholder="e.g., name@example.com"
                    required
                    class="w-full rounded-md border bg-white px-3.5 py-2.5 text-sm text-neutral-900 transition-colors placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-neutral-950 dark:text-white dark:focus:ring-blue-500"
                    :class="
                      validationErrors.email
                        ? 'border-rose-500'
                        : 'border-neutral-300 dark:border-neutral-700'
                    "
                  />
                  <span v-if="validationErrors.email" class="text-xs text-rose-500">
                    {{ validationErrors.email }}
                  </span>
                </div>
              </div>

              <!-- Category & Property Reference Row -->
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div class="flex flex-col gap-1.5">
                  <label
                    for="contact-category"
                    class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
                  >
                    {{ t('contact.label_category') }} *
                  </label>
                  <select
                    id="contact-category"
                    v-model="form.category"
                    class="w-full rounded-md border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:focus:ring-blue-500"
                  >
                    <option value="GENERAL">{{ t('contact.cat_general') }}</option>
                    <option value="LANDLORD_ONBOARDING">{{ t('contact.cat_onboarding') }}</option>
                    <option value="TENANT_SUPPORT">{{ t('contact.cat_tenant') }}</option>
                    <option value="TECHNICAL_SECURITY">{{ t('contact.cat_technical') }}</option>
                    <option value="BILLING">{{ t('contact.cat_billing') }}</option>
                  </select>
                </div>

                <div class="flex flex-col gap-1.5">
                  <label
                    for="contact-prop-ref"
                    class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
                  >
                    {{ t('contact.label_prop_ref') }}
                    <span class="text-[11px] font-normal text-neutral-400"
                      >({{ t('contact.optional') }})</span
                    >
                  </label>
                  <input
                    id="contact-prop-ref"
                    v-model="form.propertyReference"
                    type="text"
                    placeholder="e.g., Skyline Studio 402, BKK1"
                    class="w-full rounded-md border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 transition-colors placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:focus:ring-blue-500"
                  />
                </div>
              </div>

              <!-- Subject -->
              <div class="flex flex-col gap-1.5">
                <label
                  for="contact-subject"
                  class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
                >
                  {{ t('contact.label_subject') }} *
                </label>
                <input
                  id="contact-subject"
                  v-model="form.subject"
                  type="text"
                  placeholder="Brief summary of your question or request"
                  required
                  class="w-full rounded-md border bg-white px-3.5 py-2.5 text-sm text-neutral-900 transition-colors placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-neutral-950 dark:text-white dark:focus:ring-blue-500"
                  :class="
                    validationErrors.subject
                      ? 'border-rose-500'
                      : 'border-neutral-300 dark:border-neutral-700'
                  "
                />
                <span v-if="validationErrors.subject" class="text-xs text-rose-500">
                  {{ validationErrors.subject }}
                </span>
              </div>

              <!-- Message -->
              <div class="flex flex-col gap-1.5">
                <label
                  for="contact-message"
                  class="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
                >
                  {{ t('contact.label_message') }} *
                </label>
                <textarea
                  id="contact-message"
                  v-model="form.message"
                  rows="5"
                  placeholder="Provide specific details so our operations team can promptly assist you..."
                  required
                  class="w-full rounded-md border bg-white px-3.5 py-2.5 text-sm text-neutral-900 transition-colors placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-neutral-950 dark:text-white dark:focus:ring-blue-500"
                  :class="
                    validationErrors.message
                      ? 'border-rose-500'
                      : 'border-neutral-300 dark:border-neutral-700'
                  "
                ></textarea>
                <span v-if="validationErrors.message" class="text-xs text-rose-500">
                  {{ validationErrors.message }}
                </span>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                :disabled="isSubmitting"
                class="mt-2 inline-flex w-full items-center justify-center gap-2 self-start rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700 sm:w-auto"
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
    </section>
  </div>
</template>
