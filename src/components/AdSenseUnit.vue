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
  slotId: '',
  adClient: 'ca-pub-3672531286921744',
  format: 'horizontal',
  minHeight: '100px',
});

const styleStore = useStyleStore();
const isDark = computed(() => styleStore.isDarkTheme);

const adContainerRef = ref<HTMLElement | null>(null);
const isAdLoaded = ref(false);
const showFallback = ref(false);

// Platform educational highlights (replaces commercial affiliate ads during review)
const platformHighlights = [
  {
    tag: 'Enterprise Architecture',
    title: '100% Client-Side Computing & Zero-Knowledge Privacy',
    description: 'All string transformations, cryptographic hashing, and document conversions execute strictly in your local browser sandbox.',
    badge: 'Privacy Verified',
  },
  {
    tag: 'Developer Standards',
    title: 'RFC-Compliant Specifications & Cryptographic Security',
    description: 'DevTol algorithms strictly implement official IETF, NIST, and W3C specifications with zero telemetry.',
    badge: 'Standards Compliant',
  },
  {
    tag: 'Cloud-Native Tooling',
    title: 'Instant Progressive Web App: Offline Capable & Fast',
    description: 'Engineered as an offline-first PWA with zero latency, client-side memory safety, and sub-millisecond execution.',
    badge: 'Zero Latency',
  },
];

const selectedHighlight = ref(platformHighlights[Math.floor(Math.random() * platformHighlights.length)]);

onMounted(() => {
  if (props.slotId) {
    try {
      // @ts-expect-error window.adsbygoogle
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (_) {
      showFallback.value = true;
    }

    setTimeout(() => {
      if (adContainerRef.value) {
        const insEl = adContainerRef.value.querySelector('ins.adsbygoogle');
        const hasIframe = insEl && (insEl.querySelector('iframe') || insEl.getAttribute('data-ad-status') === 'filled');
        if (hasIframe) {
          isAdLoaded.value = true;
        } else {
          showFallback.value = true;
        }
      } else {
        showFallback.value = true;
      }
    }, 2200);
  } else {
    // When no slotId is assigned, rely on Auto Ads in index.html and show clean highlight
    showFallback.value = true;
  }
});

// Preset styles to eliminate Cumulative Layout Shift (CLS = 0)
const formatStyles = computed(() => {
  switch (props.format) {
    case 'rectangle':
      return { minHeight: '250px', maxWidth: '336px' };
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
    aria-label="Developer Resources"
  >
    <!-- 1. Google AdSense Unit (Visible when a real ad slot is configured and loaded) -->
    <div v-if="slotId" v-show="!showFallback" class="w-full">
      <ins
        class="adsbygoogle w-full"
        style="display:block"
        :data-ad-client="adClient"
        :data-ad-slot="slotId"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>

    <!-- 2. Clean Platform Architecture Notice (Replaces affiliate ads during AdSense review) -->
    <div
      v-if="showFallback"
      class="platform-notice-card w-full rounded-xl border p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
      :class="isDark ? 'border-indigo-500/20 bg-[#121629] text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-800'"
    >
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1.5 flex-wrap">
          <span
            class="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
            :class="isDark ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'"
          >
            {{ selectedHighlight.badge }}
          </span>
          <span class="text-xs text-slate-400 font-mono">{{ selectedHighlight.tag }}</span>
        </div>
        <h4 class="text-sm sm:text-base font-bold tracking-tight mb-1 text-inherit truncate">
          {{ selectedHighlight.title }}
        </h4>
        <p class="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">
          {{ selectedHighlight.description }}
        </p>
      </div>

      <div class="flex items-center gap-3 shrink-0">
        <RouterLink
          to="/about"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
        >
          <span>Architecture & Standards →</span>
        </RouterLink>
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
