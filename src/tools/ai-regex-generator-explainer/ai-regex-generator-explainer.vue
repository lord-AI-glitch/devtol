<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useStorage } from '@vueuse/core';
import { useMessage } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import {
  Copy,
  Check,
  Search,
  Code,
  Wand,
  Refresh,
  Terminal,
} from '@vicons/tabler';
import {
  REGEX_PRESETS,
  explainRegexPattern,
  generateCodeSnippets,
  matchNaturalLanguageIntent,
  testRegex,
  type RegexPreset,
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
  if (flagG.value) f += 'g';
  if (flagI.value) f += 'i';
  if (flagM.value) f += 'm';
  if (flagS.value) f += 's';
  if (flagU.value) f += 'u';
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
    } else {
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
  <div class="ai-regex-tool max-w-1100px mx-auto">
    <!-- Preset Search & Natural Language Query -->
    <n-card size="small" class="mb-5 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
      <div class="flex flex-col md:flex-row gap-3 items-center justify-between mb-3">
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
        <div class="flex flex-wrap gap-1.5 justify-end">
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
      <div class="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 max-h-120px overflow-y-auto">
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
    <n-card title="Regular Expression Pattern" size="small" class="mb-5 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
      <div class="flex flex-col md:flex-row gap-3 items-center">
        <div class="flex-1 w-full">
          <n-input
            v-model:value="currentPattern"
            type="text"
            size="large"
            placeholder="Enter regex pattern (e.g. ^[a-z0-9]+$)"
            class="font-mono text-base font-semibold"
          >
            <template #prefix>
              <span class="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-lg mr-1">/</span>
            </template>
            <template #suffix>
              <span class="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-lg">/{{ activeFlags }}</span>
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
      <div class="flex flex-wrap gap-4 items-center mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        <span class="font-semibold text-slate-500">Flags:</span>
        <label class="flex items-center gap-1.5 cursor-pointer">
          <n-checkbox v-model:checked="flagG" size="small" />
          <span class="font-mono font-bold">g</span> (Global)
        </label>
        <label class="flex items-center gap-1.5 cursor-pointer">
          <n-checkbox v-model:checked="flagI" size="small" />
          <span class="font-mono font-bold">i</span> (Case-Insensitive)
        </label>
        <label class="flex items-center gap-1.5 cursor-pointer">
          <n-checkbox v-model:checked="flagM" size="small" />
          <span class="font-mono font-bold">m</span> (Multiline)
        </label>
        <label class="flex items-center gap-1.5 cursor-pointer">
          <n-checkbox v-model:checked="flagS" size="small" />
          <span class="font-mono font-bold">s</span> (DotAll)
        </label>
        <label class="flex items-center gap-1.5 cursor-pointer">
          <n-checkbox v-model:checked="flagU" size="small" />
          <span class="font-mono font-bold">u</span> (Unicode)
        </label>
      </div>
    </n-card>

    <!-- Interactive Live Sandbox Testing -->
    <n-grid :cols="24" :x-gap="16" :y-gap="16" class="mb-5">
      <n-gi :span="24" :m="12">
        <n-card title="Test Strings Sandbox" size="small" class="h-full border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
          <n-input
            v-model:value="testText"
            type="textarea"
            :rows="6"
            placeholder="Type sample text here to test against the pattern..."
            class="font-mono text-sm"
          />

          <div class="mt-3 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span
                v-if="testResult.matched"
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
              >
                ✓ {{ testResult.matchCount }} Match{{ testResult.matchCount > 1 ? 'es' : '' }} Found
              </span>
              <span
                v-else-if="testResult.error"
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
              >
                ⚠ Regex Syntax Error
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
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
        <n-card title="Captured Matches & Groups" size="small" class="h-full border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
          <div v-if="testResult.matches.length > 0" class="max-h-200px overflow-y-auto space-y-2 pr-1">
            <div
              v-for="(m, idx) in testResult.matches"
              :key="idx"
              class="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono"
            >
              <div class="flex justify-between items-center text-slate-500 mb-1">
                <span>Match #{{ idx + 1 }} (Index: {{ m.index }})</span>
                <span class="text-emerald-600 dark:text-emerald-400 font-semibold">{{ m.fullMatch.length }} chars</span>
              </div>
              <div class="font-bold text-slate-800 dark:text-slate-200 break-all bg-white dark:bg-slate-950 p-1.5 rounded border border-slate-100 dark:border-slate-800">
                {{ m.fullMatch }}
              </div>
              <div v-if="m.groups && m.groups.length > 0" class="mt-2 pt-1 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-1">
                <span v-for="(grp, gIdx) in m.groups" :key="gIdx" class="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-[11px]">
                  Group {{ gIdx + 1 }}: "{{ grp }}"
                </span>
              </div>
            </div>
          </div>
          <div v-else class="h-160px flex flex-col items-center justify-center text-slate-400 text-sm">
            <span>No active matches in the test sandbox</span>
            <span class="text-xs text-slate-400 mt-1">Type matching text on the left to inspect captured tokens</span>
          </div>
        </n-card>
      </n-gi>
    </n-grid>

    <!-- Structural Breakdown & AI Explanation -->
    <n-card title="Step-by-Step Structural Breakdown" size="small" class="mb-5 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
      <p class="text-xs text-slate-500 mb-3">
        Every token and structural block in your regular expression is disassembled and explained below:
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-340px overflow-y-auto pr-1">
        <div
          v-for="(item, idx) in patternExplanations"
          :key="idx"
          class="p-3 rounded-lg bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-start gap-3 transition hover:border-emerald-500/40"
        >
          <div class="font-mono text-sm px-2 py-1 rounded bg-white dark:bg-slate-950 font-bold text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-800 shrink-0">
            {{ item.token }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-semibold text-xs text-slate-800 dark:text-slate-200">{{ item.title }}</span>
              <n-tag size="tiny" :type="getTypeBadgeType(item.type)">
                {{ item.type }}
              </n-tag>
            </div>
            <p class="text-xs text-slate-600 dark:text-slate-400 m-0 leading-relaxed">
              {{ locale === 'ar' ? item.explanationAr : item.explanationEn }}
            </p>
          </div>
        </div>
      </div>
    </n-card>

    <!-- Ready-to-Use Code Snippets -->
    <n-card title="Production Code Snippets" size="small" class="border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
      <div class="flex items-center justify-between mb-3">
        <n-tabs v-model:value="activeCodeTab" type="segment" size="small">
          <n-tab name="javascript">JavaScript</n-tab>
          <n-tab name="python">Python</n-tab>
          <n-tab name="golang">Go</n-tab>
          <n-tab name="php">PHP</n-tab>
          <n-tab name="java">Java</n-tab>
          <n-tab name="csharp">C#</n-tab>
        </n-tabs>

        <n-button size="small" secondary @click="copyToClipboard(codeSnippets[activeCodeTab], true)">
          <template #icon>
            <n-icon :component="copiedCode ? Check : Copy" />
          </template>
          {{ copiedCode ? 'Copied' : 'Copy Snippet' }}
        </n-button>
      </div>

      <div class="relative">
        <pre class="m-0 p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">{{ codeSnippets[activeCodeTab] }}</pre>
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
