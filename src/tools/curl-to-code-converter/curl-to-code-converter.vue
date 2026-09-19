<script setup lang="ts">
import { computed, ref } from 'vue';
import { useStorage } from '@vueuse/core';
import { useMessage } from 'naive-ui';
import { Copy, Download, Terminal, Trash, Wand } from '@vicons/tabler';
import TextareaCopyable from '@/components/TextareaCopyable.vue';
import {
  SAMPLE_CURLS,
  generateCode,
  parseCurl,
  type TargetLanguage,
} from './curl-to-code-converter.service';

const message = useMessage();

const curlInput = useStorage(
  'curl-converter:input',
  SAMPLE_CURLS[0].curl,
);

const targetLanguage = useStorage<TargetLanguage>('curl-converter:lang', 'python');
const pythonLib = useStorage('curl-converter:python-lib', 'requests');
const jsLib = useStorage('curl-converter:js-lib', 'fetch');
const phpLib = useStorage('curl-converter:php-lib', 'curl');

const parsedCurl = computed(() => parseCurl(curlInput.value));

const activeLibrary = computed(() => {
  if (targetLanguage.value === 'python') return pythonLib.value;
  if (targetLanguage.value === 'javascript' || targetLanguage.value === 'typescript') return jsLib.value;
  if (targetLanguage.value === 'php') return phpLib.value;
  return undefined;
});

const generatedOutput = computed(() => {
  if (!curlInput.value.trim()) return '';
  return generateCode(parsedCurl.value, targetLanguage.value, {
    library: activeLibrary.value,
  });
});

const syntaxHighlightLang = computed(() => {
  switch (targetLanguage.value) {
    case 'python': return 'python';
    case 'javascript': return 'javascript';
    case 'typescript': return 'typescript';
    case 'go': return 'go';
    case 'php': return 'php';
    case 'rust': return 'rust';
    case 'java': return 'java';
    case 'dart': return 'dart';
    default: return 'javascript';
  }
});

const languageOptions: { label: string; value: TargetLanguage }[] = [
  { label: 'Python', value: 'python' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Go', value: 'go' },
  { label: 'Rust', value: 'rust' },
  { label: 'PHP', value: 'php' },
  { label: 'Java', value: 'java' },
  { label: 'Dart / Flutter', value: 'dart' },
];

const pythonLibOptions = [
  { label: 'requests (Standard)', value: 'requests' },
  { label: 'httpx (Modern Sync/Async)', value: 'httpx' },
];

const jsLibOptions = [
  { label: 'fetch (Native Modern)', value: 'fetch' },
  { label: 'axios (Client Library)', value: 'axios' },
];

const phpLibOptions = [
  { label: 'cURL (Native)', value: 'curl' },
  { label: 'Guzzle (PSR-7 Client)', value: 'guzzle' },
];

const loadPreset = (idx: number) => {
  const preset = SAMPLE_CURLS[idx];
  if (preset) {
    curlInput.value = preset.curl;
    message.success(`Loaded: ${preset.name}`);
  }
};

const clearInput = () => {
  curlInput.value = '';
  message.info('Cleared cURL input');
};

const downloadCode = () => {
  const extensions: Record<TargetLanguage, string> = {
    python: 'py',
    javascript: 'js',
    typescript: 'ts',
    go: 'go',
    php: 'php',
    rust: 'rs',
    java: 'java',
    dart: 'dart',
  };

  const ext = extensions[targetLanguage.value] || 'txt';
  const blob = new Blob([generatedOutput.value], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `request.${ext}`;
  link.click();
  URL.revokeObjectURL(url);
  message.success(`Downloaded request.${ext}`);
};

const getMethodTagType = (method: string): 'default' | 'success' | 'warning' | 'info' | 'error' => {
  switch (method.toUpperCase()) {
    case 'GET': return 'info';
    case 'POST': return 'success';
    case 'PUT':
    case 'PATCH': return 'warning';
    case 'DELETE': return 'error';
    default: return 'default';
  }
};
</script>

<template>
  <div class="curl-converter" style="max-width: 1200px; margin: 0 auto;">
    <!-- Top Preset Row -->
    <div class="preset-section mb-4 flex flex-wrap items-center justify-between gap-2">
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-sm font-semibold text-gray-500">Quick Samples:</span>
        <n-button
          v-for="(preset, idx) in SAMPLE_CURLS"
          :key="preset.name"
          size="small"
          secondary
          @click="loadPreset(idx)"
        >
          <template #icon>
            <n-icon :component="Wand" />
          </template>
          {{ preset.name }}
        </n-button>
      </div>

      <n-button size="small" quaternary type="error" @click="clearInput">
        <template #icon>
          <n-icon :component="Trash" />
        </template>
        Clear
      </n-button>
    </div>

    <!-- cURL Input Area -->
    <n-card size="small" title="cURL Command Input" class="mb-4">
      <template #header-extra>
        <span class="text-xs text-gray-400 font-mono">Supports multiline \, flags: -X, -H, -d, -u, --data-raw</span>
      </template>
      <n-input
        v-model:value="curlInput"
        type="textarea"
        placeholder="Paste your curl command here (e.g. curl -X POST https://api.example.com -H 'Content-Type: application/json' -d '{...}')"
        :rows="6"
        style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;"
        clearable
      />

      <!-- Parsed Meta Summary Chips -->
      <div v-if="curlInput.trim()" class="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <n-tag size="small" :type="getMethodTagType(parsedCurl.method)" round>
          {{ parsedCurl.method }}
        </n-tag>
        <n-tag v-if="parsedCurl.url" size="small" :bordered="false" class="font-mono">
          {{ parsedCurl.url }}
        </n-tag>
        <n-tag size="small" type="default" :bordered="false">
          Headers: {{ Object.keys(parsedCurl.headers).length }}
        </n-tag>
        <n-tag v-if="parsedCurl.auth.type !== 'none'" size="small" type="warning" round>
          Auth: {{ parsedCurl.auth.type === 'bearer' ? 'Bearer Token' : 'Basic Auth' }}
        </n-tag>
        <n-tag v-if="parsedCurl.isJsonBody" size="small" type="success" :bordered="false">
          JSON Payload Detected
        </n-tag>
      </div>
    </n-card>

    <!-- Language & Library Selector Bar -->
    <n-card size="small" class="mb-4">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold">Target Language:</span>
            <n-select
              v-model:value="targetLanguage"
              :options="languageOptions"
              size="small"
              style="width: 170px"
            />
          </div>

          <!-- Sub-library Selector -->
          <div v-if="targetLanguage === 'python'" class="flex items-center gap-2">
            <span class="text-xs text-gray-500">Library:</span>
            <n-select
              v-model:value="pythonLib"
              :options="pythonLibOptions"
              size="small"
              style="width: 190px"
            />
          </div>
          <div v-else-if="targetLanguage === 'javascript' || targetLanguage === 'typescript'" class="flex items-center gap-2">
            <span class="text-xs text-gray-500">Client:</span>
            <n-select
              v-model:value="jsLib"
              :options="jsLibOptions"
              size="small"
              style="width: 170px"
            />
          </div>
          <div v-else-if="targetLanguage === 'php'" class="flex items-center gap-2">
            <span class="text-xs text-gray-500">Driver:</span>
            <n-select
              v-model:value="phpLib"
              :options="phpLibOptions"
              size="small"
              style="width: 170px"
            />
          </div>
        </div>

        <div class="flex items-center gap-2">
          <n-button size="small" secondary type="primary" :disabled="!generatedOutput" @click="downloadCode">
            <template #icon>
              <n-icon :component="Download" />
            </template>
            Download File
          </n-button>
        </div>
      </div>
    </n-card>

    <!-- Code Output Section -->
    <n-card size="small" :title="`Generated ${targetLanguage.toUpperCase()} Code`" class="mb-4">
      <TextareaCopyable
        :value="generatedOutput"
        :language="syntaxHighlightLang"
      />
    </n-card>

    <!-- Privacy Trust Badge -->
    <div class="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
      <span>🔒</span>
      <span>
        <strong>100% Client-Side Privacy:</strong> Your cURL commands, API secret keys, authorization tokens, and request payloads are parsed entirely inside your browser sandbox. Zero data is ever logged or transmitted to any server.
      </span>
    </div>
  </div>
</template>

<style scoped>
.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
</style>
