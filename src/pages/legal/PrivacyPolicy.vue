<script setup lang="ts">
import { useHead } from '@vueuse/head';

useHead({
  title: 'Privacy Policy - DevTol',
  meta: [
    {
      name: 'description',
      content: 'Privacy Policy for DevTol. Learn how we handle your data, Google AdSense cookies, DART cookies, GDPR, and CCPA compliance.',
    },
  ],
});
</script>

<template>
  <div class="legal-container">
    <div class="legal-card">
      <h1 class="text-3xl font-bold mb-4 text-primary">Privacy Policy</h1>
      <p class="text-sm text-slate-500 dark:text-neutral-400 mb-6">Last Updated: September 11, 2026</p>

      <div class="space-y-6 text-slate-600 dark:text-neutral-300 leading-relaxed">
        <section>
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">1. Introduction</h2>
          <p>
            Welcome to <strong>DevTol</strong> ("we", "our", or "us"). We respect your privacy and are committed to protecting any personal data you share or that is collected through your use of our website and utilities. This Privacy Policy outlines the types of information we collect, how it is processed, and your legal rights under applicable privacy frameworks, including the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA).
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">2. Client-Side Processing Architecture (Zero Data Storage)</h2>
          <p>
            The vast majority of utilities on DevTol (such as JWT Parser, Base64 Converter, JSON Viewer, UUID Generator, Hashing utilities, and financial calculators) operate <strong>entirely client-side within your browser</strong>. 
          </p>
          <ul class="list-disc pl-5 mt-2 space-y-1">
            <li>Your input data, secrets, tokens, hashes, and text payloads are <strong>never transmitted</strong> to our web servers.</li>
            <li>Computations, conversions, and cryptographic operations are executed locally using your device's web browser JavaScript engine and Web Crypto API.</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">3. Google AdSense & Third-Party Advertising</h2>
          <p>
            We use third-party advertising services, including <strong>Google AdSense</strong>, to serve advertisements when you visit our website. Google and other certified third-party ad networks use cookies to serve ads based on your prior visits to our website or other websites across the Internet.
          </p>
          <div class="bg-slate-50 dark:bg-neutral-800/60 p-4 rounded-lg border border-slate-200 dark:border-neutral-700 mt-3">
            <h3 class="font-semibold text-amber-400 mb-1">Google DART Cookie Notice</h3>
            <p class="text-sm">
              Google's use of advertising cookies (including the DoubleClick DART cookie) enables it and its partners to serve targeted ads to users based on their visits to our site and/or other sites on the Internet.
            </p>
            <p class="text-sm mt-2">
              Users may opt out of personalized advertising by visiting the 
              <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">Google Ads Settings</a> page. Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting 
              <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">aboutads.info</a>.
            </p>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">4. Cookies & Web Beacons</h2>
          <p>
            A cookie is a small text file placed on your computer or mobile device when you visit a website. We use cookies and similar tracking technologies to:
          </p>
          <ul class="list-disc pl-5 mt-2 space-y-1">
            <li>Remember user preferences, such as theme settings (dark/light mode) and favorite tools via browser localStorage.</li>
            <li>Analyze aggregate site traffic and interaction metrics to offer enhanced site experiences.</li>
            <li>Deliver relevant, non-intrusive advertisements through Google AdSense and its advertising partners.</li>
          </ul>
          <p class="mt-2">
            You can choose to disable or selectively turn off cookies through your browser settings. However, disabling cookies may affect how you are able to interact with our site and other websites.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">5. GDPR Compliance (European Economic Area)</h2>
          <p>
            If you are a resident of the European Economic Area (EEA), you have specific data protection rights under the General Data Protection Regulation (GDPR). These include:
          </p>
          <ul class="list-disc pl-5 mt-2 space-y-1">
            <li><strong>The right to access</strong>: Request copies of any personal data we hold.</li>
            <li><strong>The right to rectification</strong>: Request correction of inaccurate information.</li>
            <li><strong>The right to erasure</strong>: Request that we delete your personal data under certain conditions.</li>
            <li><strong>The right to restrict or object to processing</strong>: Restrict how your personal data is handled.</li>
            <li><strong>The right to data portability</strong>: Request transfer of your data to another organization.</li>
          </ul>
          <p class="mt-2">
            Because we do not maintain accounts or store personal user records in remote databases, we process negligible personal data. Where advertising cookies are involved, we utilize Google-certified Consent Management Platforms (CMP) to collect affirmative consent.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">6. CCPA / CPRA Compliance (California Residents)</h2>
          <p>
            Under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA), California residents are afforded specific rights regarding their personal information:
          </p>
          <ul class="list-disc pl-5 mt-2 space-y-1">
            <li>The right to know what personal information is collected, disclosed, or sold.</li>
            <li>The right to request deletion of personal information.</li>
            <li>The right to opt-out of the "sale" or "sharing" of personal information for cross-context behavioral advertising.</li>
            <li>The right to non-discrimination for exercising privacy rights.</li>
          </ul>
          <p class="mt-2">
            We do not sell personal data for monetary consideration. To opt-out of cookie-based cross-context behavioral tracking, use the "Do Not Sell My Personal Information" link or configure Global Privacy Control (GPC) signals in your browser.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">7. Children's Privacy (COPPA)</h2>
          <p>
            Our service is not directed to individuals under the age of 13 (or 16 in certain jurisdictions). We do not knowingly collect personal identifiable information from children. If you believe that a child has provided us with personal data, please contact us immediately so we can promptly delete such information.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">8. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy periodically to reflect technological changes, regulatory updates, or operational adjustments. Any changes will be posted on this page with an updated "Last Updated" revision date.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">9. Contact Information</h2>
          <p>
            For questions or requests regarding this Privacy Policy or your data privacy rights, please reach out via our 
            <router-link to="/contact" class="text-primary hover:underline">Contact Us page</router-link> or email us at 
            <a href="mailto:privacy@devtol.online" class="text-primary hover:underline">privacy@devtol.online</a>.
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.legal-container {
  max-width: 900px;
  margin: 40px auto;
  padding: 0 20px 80px;
}

.legal-card {
  background: rgba(24, 24, 28, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 36px;
}

.text-primary {
  color: #10b981;
}
</style>

