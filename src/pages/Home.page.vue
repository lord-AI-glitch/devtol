<script setup lang="ts">
import {
  IconApps,
  IconCpu,
  IconDeviceLaptop,
  IconDragDrop,
  IconHeart,
  IconLock,
  IconSearch,
  IconShieldCheck,
  IconSparkles,
  IconX,
} from '@tabler/icons-vue';
import { useHead } from '@vueuse/head';
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref } from 'vue';
import ToolCard from '../components/ToolCard.vue';
import AdSenseUnit from '../components/AdSenseUnit.vue';
import HomeEditorialGuide from '../components/HomeEditorialGuide.vue';
import { useToolStore } from '@/tools/tools.store';

const Draggable = defineAsyncComponent(() => import('vuedraggable'));

const toolStore = useToolStore();

const { t, locale } = useI18n();

const homeSeoTitle = computed(() => {
  if (locale.value === 'ar') {
    return 'DevTol — أدوات PDF مجانية وخاصة وأدوات المطورين (محلي 100%)';
  }
  return 'DevTol — Free Private PDF Tools & Developer Toolbox | 100% Client-Side';
});

const homeSeoDesc = computed(() => {
  if (locale.value === 'ar') {
    return 'أدوات PDF خاصة ومجانية — تعديل وOCR مع دعم كامل للعربية، إلى جانب الدمج والتقسيم والضغط — ضمن 122 أداة للمطورين (JSON وBase64 وRegex وJWT والتشفير)، كلها تعمل داخل متصفحك. ملفاتك لا تغادر جهازك.';
  }
  return 'Free private PDF tools — edit, merge, split, compress, OCR with Arabic support — plus JSON, Base64, Regex, JWT and crypto. 122 tools, 100% in your browser; files never leave your device.';
});

const homeCanonical = computed(() => {
  return locale.value === 'ar' ? 'https://devtol.online/ar' : 'https://devtol.online/';
});

useHead(computed(() => ({
  title: homeSeoTitle.value,
  meta: [
    { name: 'description', content: homeSeoDesc.value },
    { property: 'og:title', content: homeSeoTitle.value },
    { property: 'og:description', content: homeSeoDesc.value },
    { property: 'og:url', content: homeCanonical.value },
    { property: 'og:site_name', content: 'DevTol' },
    { property: 'og:locale', content: locale.value === 'ar' ? 'ar_AR' : 'en_US' },
    { name: 'twitter:title', content: homeSeoTitle.value },
    { name: 'twitter:description', content: homeSeoDesc.value },
  ],
  link: [
    { rel: 'canonical', href: homeCanonical.value },
  ],
})));

// Category and Search Filtering State
const searchQuery = ref('');
const activeCategory = ref<string>('all');

// Categories with computed tool counts
const availableCategories = computed(() => {
  const categories = [
    { id: 'all', label: t('home.categories.allTools', 'All Tools'), count: toolStore.tools.length },
  ];

  toolStore.toolsByCategory.forEach((cat) => {
    categories.push({
      id: cat.name,
      label: cat.name,
      count: cat.components.length,
    });
  });

  return categories;
});

// Filtered tools based on active category & search query
const filteredTools = computed(() => {
  let list = toolStore.tools;

  if (activeCategory.value !== 'all') {
    list = list.filter(tool => tool.category === activeCategory.value);
  }

  const query = searchQuery.value.trim().toLowerCase();
  if (query) {
    list = list.filter(tool =>
      tool.name.toLowerCase().includes(query)
      || tool.description.toLowerCase().includes(query)
      || tool.category.toLowerCase().includes(query),
    );
  }

  return list;
});

// Progressive rendering to ensure sub-second FCP/LCP.
// Only the first 24 cards mount eagerly; further cards mount in chunks of 24
// only when the user scrolls near them (IntersectionObserver on a sentinel
// below the grid). There is deliberately NO idle auto-reveal: the previous
// requestIdleCallback fallback fired at the first idle period (~1-2 s after
// load), i.e. inside the Lighthouse/TBT measurement window, mounting all 122
// cards in one long task. A non-scroller sees the first 24 until they scroll;
// search/category filters bypass visibleCount entirely (see displayedTools),
// so every tool stays findable.
const INITIAL_VISIBLE_COUNT = 24;
const REVEAL_CHUNK_SIZE = 24;
const visibleCount = ref(INITIAL_VISIBLE_COUNT);
const revealSentinel = ref<HTMLElement | null>(null);

let revealObserver: IntersectionObserver | null = null;

// Fully revealed only against the whole tool list (not the current filter):
// when a search/category filter is active, displayedTools bypasses
// visibleCount entirely, so the observer must stay connected until the
// unfiltered list is fully revealed.
const isFullyRevealed = () => visibleCount.value >= toolStore.tools.length;

function stopRevealing() {
  if (revealObserver) {
    revealObserver.disconnect();
    revealObserver = null;
  }
}

function revealMore() {
  visibleCount.value = Math.min(visibleCount.value + REVEAL_CHUNK_SIZE, filteredTools.value.length);
  if (isFullyRevealed()) {
    stopRevealing();
  }
}

onMounted(() => {
  if (typeof window === 'undefined') {
    return;
  }
  if ('IntersectionObserver' in window && revealSentinel.value) {
    revealObserver = new IntersectionObserver((entries) => {
      if (entries.some(entry => entry.isIntersecting)) {
        revealMore();
      }
    }, { rootMargin: '800px', threshold: 0 });
    revealObserver.observe(revealSentinel.value);
  }
});

onUnmounted(() => {
  stopRevealing();
});

const displayedTools = computed(() => {
  if (searchQuery.value.trim() || activeCategory.value !== 'all') {
    return filteredTools.value;
  }
  return filteredTools.value.slice(0, visibleCount.value);
});

const favoriteTools = computed(() => toolStore.favoriteTools);

function onUpdateFavoriteTools() {
  toolStore.updateFavoriteTools(favoriteTools.value);
}

// Hand-picked featured highlights for the hero section
const featuredTools = computed(() => {
  const featuredPaths = [
    '/pdf-editor',
    '/ai-token-cost-calculator',
    '/image-compressor',
    '/pdf-merge',
    '/curl-to-code-converter',
    '/token-generator',
  ];
  return toolStore.tools.filter(t => featuredPaths.includes(t.path)).slice(0, 6);
});
</script>

<template>
  <div class="home-page-container mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 sm:pt-8">
    <!-- Hero & Brand Value Proposition -->
    <section class="hero-section mb-12 text-center sm:mb-16">
      <!-- Trust Pill Badge -->
      <div class="mb-6 inline-flex items-center gap-2 border border-emerald-500/20 rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs text-emerald-600 font-semibold tracking-wide uppercase dark:text-emerald-400">
        <n-icon size="16" :component="IconShieldCheck" />
        <span>100% Client-Side &bull; Zero Server Storage &bull; Open Source</span>
      </div>

      <!-- Main Headline -->
      <h1 class="mx-auto max-w-4xl text-3xl text-slate-900 font-extrabold leading-tight tracking-tight lg:text-6xl sm:text-5xl dark:text-white sm:leading-tight">
        {{ $t('home.hero.title') }}
      </h1>

      <!-- Detailed Explanatory Subtitle -->
      <p class="mx-auto mt-4 max-w-2xl text-base text-slate-600 font-normal leading-relaxed sm:mt-6 sm:text-xl dark:text-slate-300">
        {{ $t('home.hero.description') }}
      </p>

      <!-- Trust Metrics Bar -->
      <div class="grid grid-cols-2 mx-auto mt-8 max-w-3xl gap-4 border border-slate-200/80 rounded-2xl bg-slate-100/80 px-6 py-4 backdrop-blur-sm sm:grid-cols-4 sm:mt-10 dark:border-slate-700/60 dark:bg-slate-800/50">
        <div class="text-center">
          <div class="text-2xl text-indigo-600 font-bold sm:text-3xl dark:text-indigo-400">
            122
          </div>
          <div class="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Built-in Utilities
          </div>
        </div>
        <div class="text-center">
          <div class="text-2xl text-emerald-600 font-bold sm:text-3xl dark:text-emerald-400">
            0 ms
          </div>
          <div class="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Server Latency
          </div>
        </div>
        <div class="text-center">
          <div class="text-2xl text-amber-600 font-bold sm:text-3xl dark:text-amber-400">
            100%
          </div>
          <div class="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Private & Local
          </div>
        </div>
        <div class="text-center">
          <div class="text-2xl text-purple-600 font-bold sm:text-3xl dark:text-purple-400">
            PWA
          </div>
          <div class="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Offline Capable
          </div>
        </div>
      </div>

      <!-- In-Page Live Interactive Search Bar -->
      <div class="mx-auto mt-10 max-w-2xl">
        <div class="relative flex items-center">
          <n-icon :component="IconSearch" size="20" class="pointer-events-none absolute left-4 text-slate-400" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('home.hero.searchPlaceholder')"
            class="w-full border border-slate-200 rounded-xl bg-white py-3.5 pl-12 pr-10 text-sm text-slate-900 shadow-sm transition dark:border-slate-700 focus:border-transparent dark:bg-slate-800/90 sm:py-4 sm:text-base dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
          <button
            v-if="searchQuery"
            class="absolute right-3 cursor-pointer rounded-full p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            @click="searchQuery = ''"
          >
            <n-icon :component="IconX" size="18" />
          </button>
        </div>
      </div>

      <!-- Interactive Category Filter Pills -->
      <div class="mx-auto mt-6 max-w-4xl flex flex-wrap items-center justify-center gap-2">
        <button
          v-for="cat in availableCategories"
          :key="cat.id"
          class="inline-flex cursor-pointer items-center gap-1.5 border rounded-full px-3.5 py-1.5 text-xs font-medium transition"
          :class="[
            activeCategory === cat.id
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600',
          ]"
          @click="activeCategory = cat.id"
        >
          <span>{{ cat.label }}</span>
          <span
            class="rounded-full px-1.5 py-0.2 text-[10px]"
            :class="activeCategory === cat.id ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'"
          >{{ cat.count }}</span>
        </button>
      </div>
    </section>

    <!-- Why DevTol? Core Architectural Pillars (Only shown when not actively filtering) -->
    <section v-if="!searchQuery && activeCategory === 'all'" class="mb-14">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div class="shadow-xs border border-slate-200/80 rounded-2xl bg-white p-6 dark:border-slate-700/60 dark:bg-slate-800/60">
          <div class="mb-4 h-12 w-12 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
            <n-icon size="24" :component="IconLock" />
          </div>
          <h3 class="mb-2 text-lg text-slate-900 font-bold dark:text-white">
            {{ $t('home.pillars.privacyTitle') }}
          </h3>
          <p class="text-sm text-slate-600 leading-relaxed dark:text-slate-300">
            {{ $t('home.pillars.privacyDesc') }}
          </p>
        </div>

        <div class="shadow-xs border border-slate-200/80 rounded-2xl bg-white p-6 dark:border-slate-700/60 dark:bg-slate-800/60">
          <div class="mb-4 h-12 w-12 flex items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
            <n-icon size="24" :component="IconCpu" />
          </div>
          <h3 class="mb-2 text-lg text-slate-900 font-bold dark:text-white">
            {{ $t('home.pillars.speedTitle') }}
          </h3>
          <p class="text-sm text-slate-600 leading-relaxed dark:text-slate-300">
            {{ $t('home.pillars.speedDesc') }}
          </p>
        </div>

        <div class="shadow-xs border border-slate-200/80 rounded-2xl bg-white p-6 dark:border-slate-700/60 dark:bg-slate-800/60">
          <div class="mb-4 h-12 w-12 flex items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
            <n-icon size="24" :component="IconDeviceLaptop" />
          </div>
          <h3 class="mb-2 text-lg text-slate-900 font-bold dark:text-white">
            {{ $t('home.pillars.frictionlessTitle') }}
          </h3>
          <p class="text-sm text-slate-600 leading-relaxed dark:text-slate-300">
            {{ $t('home.pillars.frictionlessDesc') }}
          </p>
        </div>
      </div>
    </section>

    <!-- Popular & Essential Tools Showcase (Default view) -->
    <section v-if="!searchQuery && activeCategory === 'all' && featuredTools.length > 0" class="mb-14">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="flex items-center gap-2 text-xl text-slate-900 font-bold dark:text-white">
          <n-icon :component="IconSparkles" class="text-amber-500" />
          <span>{{ $t('home.categories.featuredTools') }}</span>
        </h2>
      </div>
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-3 sm:grid-cols-2">
        <ToolCard v-for="tool in featuredTools" :key="tool.name" :tool="tool" />
      </div>
    </section>

    <!-- User Favorites Section -->
    <section v-if="toolStore.favoriteTools.length > 0" class="mb-14">
      <h2 class="mb-4 flex items-center gap-2 text-xl text-slate-900 font-bold dark:text-white">
        <n-icon :component="IconHeart" class="text-rose-500" />
        <span>{{ $t('home.categories.favoriteTools') }}</span>
        <c-tooltip :tooltip="$t('home.categories.favoritesDndToolTip')">
          <n-icon :component="IconDragDrop" size="18" class="cursor-grab text-slate-400" />
        </c-tooltip>
      </h2>
      <Draggable
        :list="favoriteTools"
        class="grid grid-cols-1 gap-4 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2"
        ghost-class="ghost-favorites-draggable"
        item-key="name"
        @end="onUpdateFavoriteTools"
      >
        <template #item="{ element: tool }">
          <ToolCard :tool="tool" />
        </template>
      </Draggable>
    </section>

    <!-- Newest Tools Section -->
    <section v-if="!searchQuery && activeCategory === 'all' && toolStore.newTools.length > 0" class="mb-14">
      <h2 class="mb-4 flex items-center gap-2 text-xl text-slate-900 font-bold dark:text-white">
        <n-icon :component="IconSparkles" class="text-indigo-500" />
        <span>{{ t('home.categories.newestTools') }}</span>
      </h2>
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2">
        <ToolCard v-for="tool in toolStore.newTools" :key="tool.name" :tool="tool" />
      </div>
    </section>

    <!-- Mid-Page AdSense Compliance Unit -->
    <div class="my-10">
      <AdSenseUnit format="horizontal" min-height="110px" />
    </div>

    <!-- Filtered / All Tools Directory -->
    <section class="tools-directory">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h2 class="flex items-center gap-2 text-xl text-slate-900 font-bold dark:text-white">
            <n-icon :component="IconApps" class="text-indigo-500" />
            <span v-if="searchQuery">Search Results for "{{ searchQuery }}" ({{ displayedTools.length }})</span>
            <span v-else-if="activeCategory !== 'all'">{{ activeCategory }} ({{ displayedTools.length }})</span>
            <span v-else>{{ $t('home.categories.allTools') }} ({{ toolStore.tools.length }})</span>
          </h2>
          <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Instant client-side execution in your local sandbox
          </p>
        </div>

        <button
          v-if="searchQuery || activeCategory !== 'all'"
          class="cursor-pointer text-xs text-indigo-600 font-medium dark:text-indigo-400 hover:underline"
          @click="searchQuery = ''; activeCategory = 'all'"
        >
          Reset Filters
        </button>
      </div>

      <!-- No Results Empty State -->
      <div v-if="displayedTools.length === 0" class="border border-slate-300 rounded-2xl border-dashed bg-slate-50 px-4 py-16 text-center dark:border-slate-700 dark:bg-slate-800/40">
        <n-icon :component="IconSearch" size="36" class="mx-auto mb-3 text-slate-400" />
        <h3 class="text-base text-slate-900 font-semibold dark:text-white">
          No tools found matching your criteria
        </h3>
        <p class="mx-auto mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          Try searching for a different keyword or format (e.g., PDF, Base64, Token, Format, JSON).
        </p>
        <button
          class="mt-4 cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-xs text-white font-medium transition hover:bg-indigo-700"
          @click="searchQuery = ''; activeCategory = 'all'"
        >
          Clear search & show all tools
        </button>
      </div>

      <!-- Tools Grid -->
      <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2">
        <ToolCard v-for="tool in displayedTools" :key="tool.name" :tool="tool" />
      </div>

      <!-- Scroll sentinel for chunked reveal (0-height, no layout impact) -->
      <div ref="revealSentinel" aria-hidden="true" />
    </section>

    <!-- Bottom AdSense Compliance Unit -->
    <div class="mt-14 pb-4">
      <AdSenseUnit format="horizontal" min-height="110px" />
    </div>

    <!-- Editorial Architecture & Standards Knowledge Base -->
    <HomeEditorialGuide />
  </div>
</template>

<style scoped>
.ghost-favorites-draggable {
  opacity: 0.4;
  background-color: #e2e8f0;
  border: 2px dashed #64748b;
  border-radius: 1rem;
}
</style>
