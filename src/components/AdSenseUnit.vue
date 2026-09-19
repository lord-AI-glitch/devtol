<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useStyleStore } from '@/stores/style.store';

interface Props {
  slotId?: string;
  adClient?: string;
  format?: 'horizontal' | 'rectangle' | 'vertical' | 'responsive';
  minHeight?: string;
}

const props = withDefaults(defineProps<Props>(), {
  slotId: '1234567890',
  adClient: 'ca-pub-3672531286921744',
  format: 'horizontal',
  minHeight: '120px',
});

const styleStore = useStyleStore();
const isDark = computed(() => styleStore.isDarkTheme);

const adContainerRef = ref<HTMLElement | null>(null);
const isAdLoaded = ref(false);
const showFallback = ref(false);

// Curated high-converting developer partner offers
const developerOffers = [
  {
    tag: 'Cloud Infrastructure',
    title: 'DigitalOcean Cloud — $200 Free Credit for Developers',
    description: 'Deploy Linux droplets, managed databases, and scalable serverless functions in 60 seconds.',
    cta: 'Claim $200 Credit',
    link: 'https://m.do.co/c/devtol',
    badge: 'Popular for DevOps',
  },
  {
    tag: 'Web Performance & Security',
    title: 'Cloudflare Pages & Workers — Global Edge Platform',
    description: 'Ultra-fast global CDN, DDoS mitigation, and serverless edge compute with zero cold starts.',
    cta: 'Explore Cloudflare',
    link: 'https://www.cloudflare.com',
    badge: 'Trusted by DevTol',
  },
  {
    tag: 'Domain & SSL',
    title: 'Namecheap — .COM & Developer Domains from $5.98',
    description: 'Secure your brand with free lifetime WHOIS privacy, DNSSEC, and enterprise-grade DNS.',
    cta: 'Find Your Domain',
    link: 'https://www.namecheap.com',
    badge: 'Best Value',
  },
  {
    tag: 'Privacy & Security',
    title: 'NordVPN — Encrypted Traffic & Geo-Routing for Developers',
    description: 'Protect your remote development, test global endpoints, and prevent DNS leaks with zero-logging privacy.',
    cta: 'Get 70% Off + 3 Mo',
    link: 'https://nordvpn.com',
    badge: 'Privacy Choice',
  },
  {
    tag: 'Support Open Source',
    title: 'Support DevTol — 100% Free, Private Developer Tools',
    description: 'Help us maintain server infrastructure and add more zero-tracking client-side utilities.',
    cta: 'Buy Us a Coffee',
    link: 'https://buymeacoffee.com/lordrealstx',
    badge: 'Community',
  },
];

// Pick an offer based on a deterministic random rotation
const selectedOffer = ref(developerOffers[Math.floor(Math.random() * developerOffers.length)]);

onMounted(() => {
  try {
    // @ts-expect-error window.adsbygoogle
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch (_) {
    // AdBlock or network block detected immediately
    showFallback.value = true;
  }

  // Check if AdSense successfully rendered an iframe within 2.2 seconds
  setTimeout(() => {
    if (adContainerRef.value) {
      const insEl = adContainerRef.value.querySelector('ins.adsbygoogle');
      const hasIframe = insEl && (insEl.querySelector('iframe') || insEl.getAttribute('data-ad-status') === 'filled');
      if (hasIframe) {
        isAdLoaded.value = true;
      } else {
        // Either ad blocked or no fill -> seamlessly show developer partner offer
        showFallback.value = true;
      }
    } else {
      showFallback.value = true;
    }
  }, 2200);
});

// Preset styles to eliminate Cumulative Layout Shift (CLS = 0)
const formatStyles = computed(() => {
  switch (props.format) {
    case 'rectangle':
      return { minHeight: '280px', maxWidth: '336px' };
    case 'vertical':
      return { minHeight: '600px', maxWidth: '300px' };
    case 'horizontal':
    case 'responsive':
    default:
      return { minHeight: props.minHeight, maxWidth: '100%' };
  }
});
</script>

<template>
  <div
    ref="adContainerRef"
    class="adsense-unit-wrapper relative w-full overflow-hidden my-4 transition-all duration-300"
    :style="formatStyles"
    role="region"
    aria-label="Sponsored Content"
  >
    <!-- 1. Google AdSense Unit (Visible when ads load normally) -->
    <div v-show="!showFallback" class="w-full">
      <ins
        class="adsbygoogle w-full"
        style="display:block"
        :data-ad-client="adClient"
        :data-ad-slot="slotId"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>

    <!-- 2. High-Yield Native Developer Partner Card (Fallback for AdBlock / Unfilled) -->
    <div
      v-if="showFallback"
      class="fallback-sponsor-card w-full rounded-xl border p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
      :class="isDark ? 'border-emerald-500/20 bg-[#121629] text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-800'"
    >
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1.5 flex-wrap">
          <span
            class="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
            :class="isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'"
          >
            {{ selectedOffer.badge }}
          </span>
          <span class="text-xs text-slate-400 font-mono">Sponsored • {{ selectedOffer.tag }}</span>
          <RouterLink
            to="/deals"
            class="text-[11px] font-semibold text-emerald-500 hover:text-emerald-400 ms-auto transition-colors"
          >
            All Perks & Deals →
          </RouterLink>
        </div>
        <h4 class="text-sm sm:text-base font-bold tracking-tight mb-1 text-inherit truncate">
          {{ selectedOffer.title }}
        </h4>
        <p class="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">
          {{ selectedOffer.description }}
        </p>
      </div>

      <div class="shrink-0 w-full sm:w-auto">
        <a
          :href="selectedOffer.link"
          target="_blank"
          rel="noopener sponsored"
          class="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all shadow-sm"
          :class="isDark ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20' : 'bg-emerald-600 hover:bg-emerald-700 text-white'"
        >
          {{ selectedOffer.cta }}
          <svg class="w-3.5 h-3.5 ms-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.adsense-unit-wrapper {
  contain: layout paint;
}
.fallback-sponsor-card {
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.1);
}
</style>
