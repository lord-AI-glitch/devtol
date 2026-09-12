<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useHead } from '@vueuse/head';
import type { HeadObject } from '@vueuse/head';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

import BaseLayout from './base.layout.vue';
import FavoriteButton from '@/components/FavoriteButton.vue';
import AdSenseUnit from '@/components/AdSenseUnit.vue';
import type { Tool } from '@/tools/tools.types';
import { useStyleStore } from '@/stores/style.store';

const route = useRoute();
const styleStore = useStyleStore();
const isDark = computed(() => styleStore.isDarkTheme);

const { t } = useI18n();

const i18nKey = computed<string>(() => route.path.trim().replace('/', ''));
const toolTitle = computed<string>(() => t(`tools.${i18nKey.value}.title`, String(route.meta.name || 'Tool')));
const rawDescription = computed<string>(() => t(`tools.${i18nKey.value}.description`, String(route.meta.description || '')));

const seoTitle = computed<string>(() => `${toolTitle.value} Online (Free & Fast) - DevTool.it`);
const seoDescription = computed<string>(() => {
  const desc = rawDescription.value || `${toolTitle.value} online utility`;
  return `${desc}. Free, secure, client-side developer tool on DevTool.it.`;
});
const canonicalUrl = computed<string>(() => `https://devtool.it.com${route.path}`);
const seoKeywords = computed<string>(() => {
  const customKeywords = (route.meta.keywords ?? []) as string[];
  const baseKeywords = [toolTitle.value.toLowerCase(), 'online tool', 'free tool', 'developer utility', 'client-side', 'devtool.it'];
  return Array.from(new Set([...customKeywords, ...baseKeywords])).join(', ');
});

const head = computed<HeadObject>(() => ({
  title: seoTitle.value,
  meta: [
    {
      name: 'description',
      content: seoDescription.value,
    },
    {
      name: 'keywords',
      content: seoKeywords.value,
    },
    {
      property: 'og:title',
      content: seoTitle.value,
    },
    {
      property: 'og:description',
      content: seoDescription.value,
    },
    {
      property: 'og:url',
      content: canonicalUrl.value,
    },
    {
      property: 'og:type',
      content: 'website',
    },
    {
      property: 'og:image',
      content: 'https://devtool.it.com/banner.png?v=2',
    },
    {
      name: 'twitter:card',
      content: 'summary_large_image',
    },
    {
      name: 'twitter:title',
      content: seoTitle.value,
    },
    {
      name: 'twitter:description',
      content: seoDescription.value,
    },
    {
      name: 'twitter:image',
      content: 'https://devtool.it.com/banner.png?v=2',
    },
  ],
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl.value,
    },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebApplication',
            '@id': `${canonicalUrl.value}#webapp`,
            'url': canonicalUrl.value,
            'name': `${toolTitle.value} Online`,
            'applicationCategory': 'DeveloperApplication',
            'operatingSystem': 'All',
            'browserRequirements': 'Requires JavaScript. Requires HTML5.',
            'description': seoDescription.value,
            'offers': {
              '@type': 'Offer',
              'price': '0',
              'priceCurrency': 'USD',
            },
          },
          {
            '@type': 'BreadcrumbList',
            '@id': `${canonicalUrl.value}#breadcrumb`,
            'itemListElement': [
              {
                '@type': 'ListItem',
                'position': 1,
                'name': 'Home',
                'item': 'https://devtool.it.com',
              },
              {
                '@type': 'ListItem',
                'position': 2,
                'name': toolTitle.value,
                'item': canonicalUrl.value,
              },
            ],
          },
        ],
      }),
    },
  ],
}));
useHead(head);

// Markdown-it engine setup with highlight.js integration
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight(str: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code class="hljs language-${lang}">${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
      } catch (_) {}
    }
    return `<pre class="hljs"><code class="hljs">${md.utils.escapeHtml(str)}</code></pre>`;
  },
});

import DomPurify from 'dompurify';

// Auto-load tool guide markdown files from /src/content/tools/[tool-name].md
const toolGuides = import.meta.glob('/src/content/tools/*.md', { as: 'raw', eager: true });

const renderedGuideHtml = ref<string>('');

function loadArticle(toolSlug: string) {
  const normalizedSlug = toolSlug.replace(/^\//, '');
  const guidePath = `/src/content/tools/${normalizedSlug}.md`;
  
  if (guidePath in toolGuides) {
    const rawContent = toolGuides[guidePath] as string;
    renderedGuideHtml.value = DomPurify.sanitize(md.render(rawContent), { ADD_ATTR: ['target'] });
  } else {
    // Elegant fallback when a specialized article has not been written yet
    renderedGuideHtml.value = '';
  }
}

watch(
  () => route.path,
  newPath => {
    loadArticle(newPath);
  },
  { immediate: true },
);
</script>

<template>
  <BaseLayout>
    <div class="tool-layout">
      <div class="tool-header">
        <div flex flex-nowrap items-center justify-between>
          <n-h1>
            {{ toolTitle }}
          </n-h1>

          <div>
            <FavoriteButton :tool="{ name: route.meta.name, path: route.path } as Tool" />
          </div>
        </div>

        <div class="separator" />

        <div class="description">
          {{ toolDescription }}
        </div>
      </div>
    </div>

    <!-- Interactive Tool Component Slot -->
    <div class="tool-content">
      <slot />
    </div>

    <!-- Responsive AdSense Spaceholder to maintain 0 CLS -->
    <div class="mx-auto mt-12 max-w-850px px-4">
      <AdSenseUnit format="horizontal" min-height="110px" />
    </div>

    <!-- Elegant Tool Guide & SEO Article Section -->
    <div v-if="renderedGuideHtml" class="mx-auto mt-10 max-w-850px px-4 pb-12">
      <article
        class="tool-article-card rounded-2xl border p-6 md:p-10 transition-all duration-300"
        :class="{ 'is-dark': isDark }"
      >
        <div
          class="prose prose-slate max-w-none prose-headings:font-semibold prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline prose-pre:rounded-xl"
          :class="{ 'prose-invert': isDark }"
          v-html="renderedGuideHtml"
        />
      </article>

      <!-- Bottom AdSense Unit below the guide -->
      <div class="mt-8">
        <AdSenseUnit format="horizontal" min-height="110px" />
      </div>
    </div>
  </BaseLayout>
</template>

<style lang="less" scoped>
.tool-content {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;

  ::v-deep(& > *) {
    flex: 0 1 600px;
  }
}

.tool-layout {
  max-width: 600px;
  margin: 0 auto;
  box-sizing: border-box;

  .tool-header {
    padding: 40px 0;
    width: 100%;

    .n-h1 {
      opacity: 0.9;
      font-size: 40px;
      font-weight: 400;
      margin: 0;
      line-height: 1;
    }

    .separator {
      width: 200px;
      height: 2px;
      background: rgb(161, 161, 161);
      opacity: 0.2;

      margin: 10px 0;
    }

    .description {
      margin: 0;

      opacity: 0.7;
    }
  }
}

.tool-article-card {
  background-color: #ffffff;
  border-color: #e2e8f0;
  color: #1e293b;
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);

  &.is-dark {
    background-color: #1B1B30 !important;
    border-color: #282845 !important;
    color: #F8FAFC !important;
    box-shadow: 0 10px 30px -5px rgba(15, 15, 35, 0.6) !important;
  }
}
</style>
