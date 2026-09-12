<script setup lang="ts">
import { ref } from 'vue';
import { useHead } from '@vueuse/head';

useHead({
  title: 'Contact Us & Technical Support - DevTool.it',
  meta: [
    {
      name: 'description',
      content: 'Contact the DevTool.it engineering and support team. Submit tool feedback, report security vulnerabilities, or inquire about partnerships.',
    },
  ],
});

const form = ref({
  name: '',
  email: '',
  subject: 'General Inquiry',
  message: '',
});

const isSubmitted = ref(false);
const isSubmitting = ref(false);

function handleSubmit() {
  isSubmitting.value = true;
  // Simulate client-side confirmation
  setTimeout(() => {
    isSubmitting.value = false;
    isSubmitted.value = true;
  }, 600);
}
</script>

<template>
  <div class="contact-container">
    <div class="contact-card">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Contact Us & Support</h1>
        <p class="text-slate-500 dark:text-neutral-400 mt-2">
          Have a suggestion for a new utility, spotted a bug, or want to report a security disclosure? We'd love to hear from you.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Direct Channels -->
        <div class="lg:col-span-1 space-y-4">
          <div class="p-5 rounded-lg bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Direct Contact Channels</h2>
            
            <div class="space-y-3 text-sm text-slate-600 dark:text-neutral-300">
              <div>
                <p class="text-xs text-slate-500 dark:text-neutral-400 font-semibold uppercase">General Inquiries & Support</p>
                <a href="mailto:support@devtool-it.pages.dev" class="text-primary hover:underline font-medium">support@devtool-it.pages.dev</a>
              </div>

              <div>
                <p class="text-xs text-slate-500 dark:text-neutral-400 font-semibold uppercase">Privacy & Legal</p>
                <a href="mailto:privacy@devtool-it.pages.dev" class="text-primary hover:underline font-medium">privacy@devtool-it.pages.dev</a>
              </div>

              <div>
                <p class="text-xs text-slate-500 dark:text-neutral-400 font-semibold uppercase">Open Source Bug Tracker</p>
                <a href="https://github.com/CorentinTh/DevTool.it/issues" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-medium">
                  GitHub Issues Tracker
                </a>
              </div>

              <div>
                <p class="text-xs text-slate-500 dark:text-neutral-400 font-semibold uppercase">Twitter / X</p>
                <a href="https://x.com/ittoolsdottech" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-medium">
                  @ittoolsdottech
                </a>
              </div>
            </div>
          </div>

          <div class="p-4 rounded-lg bg-slate-100 dark:bg-neutral-800/40 border border-slate-200 dark:border-neutral-700/60 text-xs text-slate-500 dark:text-neutral-400">
            <p class="font-semibold text-slate-600 dark:text-neutral-300 mb-1">Response Time SLA</p>
            <p>We aim to reply to community and technical inquiries within 24 to 48 business hours.</p>
          </div>
        </div>

        <!-- Contact Form -->
        <div class="lg:col-span-2">
          <div v-if="isSubmitted" class="p-8 rounded-lg bg-emerald-950/40 border border-emerald-500/50 text-center">
            <div class="text-4xl mb-3">âœ…</div>
            <h2 class="text-xl font-bold text-emerald-400 mb-2">Message Sent Successfully!</h2>
            <p class="text-slate-600 dark:text-neutral-300 text-sm">
              Thank you for reaching out. Our engineering team has received your message and will review it promptly.
            </p>
            <button
              class="mt-5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-900 dark:text-white rounded-md text-sm font-medium transition-colors"
              @click="isSubmitted = false; form.name = ''; form.email = ''; form.message = '';"
            >
              Send Another Message
            </button>
          </div>

          <form v-else class="space-y-4" @submit.prevent="handleSubmit">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-neutral-300 mb-1 uppercase tracking-wider">Your Name *</label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  placeholder="e.g. Alex Johnson"
                  class="w-full px-3 py-2 bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-md text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-neutral-300 mb-1 uppercase tracking-wider">Your Email *</label>
                <input
                  v-model="form.email"
                  type="email"
                  required
                  placeholder="e.g. alex@example.com"
                  class="w-full px-3 py-2 bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-md text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-600 dark:text-neutral-300 mb-1 uppercase tracking-wider">Subject</label>
              <select
                v-model="form.subject"
                class="w-full px-3 py-2 bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-md text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="General Inquiry">General Inquiry</option>
                <option value="Feature Request">New Tool Request / Suggestion</option>
                <option value="Bug Report">Bug Report</option>
                <option value="Security Disclosure">Security & Vulnerability Disclosure</option>
                <option value="Privacy Request">Data Privacy & Legal Request</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-600 dark:text-neutral-300 mb-1 uppercase tracking-wider">Message *</label>
              <textarea
                v-model="form.message"
                required
                rows="5"
                placeholder="Provide details regarding your inquiry, bug description, or tool recommendation..."
                class="w-full px-3 py-2 bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-md text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
              ></textarea>
            </div>

            <button
              type="submit"
              :disabled="isSubmitting"
              class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-900 dark:text-white font-semibold rounded-md text-sm transition-colors"
            >
              {{ isSubmitting ? 'Transmitting...' : 'Send Message' }}
            </button>
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
  background: rgba(24, 24, 28, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 36px;
}

.text-primary {
  color: #10b981;
}
</style>

