<script setup lang="ts">
import { useHead } from '@vueuse/head';

useHead({
  title: 'Terms of Service - DevTool.it',
  meta: [
    {
      name: 'description',
      content: 'Terms of Service for DevTool.it web utilities, including financial calculation disclaimers, intellectual property, and liability limitations.',
    },
  ],
});
</script>

<template>
  <div class="legal-container">
    <div class="legal-card">
      <h1 class="text-3xl font-bold mb-4 text-primary">Terms of Service</h1>
      <p class="text-sm text-slate-500 dark:text-neutral-400 mb-6">Effective Date: September 11, 2026</p>

      <div class="space-y-6 text-slate-600 dark:text-neutral-300 leading-relaxed">
        <section>
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">1. Agreement to Terms</h2>
          <p>
            By accessing or using the website and developer utilities hosted on <strong>DevTool.it</strong> ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you must discontinue use of the Service immediately.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">2. Permitted Use & Acceptable Conduct</h2>
          <p>
            DevTool.it provides open-source, client-side web utilities designed for software engineers, systems administrators, webmasters, and digital professionals. You agree to use the Service only for lawful purposes. You agree NOT to:
          </p>
          <ul class="list-disc pl-5 mt-2 space-y-1">
            <li>Attempt to disrupt, overwhelm, or compromise the availability of our web infrastructure through distributed denial-of-service (DDoS) attacks.</li>
            <li>Use automated bots or scrapers to extract or manipulate ad inventory or generate fraudulent clicks on third-party advertisements.</li>
            <li>Decompile, reverse-engineer, or attempt to compromise client-side cryptographic modules beyond open-source license permissions.</li>
          </ul>
        </section>

        <section>
          <div class="bg-amber-950/40 border border-amber-500/50 p-5 rounded-lg">
            <h2 class="text-xl font-semibold text-amber-300 mb-2">
              3. Crucial Financial & Mathematical Disclaimer
            </h2>
            <p class="text-sm text-slate-700 dark:text-neutral-200">
              <strong>NOT FINANCIAL, INVESTMENT, TAX, OR LEGAL ADVICE:</strong> 
              The financial utilities available on DevTool.itâ€”including the <em>Mortgage Calculator</em>, <em>Compound Interest Calculator</em>, and <em>AdSense Revenue Calculator</em>â€”are provided strictly for <strong>general informational and educational purposes only</strong>.
            </p>
            <ul class="list-disc pl-5 mt-3 space-y-2 text-sm text-slate-600 dark:text-neutral-300">
              <li>
                <strong>Theoretical Projections Only</strong>: All calculations, projections, amortizations, and revenue estimates are mathematical simulations based upon variables entered solely by the user. Real-world results will inevitably vary due to fluctuating interest rates, lender closing fees, amortization conventions, local tax ordinances, currency fluctuations, real-time programmatic ad auctions, and ad-blocker penetration rates.
              </li>
              <li>
                <strong>No Professional Fiduciary Duty</strong>: DevTool.it, its authors, contributors, and maintainers are not certified financial planners (CFP), registered investment advisors (RIA), licensed mortgage loan officers, certified public accountants (CPA), or attorneys. No fiduciary or advisory relationship is established through your use of these tools.
              </li>
              <li>
                <strong>Mandatory Professional Consultation</strong>: You must consult a qualified, licensed financial advisor, mortgage broker, or accountant before making significant financial commitments, signing mortgage agreements, or making capital investment decisions.
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">4. Technical & Cryptographic Tools Disclaimer</h2>
          <p>
            While our development tools (including JWT parsers, Base64 converters, UUID generators, and cryptographic hashing tools) adhere to modern RFC standards (such as RFC 7519, RFC 4648, and RFC 4122), they are provided "AS IS" without warranty of any kind. 
          </p>
          <p class="mt-2">
            Users are advised not to paste high-security corporate private keys, production master secrets, or unencrypted personally identifiable information (PII) into any web-based environment regardless of whether processing occurs client-side.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">5. Intellectual Property & Open Source Licensing</h2>
          <p>
            The software source code of DevTool.it is released under the MIT Open Source License. The proprietary trademarks, logos, domain names, distinctive site design, and educational technical editorial articles remain the intellectual property of DevTool.it and its content creators.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">6. Limitation of Liability</h2>
          <p>
            TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL DevTool.it, ITS CONTRIBUTORS, AUTHORS, AFFILIATES, OR PARTNERS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, FINANCIAL LOSSES, LOSS OF ANTICIPATED SAVINGS, BUSINESS INTERRUPTION, LOSS OF REVENUE, OR DATA CORRUPTION) ARISING IN ANY WAY OUT OF THE USE OF OR INABILITY TO USE THE SERVICE OR ITS CALCULATORS.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">7. Third-Party Links & Advertising</h2>
          <p>
            Our Service may display links to third-party websites or services (including advertisers via Google AdSense) that are not owned or controlled by DevTool.it. We assume no responsibility for the content, privacy policies, or practices of any third-party web properties.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">8. Governing Law & Dispute Resolution</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of France and the European Union, without regard to conflict of law principles. Any dispute arising under these Terms shall be subject to the exclusive jurisdiction of the competent courts.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">9. Modifications to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. Changes become effective immediately upon posting to this page. Your continued use of the Service following modifications indicates acceptance of the updated Terms.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">10. Contact Us</h2>
          <p>
            If you have any questions or concerns regarding these Terms of Service, please visit our 
            <router-link to="/contact" class="text-primary hover:underline">Contact Us page</router-link>.
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

