<script setup lang="ts">
import { computed, ref } from 'vue';
import { useStorage } from '@vueuse/core';
import { useMessage } from 'naive-ui';
import { Copy, Refresh, Wand } from '@vicons/tabler';
import {
  PRICING_DISCLAIMER,
  PRICING_LAST_UPDATED,
  PRICING_SOURCES,
  SAMPLE_PROMPTS,
  calculateLlmCosts,
  estimateTokens,
} from './ai-token-cost-calculator.service';

const pricingLastUpdated = PRICING_LAST_UPDATED;
const pricingSources = PRICING_SOURCES;
const pricingDisclaimer = PRICING_DISCLAIMER;

let message: ReturnType<typeof useMessage> | null = null;
try {
  message = useMessage();
}
catch {
  // Graceful fallback if mounted without n-message-provider
}

// Persisted inputs
const systemPrompt = useStorage('ai-calc:system-prompt', '');
const userPrompt = useStorage(
  'ai-calc:user-prompt',
  SAMPLE_PROMPTS[0]?.userPrompt || '',
);
const expectedOutputTokens = useStorage('ai-calc:output-tokens', 500);
const requestVolume = useStorage('ai-calc:volume', 10000);
const usePromptCache = useStorage('ai-calc:cache', false);
const selectedTier = ref<string>('all');

const defaultMetrics = {
  charCount: 0,
  wordCount: 0,
  lineCount: 0,
  estimatedTokens: 0,
  arabicCharRatio: 0,
  codeDensityRatio: 0,
};

// Combine full text for estimation safely
const fullPromptText = computed(() => {
  const parts: string[] = [];
  const sys = typeof systemPrompt.value === 'string' ? systemPrompt.value.trim() : '';
  const usr = typeof userPrompt.value === 'string' ? userPrompt.value.trim() : '';
  if (sys) {
    parts.push(sys);
  }
  if (usr) {
    parts.push(usr);
  }
  return parts.join('\n\n');
});

const tokenMetrics = computed(() => {
  try {
    const raw = estimateTokens(fullPromptText.value || '') || defaultMetrics;
    return {
      ...raw,
      formattedTokens: Number(raw.estimatedTokens || 0).toLocaleString('en-US'),
      formattedChars: Number(raw.charCount || 0).toLocaleString('en-US'),
      formattedWords: Number(raw.wordCount || 0).toLocaleString('en-US'),
    };
  }
  catch (e) {
    console.error('[AI Token Calculator] Error estimating tokens:', e);
    return {
      ...defaultMetrics,
      formattedTokens: '0',
      formattedChars: '0',
      formattedWords: '0',
    };
  }
});

const allCalculations = computed(() => {
  try {
    const inputTokens = tokenMetrics.value?.estimatedTokens ?? 0;
    const outputTokens = Number(expectedOutputTokens.value) || 500;
    const volume = Number(requestVolume.value) || 10000;
    const cache = Boolean(usePromptCache.value);
    return calculateLlmCosts({
      inputTokens,
      outputTokens,
      requestVolume: volume,
      usePromptCache: cache,
    }) || [];
  }
  catch (e) {
    console.error('[AI Token Calculator] Error calculating costs:', e);
    return [];
  }
});

const filteredCalculations = computed(() => {
  if (!Array.isArray(allCalculations.value)) {
    return [];
  }
  if (selectedTier.value === 'all') {
    return allCalculations.value;
  }
  return allCalculations.value.filter(c => c?.model?.tier === selectedTier.value);
});

function loadSample(index: number) {
  const sample = SAMPLE_PROMPTS[index];
  if (sample) {
    systemPrompt.value = sample.systemPrompt;
    userPrompt.value = sample.userPrompt;
    expectedOutputTokens.value = sample.expectedOutputTokens;
    message?.success?.(`Loaded preset: ${sample.name}`);
  }
}

function clearAll() {
  systemPrompt.value = '';
  userPrompt.value = '';
  message?.info?.('Cleared inputs');
}

const formatPricePerM = (price: number) => `$${(price || 0).toFixed(price < 0.1 ? 3 : 2)}`;

function formatCost(val: number) {
  if (!val || val === 0) {
    return '$0.00';
  }
  if (val < 0.0001) {
    return `$${val.toFixed(6)}`;
  }
  if (val < 0.01) {
    return `$${val.toFixed(4)}`;
  }
  return `$${val.toFixed(2)}`;
}

function formatCount(num: number | string | undefined | null): string {
  if (num === undefined || num === null || Number.isNaN(Number(num))) {
    return '0';
  }
  return Number(num).toLocaleString('en-US');
}

const formattedVolume = computed(() => formatCount(requestVolume.value));

async function copyMarkdownSummary() {
  const lines = [
    '### AI Prompt Cost Analysis (DevTol.online)',
    `- **Input Tokens**: ~${formatCount(tokenMetrics.value?.estimatedTokens ?? 0)}`,
    `- **Expected Output Tokens**: ${formatCount(expectedOutputTokens.value)}`,
    `- **Monthly Request Volume**: ${formatCount(requestVolume.value)} requests`,
    `- **Prompt Caching**: ${usePromptCache.value ? 'Enabled' : 'Disabled'}`,
    '',
    '| Model | Provider | Input / 1M | Output / 1M | Cost / Call | Monthly Total | Savings |',
    '|---|---|---|---|---|---|---|',
  ];

  filteredCalculations.value.forEach((c) => {
    lines.push(
      `| ${c.model.name} | ${c.model.provider} | ${formatPricePerM(c.model.inputPricePerMillion)} | ${formatPricePerM(c.model.outputPricePerMillion)} | ${formatCost(c.singleRequestTotalCost)} | ${formatCost(c.monthlyTotalCost)} | ${c.savingsVsHighest}% |`,
    );
  });

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      message?.success?.('Copied Markdown analysis table to clipboard!');
    }
    catch {
      message?.warning?.('Could not copy to clipboard');
    }
  }
}

const volumePresets = [
  { label: '1 req', val: 1 },
  { label: '1,000 reqs', val: 1000 },
  { label: '10,000 reqs', val: 10000 },
  { label: '100,000 reqs', val: 100000 },
  { label: '1,000,000 reqs', val: 1000000 },
];

function getProviderTagType(provider: string): 'default' | 'success' | 'warning' | 'info' | 'error' {
  switch (provider) {
    case 'Google': return 'success';
    case 'DeepSeek': return 'info';
    case 'OpenAI': return 'warning';
    case 'Anthropic': return 'error';
    default: return 'default';
  }
}
</script>

<template>
  <div class="ai-token-calculator" style="max-width: 1200px; margin: 0 auto;">
    <!-- Preset Banner -->
    <div class="preset-section mb-4 flex flex-wrap items-center gap-2">
      <span class="text-sm text-gray-500 font-semibold">Quick Presets:</span>
      <n-button
        v-for="(sample, idx) in SAMPLE_PROMPTS"
        :key="sample.name"
        size="small"
        secondary
        @click="loadSample(idx)"
      >
        <template #icon>
          <n-icon :component="Wand" />
        </template>
        {{ sample.name }}
      </n-button>
      <n-button size="small" quaternary type="error" @click="clearAll">
        <template #icon>
          <n-icon :component="Refresh" />
        </template>
        Clear
      </n-button>
    </div>

    <!-- Main Grid: Input & Metrics -->
    <n-grid :cols="24" :x-gap="16" :y-gap="16" class="mb-6">
      <!-- Input Left Column -->
      <n-gi :span="24" :m="16">
        <n-card title="System & User Prompt" size="small">
          <div class="space-y-4">
            <div>
              <div class="mb-1 text-xs text-gray-500 font-medium tracking-wider uppercase">
                System Prompt / Instructions (Optional)
              </div>
              <n-input
                v-model:value="systemPrompt"
                type="textarea"
                placeholder="e.g. You are a senior software architect. Provide secure, production-ready solutions..."
                :rows="2"
                clearable
              />
            </div>

            <div>
              <div class="mb-1 text-xs text-gray-500 font-medium tracking-wider uppercase">
                User Prompt / Context / Document Body
              </div>
              <n-input
                v-model:value="userPrompt"
                type="textarea"
                placeholder="Paste your prompt, questions, code, or context payload here..."
                :rows="7"
                clearable
              />
            </div>
          </div>
        </n-card>
      </n-gi>

      <!-- Metrics Right Column -->
      <n-gi :span="24" :m="8">
        <n-card title="Real-Time Tokenization Metrics" size="small" class="h-full">
          <div class="flex flex-col gap-4">
            <div class="border border-emerald-500/20 rounded-lg bg-emerald-500/10 p-4 text-center">
              <div class="text-xs text-emerald-600 font-medium tracking-wider uppercase dark:text-emerald-400">
                Estimated Input Tokens
              </div>
              <div class="my-1 text-3xl text-emerald-600 font-extrabold dark:text-emerald-400">
                {{ tokenMetrics?.formattedTokens || '0' }}
              </div>
              <div class="text-xs text-gray-500">
                BPE-calibrated heuristic estimation
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2 text-center">
              <div class="rounded bg-gray-50 p-2 dark:bg-gray-800">
                <div class="text-xs text-gray-500">
                  Characters
                </div>
                <div class="text-lg font-bold">
                  {{ tokenMetrics?.formattedChars || '0' }}
                </div>
              </div>
              <div class="rounded bg-gray-50 p-2 dark:bg-gray-800">
                <div class="text-xs text-gray-500">
                  Words
                </div>
                <div class="text-lg font-bold">
                  {{ tokenMetrics?.formattedWords || '0' }}
                </div>
              </div>
            </div>

            <!-- Language / Density Alerts -->
            <div v-if="tokenMetrics && tokenMetrics.arabicCharRatio > 0.2" class="border border-amber-500/20 rounded bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-300">
              ⚡ <strong>Arabic Script Detected</strong>: Standard BPE models expand Arabic into ~2.1 tokens/word compared to ~1.3 for English.
            </div>
            <div v-else-if="tokenMetrics && tokenMetrics.codeDensityRatio > 0.12" class="border border-blue-500/20 rounded bg-blue-500/10 p-2 text-xs text-blue-700 dark:text-blue-300">
              ⚙️ <strong>Code / JSON Syntax Detected</strong>: Punctuation and identifier splits increase token density.
            </div>

            <!-- Parameters -->
            <div class="border-t pt-3 space-y-3 dark:border-gray-700">
              <div>
                <div class="mb-1 flex justify-between text-xs">
                  <span>Expected Output Tokens:</span>
                  <strong class="text-primary">{{ expectedOutputTokens }}</strong>
                </div>
                <n-slider v-model:value="expectedOutputTokens" :min="50" :max="4096" :step="50" />
              </div>

              <div>
                <div class="mb-1 text-xs">
                  Prompt Caching:
                </div>
                <n-switch v-model:value="usePromptCache">
                  <template #checked>
                    Enabled (Discounts applied)
                  </template>
                  <template #unchecked>
                    Standard (No Cache)
                  </template>
                </n-switch>
              </div>
            </div>
          </div>
        </n-card>
      </n-gi>
    </n-grid>

    <!-- Volume & Scaling Controls -->
    <n-card size="small" class="mb-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold">Monthly Scale:</span>
          <n-button-group size="small">
            <n-button
              v-for="p in volumePresets"
              :key="p.val"
              :type="requestVolume === p.val ? 'primary' : 'default'"
              @click="requestVolume = p.val"
            >
              {{ p.label }}
            </n-button>
          </n-button-group>
        </div>

        <div class="flex items-center gap-3">
          <span class="text-xs text-gray-500">Custom volume:</span>
          <n-input-number
            v-model:value="requestVolume"
            size="small"
            :min="1"
            :step="1000"
            style="width: 140px"
          />
          <n-button size="small" type="primary" secondary @click="copyMarkdownSummary">
            <template #icon>
              <n-icon :component="Copy" />
            </template>
            Export Table
          </n-button>
        </div>
      </div>
    </n-card>

    <!-- Pricing Comparison Section -->
    <n-card :title="`LLM Cost Comparison Leaderboard (Prices last updated: ${pricingLastUpdated})`" size="small">
      <template #header-extra>
        <n-radio-group v-model:value="selectedTier" size="small">
          <n-radio-button value="all">
            All Models
          </n-radio-button>
          <n-radio-button value="budget">
            Budget Leaders (&lt;$1)
          </n-radio-button>
          <n-radio-button value="flagship">
            Flagship Intelligence
          </n-radio-button>
          <n-radio-button value="reasoning">
            Reasoning & STEM
          </n-radio-button>
        </n-radio-group>
      </template>

      <div class="overflow-x-auto">
        <n-table :bordered="true" :single-line="false" size="small" striped>
          <thead>
            <tr>
              <th>Model</th>
              <th>Provider</th>
              <th>Input / 1M</th>
              <th>Output / 1M</th>
              <th>Single Call Cost</th>
              <th>Monthly ({{ formattedVolume }} calls)</th>
              <th>Savings vs Max</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredCalculations" :key="item.model.id">
              <td>
                <div class="font-bold">
                  {{ item.model.name }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ item.model.recommendedFor }}
                </div>
              </td>
              <td>
                <n-tag size="small" :type="getProviderTagType(item.model.provider)" round>
                  {{ item.model.provider }}
                </n-tag>
              </td>
              <td>
                <span :class="{ 'line-through text-gray-400': item.isCached }">
                  {{ formatPricePerM(item.model.inputPricePerMillion) }}
                </span>
                <span v-if="item.isCached" class="ml-1 text-emerald-500 font-bold">
                  {{ formatPricePerM(item.model.cachedInputPricePerMillion || 0) }}
                </span>
              </td>
              <td>{{ formatPricePerM(item.model.outputPricePerMillion) }}</td>
              <td class="font-semibold font-mono">
                {{ formatCost(item.singleRequestTotalCost) }}
              </td>
              <td class="text-primary font-bold font-mono">
                {{ formatCost(item.monthlyTotalCost) }}
              </td>
              <td>
                <n-tag v-if="item.savingsVsHighest > 0" size="small" type="success" :bordered="false">
                  Save {{ item.savingsVsHighest }}%
                </n-tag>
                <span v-else class="text-xs text-gray-400">Baseline</span>
              </td>
            </tr>
          </tbody>
        </n-table>
      </div>

      <div class="mt-3 text-xs text-gray-500">
        <p>{{ pricingDisclaimer }}</p>
        <p class="mt-1">
          Prices last updated: {{ pricingLastUpdated }} · Sources:
          <template v-for="(url, provider, i) in pricingSources" :key="provider">
            <span v-if="i > 0"> · </span><a :href="url" target="_blank" rel="noopener" class="underline">{{ provider }}</a>
          </template>
        </p>
      </div>
    </n-card>
  </div>
</template>

<style scoped>
.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
</style>
