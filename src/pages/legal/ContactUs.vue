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
  const subject = `[DevTol] ${form.subject}`;
  const body = `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`;
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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
                <p class="text-xs text-slate-500 dark:text-neutral-400 font-semibold uppercase">Email</p>
                <a href="mailto:Lordrealstate5@gmail.com" class="text-primary hover:underline font-medium">Lordrealstate5@gmail.com</a>
              </div>

              <div>
                <p class="text-xs text-slate-500 dark:text-neutral-400 font-semibold uppercase">Phone (Support)</p>
                <a href="tel:+201096656588" class="text-primary hover:underline font-medium">+20 1096656588</a>
              </div>

              <div>
                <p class="text-xs text-slate-500 dark:text-neutral-400 font-semibold uppercase">Feature Requests & Feedback</p>
                <a href="mailto:Lordrealstate5@gmail.com?subject=Feature%20Request" class="text-primary hover:underline font-medium">
                  Submit Feedback / Request
                </a>
              </div>

              <div>
                <p class="text-xs text-slate-500 dark:text-neutral-400 font-semibold uppercase">Facebook</p>
                <a href="https://www.facebook.com/ellordmax1" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-medium">
                  facebook.com/ellordmax1
                </a>
              </div>
            </div>
          </div>

        </div>

        <!-- Contact Form -->
        <div class="lg:col-span-2">
          <form class="space-y-4" @submit.prevent="handleSubmit">
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
              class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-md text-sm transition-colors"
            >
              Send Message
            </button>

            <p class="text-xs text-slate-500 dark:text-neutral-400 text-center">
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

