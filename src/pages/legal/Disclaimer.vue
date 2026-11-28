<script setup lang="ts">
import { useHead } from '@vueuse/head';

useHead({
  title: 'Disclaimer - DevTol',
  meta: [
    {
      name: 'description',
      content: 'Disclaimer and terms regarding the usage, accuracy, and client-side processing of tools on DevTol.',
    },
  ],
});
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-12">
    <div class="border border-slate-200 rounded-2xl bg-white p-8 shadow-sm dark:border-[#282845] dark:bg-[#1B1B30] md:p-12">
      <h1 class="mb-4 text-3xl text-slate-900 font-bold tracking-tight md:text-4xl dark:text-white">
        Disclaimer
      </h1>
      <p class="mb-8 text-sm text-slate-500 dark:text-slate-400">
        Last updated: September 2026
      </p>

      <div class="max-w-none text-slate-700 prose prose-slate space-y-6 dark:text-slate-300 dark:prose-invert">
        <section>
          <h2 class="text-xl text-slate-900 font-semibold dark:text-white">
            1. General Information
          </h2>
          <p>
            The information and developer utilities provided on <strong>DevTol</strong> are intended strictly for general informational, development, educational, and testing purposes. While we strive to ensure that calculations, format conversions, cryptographic hash algorithms, and formatting outputs are accurate and up to date, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or availability with respect to the website or the tools contained herein.
          </p>
        </section>

        <section>
          <h2 class="text-xl text-slate-900 font-semibold dark:text-white">
            2. 100% Client-Side Evaluation
          </h2>
          <p>
            All computations, token generation, regex testing, encoding, and data parsing are carried out exclusively within your client web browser via JavaScript/WebAssembly. None of your payload inputs, tokens, passwords, or files are uploaded to or stored on our servers. You remain entirely responsible for the confidentiality, custody, and verification of any critical data or sensitive credentials handled in your browser session.
          </p>
        </section>

        <section>
          <h2 class="text-xl text-slate-900 font-semibold dark:text-white">
            3. Professional Advice & Liability
          </h2>
          <p>
            Under no circumstances shall DevTol or its contributors be held liable for any loss or damage including, without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or profits arising out of, or in connection with, the use of this website.
          </p>
        </section>

        <section>
          <h2 class="text-xl text-slate-900 font-semibold dark:text-white">
            4. External Links & Third-Party Advertising
          </h2>
          <p>
            This website may contain links to external sites or display third-party advertisements (such as Google AdSense). We have no control over the nature, content, and availability of those third-party sites or services. The inclusion of any links or advertisements does not necessarily imply a recommendation or endorse the views expressed within them.
          </p>
        </section>
      </div>
    </div>
  </div>
</template>
