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
import { computed, defineAsyncComponent, onMounted, ref } from 'vue';
import ToolCard from '../components/ToolCard.vue';
import AdSenseUnit from '../components/AdSenseUnit.vue';
import { useToolStore } from '@/tools/tools.store';
import { config } from '@/config';

const Draggable = defineAsyncComponent(() => import('vuedraggable'));

const toolStore = useToolStore();

useHead({
  title: 'DevTol — All-in-One Local Toolbox for Developers & Designers',
  meta: [
    {
      name: 'description',
      content: '126+ secure, client-side online tools for developers and designers. PDF tools, image converters, cryptography, code formatters, and network utilities running 100% locally in your browser.',
    },
  ],
});

const { t, locale } = useI18n();

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

// Progressive rendering to ensure sub-second FCP/LCP
const INITIAL_VISIBLE_COUNT = 24;
const visibleCount = ref(INITIAL_VISIBLE_COUNT);

onMounted(() => {
  if (typeof window !== 'undefined') {
    const revealAll = () => {
      visibleCount.value = toolStore.tools.length;
    };
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(revealAll, { timeout: 1200 });
    } else {
      setTimeout(revealAll, 50);
    }
  }
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
    '/json-to-typescript',
    '/curl-to-code-converter',
    '/token-generator',
  ];
  return toolStore.tools.filter(t => featuredPaths.includes(t.path)).slice(0, 6);
});
</script>

<template>
  <div class="home-page-container pt-4 sm:pt-8 pb-16 max-w-7xl mx-auto px-4 sm:px-6">
    <!-- Hero & Brand Value Proposition -->
    <section class="hero-section text-center mb-12 sm:mb-16">
      <!-- Trust Pill Badge -->
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-6">
        <n-icon size="16" :component="IconShieldCheck" />
        <span>100% Client-Side &bull; Zero Server Storage &bull; Open Source</span>
      </div>

      <!-- Main Headline -->
      <h1 class="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
        {{ $t('home.hero.title') }}
      </h1>

      <!-- Detailed Explanatory Subtitle -->
      <p class="mt-4 sm:mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
        {{ $t('home.hero.description') }}
      </p>

      <!-- Trust Metrics Bar -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto mt-8 sm:mt-10 py-4 px-6 rounded-2xl bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 backdrop-blur-sm">
        <div class="text-center">
          <div class="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400">126+</div>
          <div class="text-xs text-slate-500 dark:text-slate-400 mt-1">Built-in Utilities</div>
        </div>
        <div class="text-center">
          <div class="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">0 ms</div>
          <div class="text-xs text-slate-500 dark:text-slate-400 mt-1">Server Latency</div>
        </div>
        <div class="text-center">
          <div class="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">100%</div>
          <div class="text-xs text-slate-500 dark:text-slate-400 mt-1">Private & Local</div>
        </div>
        <div class="text-center">
          <div class="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">PWA</div>
          <div class="text-xs text-slate-500 dark:text-slate-400 mt-1">Offline Capable</div>
        </div>
      </div>

      <!-- In-Page Live Interactive Search Bar -->
      <div class="mt-10 max-w-2xl mx-auto">
        <div class="relative flex items-center">
          <n-icon :component="IconSearch" size="20" class="absolute left-4 text-slate-400 pointer-events-none" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('home.hero.searchPlaceholder')"
            class="w-full pl-12 pr-10 py-3.5 sm:py-4 rounded-xl text-sm sm:text-base bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          >
          <button
            v-if="searchQuery"
            class="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            @click="searchQuery = ''"
          >
            <n-icon :component="IconX" size="18" />
          </button>
        </div>
      </div>

      <!-- Interactive Category Filter Pills -->
      <div class="flex items-center justify-center flex-wrap gap-2 mt-6 max-w-4xl mx-auto">
        <button
          v-for="cat in availableCategories"
          :key="cat.id"
          class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer border"
          :class="[
            activeCategory === cat.id
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
          ]"
          @click="activeCategory = cat.id"
        >
          <span>{{ cat.label }}</span>
          <span
            class="px-1.5 py-0.2 rounded-full text-[10px]"
            :class="activeCategory === cat.id ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'"
          >{{ cat.count }}</span>
        </button>
      </div>
    </section>

    <!-- Why DevTol? Core Architectural Pillars (Only shown when not actively filtering) -->
    <section v-if="!searchQuery && activeCategory === 'all'" class="mb-14">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="p-6 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-500 mb-4">
            <n-icon size="24" :component="IconLock" />
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">
            {{ $t('home.pillars.privacyTitle') }}
          </h3>
          <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {{ $t('home.pillars.privacyDesc') }}
          </p>
        </div>

        <div class="p-6 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-500/10 text-indigo-500 mb-4">
            <n-icon size="24" :component="IconCpu" />
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">
            {{ $t('home.pillars.speedTitle') }}
          </h3>
          <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {{ $t('home.pillars.speedDesc') }}
          </p>
        </div>

        <div class="p-6 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-500/10 text-purple-500 mb-4">
            <n-icon size="24" :component="IconDeviceLaptop" />
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">
            {{ $t('home.pillars.frictionlessTitle') }}
          </h3>
          <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {{ $t('home.pillars.frictionlessDesc') }}
          </p>
        </div>
      </div>
    </section>

    <!-- Popular & Essential Tools Showcase (Default view) -->
    <section v-if="!searchQuery && activeCategory === 'all' && featuredTools.length > 0" class="mb-14">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <n-icon :component="IconSparkles" class="text-amber-500" />
          <span>{{ $t('home.categories.featuredTools') }}</span>
        </h2>
      </div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ToolCard v-for="tool in featuredTools" :key="tool.name" :tool="tool" />
      </div>
    </section>

    <!-- User Favorites Section -->
    <section v-if="toolStore.favoriteTools.length > 0" class="mb-14">
      <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <n-icon :component="IconHeart" class="text-rose-500" />
        <span>{{ $t('home.categories.favoriteTools') }}</span>
        <c-tooltip :tooltip="$t('home.categories.favoritesDndToolTip')">
          <n-icon :component="IconDragDrop" size="18" class="text-slate-400 cursor-grab" />
        </c-tooltip>
      </h2>
      <Draggable
        :list="favoriteTools"
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
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
      <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <n-icon :component="IconSparkles" class="text-indigo-500" />
        <span>{{ t('home.categories.newestTools') }}</span>
      </h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <ToolCard v-for="tool in toolStore.newTools" :key="tool.name" :tool="tool" />
      </div>
    </section>

    <!-- Mid-Page AdSense Compliance Unit -->
    <div class="my-10">
      <AdSenseUnit format="horizontal" min-height="110px" />
    </div>

    <!-- Filtered / All Tools Directory -->
    <section class="tools-directory">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <n-icon :component="IconApps" class="text-indigo-500" />
            <span v-if="searchQuery">Search Results for "{{ searchQuery }}" ({{ displayedTools.length }})</span>
            <span v-else-if="activeCategory !== 'all'">{{ activeCategory }} ({{ displayedTools.length }})</span>
            <span v-else>{{ $t('home.categories.allTools') }} ({{ toolStore.tools.length }})</span>
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Instant client-side execution in your local sandbox
          </p>
        </div>

        <button
          v-if="searchQuery || activeCategory !== 'all'"
          class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-medium"
          @click="searchQuery = ''; activeCategory = 'all'"
        >
          Reset Filters
        </button>
      </div>

      <!-- No Results Empty State -->
      <div v-if="displayedTools.length === 0" class="text-center py-16 px-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
        <n-icon :component="IconSearch" size="36" class="text-slate-400 mx-auto mb-3" />
        <h3 class="text-base font-semibold text-slate-900 dark:text-white">No tools found matching your criteria</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          Try searching for a different keyword or format (e.g., PDF, Base64, Token, Format, JSON).
        </p>
        <button
          class="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition cursor-pointer"
          @click="searchQuery = ''; activeCategory = 'all'"
        >
          Clear search & show all tools
        </button>
      </div>

      <!-- Tools Grid -->
      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <ToolCard v-for="tool in displayedTools" :key="tool.name" :tool="tool" />
      </div>
    </section>

    <!-- Bottom AdSense Compliance Unit -->
    <div class="mt-14 pb-4">
      <AdSenseUnit format="horizontal" min-height="110px" />
    </div>
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
