<script setup lang="ts">
import { computed } from 'vue';
import { IconCircleCheck, IconCloud, IconExternalLink, IconGift, IconShieldCheck, IconSparkles, IconWorld } from '@tabler/icons-vue';
import { useStyleStore } from '@/stores/style.store';

const styleStore = useStyleStore();
const isDark = computed(() => styleStore.isDarkTheme);

interface Deal {
  id: string
  category: string
  partner: string
  title: string
  description: string
  badge: string
  ctaText: string
  link: string
  icon: any
  featured?: boolean
}

const deals: Deal[] = [
  {
    id: 'digitalocean',
    category: 'Cloud & Infrastructure',
    partner: 'DigitalOcean',
    title: '$200 Free Cloud Credit (60 Days)',
    description: 'Deploy high-performance Linux droplets, managed databases, Kubernetes clusters, and serverless functions instantly.',
    badge: '$200 Free Credit',
    ctaText: 'Claim $200 Credit',
    link: 'https://m.do.co/c/devtol',
    icon: IconCloud,
    featured: true,
  },
  {
    id: 'cloudflare',
    category: 'Performance & Security',
    partner: 'Cloudflare',
    title: 'Enterprise Edge Network & Workers',
    description: 'Protect your web applications with industry-leading DDoS mitigation, ultra-fast global CDN, and 100k free daily edge compute invocations.',
    badge: 'Free Tier Available',
    ctaText: 'Explore Cloudflare',
    link: 'https://www.cloudflare.com',
    icon: IconShieldCheck,
    featured: true,
  },
  {
    id: 'nordvpn',
    category: 'Privacy & Security',
    partner: 'NordSecurity',
    title: 'High-Speed Privacy & Dev VPN',
    description: 'Secure your remote work, test regional geo-routing, and encrypt your developer traffic with zero-logging privacy compliance.',
    badge: 'Special Developer Discount',
    ctaText: 'Get Protected',
    link: 'https://nordvpn.com',
    icon: IconShieldCheck,
  },
  {
    id: 'namecheap',
    category: 'Domains & DNS',
    partner: 'Namecheap',
    title: '.COM & Developer Domains from $5.98',
    description: 'Register .com, .dev, or .io domains with free lifetime WHOIS privacy, enterprise Anycast DNS, and DNSSEC protection.',
    badge: 'Best Value Domains',
    ctaText: 'Find Your Domain',
    link: 'https://www.namecheap.com',
    icon: IconWorld,
  },
  {
    id: 'buymeacoffee',
    category: 'Community & Open Source',
    partner: 'DevTol Community',
    title: 'Support Free & Private Tools',
    description: 'Help us maintain server infrastructure, keep all 122 tools 100% free and client-side, and develop next-generation developer utilities.',
    badge: '100% Open Source',
    ctaText: 'Buy Us a Coffee',
    link: 'https://buymeacoffee.com/lordrealstx',
    icon: IconGift,
    featured: true,
  },
];
</script>

<template>
  <div class="deals-page" mx-auto max-w-1100px px-4 py-8>
    <!-- Header Section -->
    <div mb-10 text-center>
      <div
        mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold
        :class="isDark ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'"
      >
        <n-icon size="16" :component="IconSparkles" />
        <span>Hand-Picked Developer Deals & Credits</span>
      </div>
      <h1
        mb-3 text-3xl font-extrabold tracking-tight md:text-4xl
        :class="isDark ? 'text-white' : 'text-slate-900'"
      >
        Developer Perks & Cloud Credits
      </h1>
      <p
        mx-auto max-w-700px text-base leading-relaxed md:text-lg
        :class="isDark ? 'text-slate-400' : 'text-slate-600'"
      >
        Exclusive cloud infrastructure credits, hosting discounts, and security tools curated specifically for developers, DevOps engineers, and creators.
      </p>
    </div>

    <!-- Deals Grid -->
    <div grid grid-cols-1 gap-6 lg:grid-cols-3 md:grid-cols-2>
      <div
        v-for="deal of deals"
        :key="deal.id"
        class="deal-card relative flex flex-col justify-between border rounded-2xl p-6 transition-all duration-300 hover:shadow-lg"
        :class="[
          isDark
            ? 'bg-[#15152A] border-[#282845] hover:border-emerald-500/50'
            : 'bg-white border-slate-200 hover:border-emerald-500/50 hover:shadow-emerald-500/10',
          deal.featured ? (isDark ? 'ring-1 ring-emerald-500/30' : 'ring-1 ring-emerald-500/20') : '',
        ]"
      >
        <div>
          <!-- Card Header -->
          <div mb-4 flex items-center justify-between>
            <div flex items-center gap-3>
              <div
                flex items-center justify-center rounded-xl p-2
                :class="isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'"
              >
                <n-icon size="24" :component="deal.icon" />
              </div>
              <div>
                <span
                  text-xs font-semibold tracking-wider uppercase
                  :class="isDark ? 'text-slate-400' : 'text-slate-500'"
                >
                  {{ deal.partner }}
                </span>
              </div>
            </div>
            <span
              rounded-full px-2.5 py-1 text-xs font-bold
              :class="isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-800'"
            >
              {{ deal.badge }}
            </span>
          </div>

          <!-- Title & Description -->
          <h2 mb-2 text-lg font-bold :class="isDark ? 'text-white' : 'text-slate-900'">
            {{ deal.title }}
          </h2>
          <p mb-6 text-sm leading-relaxed :class="isDark ? 'text-slate-400' : 'text-slate-600'">
            {{ deal.description }}
          </p>
        </div>

        <!-- Card Footer / CTA -->
        <div border-t pt-4 :class="isDark ? 'border-[#282845]' : 'border-slate-100'">
          <div flex items-center justify-between>
            <div flex items-center gap-1.5 text-xs :class="isDark ? 'text-slate-400' : 'text-slate-500'">
              <n-icon size="14" :component="IconCircleCheck" text-emerald-500 />
              <span>Verified Perk</span>
            </div>
            <a
              :href="deal.link"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-200"
              :class="isDark ? 'bg-emerald-500 hover:bg-emerald-400 text-black' : 'bg-emerald-600 hover:bg-emerald-700 text-white'"
            >
              <span>{{ deal.ctaText }}</span>
              <n-icon size="14" :component="IconExternalLink" />
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Disclosure / Transparency Box -->
    <div
      mx-auto mt-12 max-w-750px border rounded-xl p-5 text-center text-xs leading-relaxed
      :class="isDark ? 'bg-[#15152A]/60 border-[#282845] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'"
    >
      <strong :class="isDark ? 'text-slate-200' : 'text-slate-700'">Transparency & Editorial Guarantee:</strong>
      All perks listed here are hand-tested tools that we use and recommend for engineering workflows. Some links may earn us an affiliate referral commission at no additional cost to you, which funds the 100% free and client-side operation of DevTol.
    </div>
  </div>
</template>

<style scoped>
.deal-card {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
}
</style>
