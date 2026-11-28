<script lang="ts" setup>
import { computed, onErrorCaptured, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useHead } from '@vueuse/head';
import type { HeadObject } from '@vueuse/head';

import BaseLayout from './base.layout.vue';
import FavoriteButton from '@/components/FavoriteButton.vue';
import ToolIssueWhatsApp from '@/components/ToolIssueWhatsApp.vue';
import AdSenseUnit from '@/components/AdSenseUnit.vue';
import type { Tool } from '@/tools/tools.types';
import { useStyleStore } from '@/stores/style.store';

// NOTE: use-tool-guide is imported dynamically inside loadArticle (below),
// so markdown-it / highlight.js / KaTeX stay out of the shared layout chunk
// and load only when a tool page actually has a guide to render.

const route = useRoute();
const styleStore = useStyleStore();
const isDark = computed(() => styleStore.isDarkTheme);

const { t, te, locale } = useI18n();

const i18nKey = computed<string>(() => {
  const metaSlug = route.meta.toolSlug as string;
  if (metaSlug) {
    return metaSlug;
  }
  const pathSlug = route.path.replace(/^\/(?:ar|de|es|fr|no|pt|uk|vi|zh)(?=\/|$)/, '').replace(/^\/+/, '').split('/')[0] || '';
  if (pathSlug === 'compress-pdf') {
    return 'pdf-compress';
  }
  if (pathSlug === 'merge-pdf') {
    return 'pdf-merge';
  }
  if (pathSlug === 'docker-run-to-compose') {
    return 'docker-run-to-docker-compose-converter';
  }
  return pathSlug;
});

const securityToolUnavailable = computed(() => ['pdf-protect', 'pdf-redact'].includes(i18nKey.value));
const unavailableDescription = computed(() => locale.value === 'ar'
  ? 'الأداة متوقفة: الملفات السابقة لم تكن محمية بكلمة مرور أو منقحة. رفع الملفات وتنزيلها معطلان لحماية بياناتك.'
  : 'Unavailable: previous files were not encrypted or redacted. Uploads and downloads are disabled.');

const toolTitle = computed<string>(() => {
  if (securityToolUnavailable.value) {
    return locale.value === 'ar' ? 'أداة PDF غير متاحة' : 'PDF security tool unavailable';
  }
  const key = `tools.${i18nKey.value}.title`;
  if (te(key)) {
    return t(key);
  }
  return String(route.meta.name || 'Tool');
});

const rawDescription = computed<string>(() => {
  if (securityToolUnavailable.value) {
    return unavailableDescription.value;
  }
  if (i18nKey.value === 'pdf-editor') {
    return locale.value === 'ar'
      ? 'محرر بتغطية مرئية فقط. النص الأصلي يظل قابلًا للبحث والنسخ والاستخراج. لا يصلح لحذف المعلومات الحساسة أو تنقيحها بأمان.'
      : 'Visual PDF editor. Original text remains searchable, copyable and extractable. Not for secure redaction or permanent text removal.';
  }
  const key = `tools.${i18nKey.value}.description`;
  if (te(key)) {
    return t(key);
  }
  return String(route.meta.description || '');
});
const toolDescription = computed<string>(() => rawDescription.value);

const capturedError = ref<Error | null>(null);

onErrorCaptured((err, instance, info) => {
  console.error('[DevTol Tool Error Captured]:', err, info);
  capturedError.value = err instanceof Error ? err : new Error(String(err));
  return false;
});

const OG_LOCALES: Record<string, string> = {
  en: 'en_US',
  ar: 'ar_AR',
  de: 'de_DE',
  es: 'es_ES',
  fr: 'fr_FR',
  no: 'nb_NO',
  pt: 'pt_BR',
  uk: 'uk_UA',
  vi: 'vi_VN',
  zh: 'zh_CN',
};
const ogLocale = computed<string>(() => OG_LOCALES[locale.value] ?? 'en_US');

function clampText(value: string, max: number): string {
  if (value.length <= max) {
    return value;
  }
  const slice = value.slice(0, max - 1);
  const cut = slice.lastIndexOf(' ');
  return `${(cut > max * 0.6 ? slice.slice(0, cut) : slice).trimEnd()}…`;
}

// Prefer a clean cut at a natural separator over a mid-sentence ellipsis.
function fitTitle(value: string, max: number): string {
  if (value.length <= max) {
    return value;
  }
  let best = '';
  for (const sep of [' — ', ' – ', ' - ', ' | ', ': ', ' (', '، ', ', ']) {
    let idx = value.lastIndexOf(sep, max);
    while (idx > 0) {
      const head = value.slice(0, idx).trimEnd();
      if (head.length >= 25 && head.length <= max && head.length > best.length) {
        best = head;
      }
      idx = value.lastIndexOf(sep, idx - 1);
    }
  }
  if (best) {
    return best;
  }
  if (value.length <= 70) {
    return value;
  }
  return clampText(value, max);
}

const seoTitle = computed<string>(() => {
  const suffixes = locale.value === 'ar'
    ? [' أونلاين مجاناً - DevTol', ' | DevTol']
    : [' Online — Free & Client-Side | DevTol', ' | DevTol'];
  for (const suffix of suffixes) {
    if (toolTitle.value.length + suffix.length <= 62) {
      return `${toolTitle.value}${suffix}`;
    }
  }
  return fitTitle(toolTitle.value, 62);
});

const seoDescription = computed<string>(() => {
  if (securityToolUnavailable.value) {
    return unavailableDescription.value;
  }
  const clean = rawDescription.value.replace(/\s*[.。!]+$/, '').trimEnd();
  if (locale.value === 'ar') {
    const desc = clean || `${toolTitle.value} أداة برمجية أونلاين`;
    const full = `${desc}. أداة مطورين مجانية 100% تعمل محلياً داخل المتصفح بأمان.`;
    return full.length <= 158 ? full : clampText(desc, 158);
  }
  const desc = clean || `${toolTitle.value} online utility`;
  const full = `${desc}. 100% free, private, client-side developer tool.`;
  return full.length <= 158 ? full : clampText(desc, 158);
});

const canonicalUrl = computed<string>(() => `https://devtol.online${route.path}`);

const head = computed<HeadObject>(() => ({
  title: seoTitle.value,
  meta: [
    { name: 'robots', content: securityToolUnavailable.value ? 'noindex, nofollow' : 'index, follow' },
    {
      name: 'description',
      content: seoDescription.value,
    },
    {
      property: 'og:site_name',
      content: 'DevTol',
    },
    {
      property: 'og:locale',
      content: ogLocale.value,
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
      content: 'https://devtol.online/banner.png?v=2',
    },
    {
      property: 'og:image:width',
      content: '1200',
    },
    {
      property: 'og:image:height',
      content: '630',
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
      content: 'https://devtol.online/banner.png?v=2',
    },
  ],
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl.value,
    },
  ],
  script: securityToolUnavailable.value
    ? []
    : [
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
                    'name': locale.value === 'ar' ? 'الرئيسية' : 'Home',
                    'item': locale.value === 'ar' ? 'https://devtol.online/ar' : 'https://devtol.online',
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

// Guide markdown is loaded per route and rendered lazily: bundling 1.3 MB of
// guides plus markdown-it/highlight.js into every tool page wasted bandwidth.
const toolGuides = import.meta.glob('/src/content/tools/*.md', { as: 'raw' });

const renderedGuideHtml = ref<string>('');
let guideRequestId = 0;

async function loadArticle(toolSlug: string) {
  const requestId = ++guideRequestId;
  const normalizedSlug = toolSlug
    .replace(/^\/(?:ar|de|es|fr|no|pt|uk|vi|zh)(?=\/|$)/, '')
    .replace(/^\/+/, '')
    .split('/')[0] || '';
  const guidePath = `/src/content/tools/${normalizedSlug}.md`;
  const loadGuide = toolGuides[guidePath];

  if (!loadGuide) {
    renderedGuideHtml.value = '';
    return;
  }

  try {
    const [{ getGuideRenderer }, rawContent] = await Promise.all([
      import('@/composables/use-tool-guide'),
      loadGuide(),
    ]);
    const renderGuide = await getGuideRenderer();
    if (requestId !== guideRequestId) {
      return;
    }
    renderedGuideHtml.value = renderGuide(rawContent as string);
  }
  catch (error) {
    console.error('[DevTol] Could not render tool guide:', error);
    if (requestId === guideRequestId) {
      renderedGuideHtml.value = '';
    }
  }
}

watch(
  () => route.path,
  (newPath) => {
    capturedError.value = null;
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

          <div flex items-center gap-2>
            <ToolIssueWhatsApp
              mode="header"
              :tool-title="toolTitle"
              :tool-path="route.path"
            />
            <FavoriteButton :tool="{ name: route.meta.name, path: route.path } as Tool" />
          </div>
        </div>

        <div class="separator" />

        <div class="description">
          {{ toolDescription }}
        </div>
      </div>
    </div>

    <!-- Interactive Tool Component Slot or Error Boundary -->
    <div class="tool-content">
      <div v-if="capturedError" class="mx-auto max-w-650px w-full px-4">
        <ToolIssueWhatsApp
          mode="banner"
          :tool-title="toolTitle"
          :tool-path="route.path"
          :error-message="capturedError.message"
          @retry="capturedError = null"
        />
      </div>
      <slot v-else />
    </div>

    <!-- Responsive AdSense Spaceholder to maintain 0 CLS -->
    <div class="mx-auto mt-12 max-w-850px px-4">
      <AdSenseUnit format="horizontal" min-height="110px" />
    </div>

    <!-- Elegant Tool Guide & SEO Article Section -->
    <div v-if="renderedGuideHtml" class="mx-auto mt-10 max-w-850px px-4 pb-12">
      <article
        class="tool-article-card border rounded-2xl p-6 transition-all duration-300 md:p-10"
        :class="{ 'is-dark': isDark }"
      >
        <div
          class="prose-headings:font-semibold prose-a:text-indigo-400 prose-a:no-underline prose-pre:rounded-xl hover:prose-a:underline max-w-none prose prose-slate"
          :class="{ 'prose-invert': isDark }"
          v-html="renderedGuideHtml"
        />
      </article>

      <!-- Bottom AdSense Unit below the guide -->
      <div class="mt-8">
        <AdSenseUnit format="horizontal" min-height="110px" />
      </div>
    </div>

    <!-- Floating WhatsApp Action Button for Instant Tool Assistance / Malfunction Reporting -->
    <ToolIssueWhatsApp
      mode="floating"
      :tool-title="toolTitle"
      :tool-path="route.path"
    />
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
