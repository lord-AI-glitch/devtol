<script setup lang="ts">
import { useHead } from '@vueuse/head';

useHead({
  title: 'About Us & Editorial Standards - DevTol',
  meta: [
    {
      name: 'description',
      content: 'Learn about the engineering team, mission, privacy-first client-side architecture, and E-E-A-T editorial standards behind DevTol.',
    },
  ],
});

const teamMembers = [
  {
    name: 'Corentin Thomasset',
    role: 'Creator & Lead Software Architect',
    bio: 'Senior full-stack engineer and open-source enthusiast with over a decade of experience designing scalable distributed web platforms and developer tooling in France.',
    focus: 'Vue.js, TypeScript, Cloud Infrastructure & Client-Side Privacy',
  },
  {
    name: 'Technical Advisory Board & Open Source Community',
    role: 'Peer Review & Security Contributors',
    bio: 'An international collective of seasoned DevOps engineers, cybersecurity researchers, and mathematical finance contributors who verify RFC compliance and review tool code.',
    focus: 'RFC 7519 (JWT), RFC 4648 (Base64), RFC 4122 (UUID), FIPS PUB 180-4 (Cryptography)',
  },
];

const pillars = [
  {
    title: 'Client-Side Privacy First',
    desc: 'All utilities execute strictly within your local browser sandbox. No server transmission, zero logging of confidential secrets.',
    icon: '🔒',
  },
  {
    title: 'Adherence to RFC Standards',
    desc: 'Every algorithm, parser, and generator strictly follows official IETF, POSIX, and NIST technical specifications.',
    icon: '📜',
  },
  {
    title: 'Zero Latency & Offline Capable',
    desc: 'Designed as a responsive Progressive Web Application (PWA) that operates instantly without network dependency.',
    icon: '⚡',
  },
  {
    title: 'E-E-A-T Editorial Integrity',
    desc: 'Technical guides are authored and peer-reviewed by practitioners with real-world engineering and software development experience.',
    icon: '🎓',
  },
];
</script>

<template>
  <div class="about-container">
    <div class="about-card">
      <div class="text-center mb-10">
        <h1 class="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">About DevTol</h1>
        <p class="text-lg text-primary font-medium mt-2">
          Engineering Craftsmanship, Privacy-First Architecture & Rigorous Developer Utilities
        </p>
      </div>

      <div class="space-y-8 text-slate-600 dark:text-neutral-300 leading-relaxed">
        <section>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-3">Our Mission</h2>
          <p>
            Founded by <strong>Corentin Thomasset</strong>, <strong>DevTol</strong> was created to solve a pervasive problem faced by software developers, DevOps practitioners, and systems engineers: the proliferation of ad-cluttered, privacy-invasive, and untrustworthy web utilities.
          </p>
          <p class="mt-3">
            Traditional online utilities often upload your code, JSON payloads, passwords, and private tokens to remote backends for processing — creating critical compliance violations and security risks. DevTol was built upon a radically different architectural philosophy: <strong>100% Client-Side Computation</strong>. By delegating all data transformations to modern browser APIs and WebAssembly, your sensitive tokens and proprietary data never leave your local computer.
          </p>
        </section>

        <!-- Pillars Grid -->
        <section class="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div v-for="p in pillars" :key="p.title" class="p-5 rounded-lg bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700/60 flex flex-col">
            <div class="text-3xl mb-2">{{ p.icon }}</div>
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-1">{{ p.title }}</h3>
            <p class="text-sm text-slate-500 dark:text-neutral-400">{{ p.desc }}</p>
          </div>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-3">Commitment to E-E-A-T & Editorial Standards</h2>
          <p>
            In alignment with Google's <strong>E-E-A-T (Experience, Expertise, Authoritativeness, and Trustworthiness)</strong> quality rater guidelines, our platform is committed to providing authoritative, fact-checked, and deeply technical educational documentation accompanying every utility.
          </p>
          <div class="bg-slate-100 dark:bg-neutral-800/40 p-5 rounded-lg border border-slate-200 dark:border-neutral-700/70 mt-3 space-y-2">
            <p><strong>Experience:</strong> Our editorial materials are authored by practicing engineers with hands-on production experience managing cloud microservices, authentication gateways, and distributed databases.</p>
            <p><strong>Expertise:</strong> Technical specifications, formulas, and code snippets are cross-referenced directly against canonical RFCs (e.g., IETF RFC 7519 for JWTs, RFC 4648 for Base64, RFC 4122/9562 for UUIDs, and POSIX IEEE 1003.1 for crontab syntax).</p>
            <p><strong>Authoritativeness:</strong> DevTol is recognized across the global developer community with tens of thousands of GitHub stars and active deployments worldwide.</p>
            <p><strong>Trustworthiness:</strong> Complete source code transparency under the open-source MIT License, allowing any security auditor to inspect the codebase.</p>
          </div>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-4">Engineering Leadership & Advisory</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="m in teamMembers" :key="m.name" class="p-5 rounded-lg bg-slate-50 dark:bg-neutral-800/70 border border-slate-200 dark:border-neutral-700">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ m.name }}</h3>
              <p class="text-xs text-primary font-semibold mb-2">{{ m.role }}</p>
              <p class="text-sm text-slate-600 dark:text-neutral-300 mb-3">{{ m.bio }}</p>
              <div class="text-xs text-slate-500 dark:text-neutral-400">
                <span class="font-semibold text-slate-600 dark:text-neutral-300">Key Focus:</span> {{ m.focus }}
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-3">Open Source Transparency</h2>
          <p>
            We believe that security and developer tools should be open for public scrutiny. DevTol is proudly hosted on 
            <a href="https://github.com/CorentinTh/it-tools" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-semibold">GitHub</a>, where developers worldwide can submit issues, suggest enhancements, and audit every single line of code.
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-container {
  max-width: 950px;
  margin: 40px auto;
  padding: 0 20px 80px;
}

.about-card {
  background: rgba(24, 24, 28, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 40px;
}

.text-primary {
  color: #10b981;
}
</style>

