<script setup lang="ts">
import { ref } from 'vue';
import { useHead } from '@vueuse/head';

useHead({
  title: 'Contact Us & Technical Support - DevTol',
  meta: [
    {
      name: 'description',
      content: 'Contact the DevTol engineering and support team. Submit tool feedback, report security vulnerabilities, or inquire about partnerships.',
    },
  ],
});

const form = ref({
  name: '',
  email: '',
  subject: 'General Inquiry',
  message: '',
});

const CONTACT_EMAIL = 'Lordrealstate5@gmail.com';

function handleSubmit() {
  const subject = `[DevTol] ${form.value.subject}`;
  const body = `Name: ${form.value.name}\nEmail: ${form.value.email}\n\n${form.value.message}`;
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
</script>

<template>
  <div class="contact-container">
    <div class="contact-card">
      <div class="mb-8 text-center">
        <h1 class="text-3xl text-slate-900 font-extrabold tracking-tight dark:text-white">
          Contact Us & Support
        </h1>
        <p class="mt-2 text-slate-500 dark:text-neutral-400">
          Have a suggestion for a new utility, spotted a bug, or want to report a security disclosure? We'd love to hear from you.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <!-- Direct Channels -->
        <div class="lg:col-span-1 space-y-4">
          <div class="border border-slate-200 rounded-lg bg-slate-50 p-5 dark:border-neutral-700 dark:bg-neutral-800/60">
            <h2 class="mb-2 text-lg text-slate-900 font-bold dark:text-white">
              Direct Contact Channels
            </h2>

            <div class="text-sm text-slate-600 space-y-3 dark:text-neutral-300">
              <div>
                <p class="text-xs text-slate-500 font-semibold uppercase dark:text-neutral-400">
                  Email
                </p>
                <a href="mailto:Lordrealstate5@gmail.com" class="text-primary font-medium hover:underline">Lordrealstate5@gmail.com</a>
              </div>

              <div>
                <p class="text-xs text-slate-500 font-semibold uppercase dark:text-neutral-400">
                  Phone (Support)
                </p>
                <a href="tel:+201096656588" class="text-primary font-medium hover:underline">+20 1096656588</a>
              </div>

              <div>
                <p class="text-xs text-slate-500 font-semibold uppercase dark:text-neutral-400">
                  Feature Requests & Feedback
                </p>
                <a href="mailto:Lordrealstate5@gmail.com?subject=Feature%20Request" class="text-primary font-medium hover:underline">
                  Submit Feedback / Request
                </a>
              </div>

              <div>
                <p class="text-xs text-slate-500 font-semibold uppercase dark:text-neutral-400">
                  Facebook
                </p>
                <a href="https://www.facebook.com/ellordmax1" target="_blank" rel="noopener noreferrer" class="text-primary font-medium hover:underline">
                  facebook.com/ellordmax1
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Contact Form -->
        <div class="lg:col-span-2">
          <form class="space-y-4" @submit.prevent="handleSubmit">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-xs text-slate-600 font-semibold tracking-wider uppercase dark:text-neutral-300">Your Name *</label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  placeholder="e.g. Alex Johnson"
                  class="w-full border border-slate-200 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-900 dark:border-neutral-700 focus:border-emerald-500 dark:bg-neutral-900 dark:text-white focus:outline-none"
                >
              </div>

              <div>
                <label class="mb-1 block text-xs text-slate-600 font-semibold tracking-wider uppercase dark:text-neutral-300">Your Email *</label>
                <input
                  v-model="form.email"
                  type="email"
                  required
                  placeholder="e.g. alex@example.com"
                  class="w-full border border-slate-200 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-900 dark:border-neutral-700 focus:border-emerald-500 dark:bg-neutral-900 dark:text-white focus:outline-none"
                >
              </div>
            </div>

            <div>
              <label class="mb-1 block text-xs text-slate-600 font-semibold tracking-wider uppercase dark:text-neutral-300">Subject</label>
              <select
                v-model="form.subject"
                class="w-full border border-slate-200 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-900 dark:border-neutral-700 focus:border-emerald-500 dark:bg-neutral-900 dark:text-white focus:outline-none"
              >
                <option value="General Inquiry">
                  General Inquiry
                </option>
                <option value="Feature Request">
                  New Tool Request / Suggestion
                </option>
                <option value="Bug Report">
                  Bug Report
                </option>
                <option value="Security Disclosure">
                  Security & Vulnerability Disclosure
                </option>
                <option value="Privacy Request">
                  Data Privacy & Legal Request
                </option>
              </select>
            </div>

            <div>
              <label class="mb-1 block text-xs text-slate-600 font-semibold tracking-wider uppercase dark:text-neutral-300">Message *</label>
              <textarea
                v-model="form.message"
                required
                rows="5"
                placeholder="Provide details regarding your inquiry, bug description, or tool recommendation..."
                class="w-full border border-slate-200 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-900 dark:border-neutral-700 focus:border-emerald-500 dark:bg-neutral-900 dark:text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              class="w-full rounded-md bg-emerald-600 py-2.5 text-sm text-white font-semibold transition-colors hover:bg-emerald-500"
            >
              Send Message
            </button>

            <p class="text-center text-xs text-slate-500 dark:text-neutral-400">
              Clicking "Send Message" opens your email app with your message pre-filled to Lordrealstate5@gmail.com. Nothing is sent through DevTol's servers.
            </p>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contact-container {
  max-width: 950px;
  margin: 40px auto;
  padding: 0 20px 80px;
}

.contact-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
  border-radius: 14px;
  padding: 36px;
}

:global(.dark) .contact-card {
  background: rgba(24, 24, 28, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: none;
}

.text-primary {
  color: #10b981;
}
</style>
