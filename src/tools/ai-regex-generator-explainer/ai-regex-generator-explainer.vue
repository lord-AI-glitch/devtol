<script setup lang="ts">
import { computed, ref } from 'vue';
import { useStorage } from '@vueuse/core';
import { useMessage } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import {
  Check,
  Copy,
  Search,
  Wand,
} from '@vicons/tabler';
import {
  type RegexPreset,
  explainRegexPattern,
  generateCodeSnippets,
  matchNaturalLanguageIntent,
  testRegex,
} from './ai-regex-generator-explainer.service';

const message = useMessage();
const { t, locale } = useI18n();

// User state
const searchQuery = ref('');
const selectedCategory = ref<string>('All');
const currentPattern = useStorage('regex:pattern', '^(?:\\+20|0)?1[0125]\\d{8}$');
const flagG = useStorage('regex:flag_g', true);
const flagI = useStorage('regex:flag_i', false);
const flagM = useStorage('regex:flag_m', false);
const flagS = useStorage('regex:flag_s', false);
const flagU = useStorage('regex:flag_u', false);

const testText = useStorage(
  'regex:test_text',
  '+201096656588\n01096656588\n01123456789\n01298765432\n01511122233\n0139999999',
);

const activeCodeTab = ref<string>('javascript');
const copiedCode = ref(false);
const copiedRegex = ref(false);

const activeFlags = computed(() => {
  let f = '';
  if (flagG.value) {
    f += 'g';
  }
  if (flagI.value) {
    f += 'i';
  }
  if (flagM.value) {
    f += 'm';
  }
  if (flagS.value) {
    f += 's';
  }
  if (flagU.value) {
    f += 'u';
  }
  return f;
});

const categories = ['All', 'Arabic & Regional', 'Web & Net', 'Security & Auth', 'Data & Form', 'Code & Text'];

const filteredPresets = computed(() => {
  let list = matchNaturalLanguageIntent(searchQuery.value);
  if (selectedCategory.value !== 'All') {
    list = list.filter(p => p.category === selectedCategory.value);
  }
  return list;
});

function applyPreset(preset: RegexPreset) {
  currentPattern.value = preset.pattern;
  flagG.value = preset.flags.includes('g');
  flagI.value = preset.flags.includes('i');
  flagM.value = preset.flags.includes('m');
  flagS.value = preset.flags.includes('s');
  flagU.value = preset.flags.includes('u');
  testText.value = preset.testStrings.join('\n');
  message?.success?.(`Applied pattern: ${locale.value === 'ar' ? preset.nameAr : preset.nameEn}`);
}

// Regex explanation breakdown
const patternExplanations = computed(() => {
  return explainRegexPattern(currentPattern.value, activeFlags.value);
});

// Live test result
const testResult = computed(() => {
  return testRegex(currentPattern.value, activeFlags.value, testText.value);
});

// Code snippets
const codeSnippets = computed(() => {
  return generateCodeSnippets(currentPattern.value, activeFlags.value);
});

async function copyToClipboard(text: string, isSnippet = false) {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    if (isSnippet) {
      copiedCode.value = true;
      setTimeout(() => (copiedCode.value = false), 2000);
    }
    else {
      copiedRegex.value = true;
      setTimeout(() => (copiedRegex.value = false), 2000);
    }
    message?.success?.('Copied to clipboard!');
  }
}

function getTypeBadgeType(type: string): 'default' | 'info' | 'success' | 'warning' | 'error' {
  switch (type) {
    case 'anchor': return 'warning';
    case 'group': return 'info';
    case 'lookaround': return 'error';
    case 'quantifier': return 'success';
    case 'character-class': return 'info';
    case 'flag': return 'warning';
    default: return 'default';
  }
}
</script>

<template>
  <div class="ai-regex-tool mx-auto max-w-1100px">
    <!-- Preset Search & Natural Language Query -->
    <n-card size="small" class="mb-5 border border-slate-200 rounded-xl shadow-sm dark:border-slate-800">
      <div class="mb-3 flex flex-col items-center justify-between gap-3 md:flex-row">
        <div class="w-full md:w-1/2">
          <n-input
            v-model:value="searchQuery"
            placeholder="Search pattern or describe in English/Arabic (e.g. email, هاتف مصري, password)..."
            clearable
          >
            <template #prefix>
              <n-icon :component="Search" class="text-slate-400" />
            </template>
          </n-input>
        </div>

        <!-- Category filters -->
        <div class="flex flex-wrap justify-end gap-1.5">
          <n-button
            v-for="cat in categories"
            :key="cat"
            size="tiny"
            :type="selectedCategory === cat ? 'primary' : 'default'"
            round
            @click="selectedCategory = cat"
          >
            {{ cat }}
          </n-button>
        </div>
      </div>

      <!-- Preset Pills -->
      <div class="max-h-120px flex flex-wrap gap-2 overflow-y-auto border-t border-slate-100 pt-2 dark:border-slate-800/60">
        <n-button
          v-for="preset in filteredPresets"
          :key="preset.id"
          size="small"
          secondary
          class="preset-btn"
          @click="applyPreset(preset)"
        >
          <template #icon>
            <n-icon :component="Wand" class="text-emerald-500" />
          </template>
          {{ locale === 'ar' ? preset.nameAr : preset.nameEn }}
        </n-button>
      </div>
    </n-card>

    <!-- Regex Pattern Editor & Flag Toggles -->
    <n-card title="Regular Expression Pattern" size="small" class="mb-5 border border-slate-200 rounded-xl shadow-sm dark:border-slate-800">
      <div class="flex flex-col items-center gap-3 md:flex-row">
        <div class="w-full flex-1">
          <n-input
            v-model:value="currentPattern"
            type="text"
            size="large"
            placeholder="Enter regex pattern (e.g. ^[a-z0-9]+$)"
            class="text-base font-semibold font-mono"
          >
            <template #prefix>
              <span class="mr-1 text-lg text-emerald-600 font-bold font-mono dark:text-emerald-400">/</span>
            </template>
            <template #suffix>
              <span class="text-lg text-emerald-600 font-bold font-mono dark:text-emerald-400">/{{ activeFlags }}</span>
            </template>
          </n-input>
        </div>

        <div class="flex items-center gap-2">
          <n-button
            type="primary"
            size="large"
            secondary
            @click="copyToClipboard(`/${currentPattern}/${activeFlags}`)"
          >
            <template #icon>
              <n-icon :component="copiedRegex ? Check : Copy" />
            </template>
            {{ copiedRegex ? 'Copied' : 'Copy Regex' }}
          </n-button>
        </div>
      </div>

      <!-- Regex Flags Toggles -->
      <div class="mt-3 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
        <span class="text-slate-500 font-semibold">Flags:</span>
        <label class="flex cursor-pointer items-center gap-1.5">
          <n-checkbox v-model:checked="flagG" size="small" />
          <span class="font-bold font-mono">g</span> (Global)
        </label>
        <label class="flex cursor-pointer items-center gap-1.5">
          <n-checkbox v-model:checked="flagI" size="small" />
          <span class="font-bold font-mono">i</span> (Case-Insensitive)
        </label>
        <label class="flex cursor-pointer items-center gap-1.5">
          <n-checkbox v-model:checked="flagM" size="small" />
          <span class="font-bold font-mono">m</span> (Multiline)
        </label>
        <label class="flex cursor-pointer items-center gap-1.5">
          <n-checkbox v-model:checked="flagS" size="small" />
          <span class="font-bold font-mono">s</span> (DotAll)
        </label>
        <label class="flex cursor-pointer items-center gap-1.5">
          <n-checkbox v-model:checked="flagU" size="small" />
          <span class="font-bold font-mono">u</span> (Unicode)
        </label>
      </div>
    </n-card>

    <!-- Interactive Live Sandbox Testing -->
    <n-grid :cols="24" :x-gap="16" :y-gap="16" class="mb-5">
      <n-gi :span="24" :m="12">
        <n-card title="Test Strings Sandbox" size="small" class="h-full border border-slate-200 rounded-xl shadow-sm dark:border-slate-800">
          <n-input
            v-model:value="testText"
            type="textarea"
            :rows="6"
            placeholder="Type sample text here to test against the pattern..."
            class="text-sm font-mono"
          />

          <div class="mt-3 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span
                v-if="testResult.matched"
                class="inline-flex items-center gap-1 border border-emerald-300 rounded-full bg-emerald-100 px-2.5 py-1 text-xs text-emerald-700 font-semibold dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
              >
                ✓ {{ testResult.matchCount }} Match{{ testResult.matchCount > 1 ? 'es' : '' }} Found
              </span>
              <span
                v-else-if="testResult.error"
                class="inline-flex items-center gap-1 border border-rose-300 rounded-full bg-rose-100 px-2.5 py-1 text-xs text-rose-700 font-semibold dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
              >
                ⚠ Regex Syntax Error
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 font-semibold dark:bg-slate-800 dark:text-slate-400"
              >
                No Match
              </span>
            </div>

            <n-button size="tiny" quaternary @click="testText = ''">
              Clear Text
            </n-button>
          </div>
        </n-card>
      </n-gi>

      <!-- Extracted Matches Box -->
      <n-gi :span="24" :m="12">
        <n-card title="Captured Matches & Groups" size="small" class="h-full border border-slate-200 rounded-xl shadow-sm dark:border-slate-800">
          <div v-if="testResult.matches.length > 0" class="max-h-200px overflow-y-auto pr-1 space-y-2">
            <div
              v-for="(m, idx) in testResult.matches"
              :key="idx"
              class="border border-slate-200 rounded-lg bg-slate-50 p-2.5 text-xs font-mono dark:border-slate-800 dark:bg-slate-900"
            >
              <div class="mb-1 flex items-center justify-between text-slate-500">
                <span>Match #{{ idx + 1 }} (Index: {{ m.index }})</span>
                <span class="text-emerald-600 font-semibold dark:text-emerald-400">{{ m.fullMatch.length }} chars</span>
              </div>
              <div class="break-all border border-slate-100 rounded bg-white p-1.5 text-slate-800 font-bold dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                {{ m.fullMatch }}
              </div>
              <div v-if="m.groups && m.groups.length > 0" class="mt-2 flex flex-wrap gap-1 border-t border-slate-200 pt-1 dark:border-slate-800">
                <span v-for="(grp, gIdx) in m.groups" :key="gIdx" class="border border-blue-200 rounded bg-blue-50 px-1.5 py-0.5 text-[11px] text-blue-700 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300">
                  Group {{ gIdx + 1 }}: "{{ grp }}"
                </span>
              </div>
            </div>
          </div>
          <div v-else class="h-160px flex flex-col items-center justify-center text-sm text-slate-400">
            <span>No active matches in the test sandbox</span>
            <span class="mt-1 text-xs text-slate-400">Type matching text on the left to inspect captured tokens</span>
          </div>
        </n-card>
      </n-gi>
    </n-grid>

    <!-- Structural Breakdown & AI Explanation -->
    <n-card title="Step-by-Step Structural Breakdown" size="small" class="mb-5 border border-slate-200 rounded-xl shadow-sm dark:border-slate-800">
      <p class="mb-3 text-xs text-slate-500">
        Every token and structural block in your regular expression is disassembled and explained below:
      </p>

      <div class="grid grid-cols-1 max-h-340px gap-2.5 overflow-y-auto pr-1 md:grid-cols-2">
        <div
          v-for="(item, idx) in patternExplanations"
          :key="idx"
          class="flex items-start gap-3 border border-slate-200 rounded-lg bg-slate-50/80 p-3 transition dark:border-slate-800 hover:border-emerald-500/40 dark:bg-slate-900/80"
        >
          <div class="shrink-0 border border-slate-200 rounded bg-white px-2 py-1 text-sm text-emerald-600 font-bold font-mono dark:border-slate-800 dark:bg-slate-950 dark:text-emerald-400">
            {{ item.token }}
          </div>
          <div class="min-w-0 flex-1">
            <div class="mb-1 flex items-center gap-2">
              <span class="text-xs text-slate-800 font-semibold dark:text-slate-200">{{ item.title }}</span>
              <n-tag size="tiny" :type="getTypeBadgeType(item.type)">
                {{ item.type }}
              </n-tag>
            </div>
            <p class="m-0 text-xs text-slate-600 leading-relaxed dark:text-slate-400">
              {{ locale === 'ar' ? item.explanationAr : item.explanationEn }}
            </p>
          </div>
        </div>
      </div>
    </n-card>

    <!-- Ready-to-Use Code Snippets -->
    <n-card title="Production Code Snippets" size="small" class="border border-slate-200 rounded-xl shadow-sm dark:border-slate-800">
      <div class="mb-3 flex items-center justify-between">
        <n-tabs v-model:value="activeCodeTab" type="segment" size="small">
          <n-tab name="javascript">
            JavaScript
          </n-tab>
          <n-tab name="python">
            Python
          </n-tab>
          <n-tab name="golang">
            Go
          </n-tab>
          <n-tab name="php">
            PHP
          </n-tab>
          <n-tab name="java">
            Java
          </n-tab>
          <n-tab name="csharp">
            C#
          </n-tab>
        </n-tabs>

        <n-button size="small" secondary @click="copyToClipboard(codeSnippets[activeCodeTab], true)">
          <template #icon>
            <n-icon :component="copiedCode ? Check : Copy" />
          </template>
          {{ copiedCode ? 'Copied' : 'Copy Snippet' }}
        </n-button>
      </div>

      <div class="relative">
        <pre class="m-0 overflow-x-auto border border-slate-800 rounded-xl bg-slate-950 p-4 text-xs text-slate-100 leading-relaxed font-mono">{{ codeSnippets[activeCodeTab] }}</pre>
      </div>
    </n-card>
  </div>
</template>

<style scoped>
.preset-btn {
  font-size: 12px;
  border-radius: 8px;
}
</style>
