<script setup lang="ts">
import { ref } from 'vue';
import { useMessage } from 'naive-ui';
import { PDFDocument } from 'pdf-lib';

const message = useMessage();
const file = ref<File | null>(null);
const pageCount = ref(0);
const pageRange = ref('');
const isProcessing = ref(false);
const resultUrl = ref<string | null>(null);
const isLoading = ref(false);

function formatBytes(b: number) {
  if (b < 1048576) {
    return `${(b / 1024).toFixed(1)} KB`;
  }
  return `${(b / 1048576).toFixed(2)} MB`;
}

async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  if (!input.files?.[0]) {
    return;
  }
  file.value = input.files[0];
  isLoading.value = true;
  try {
    const bytes = await file.value.arrayBuffer();
    const doc = await PDFDocument.load(bytes);
    pageCount.value = doc.getPageCount();
    pageRange.value = `1-${pageCount.value}`;
  }
  catch {
    message.error('Failed to read PDF. Is it a valid PDF file?');
    file.value = null;
  }
  finally {
    isLoading.value = false;
  }
}

function parseRanges(input: string, max: number): number[] {
  const pages = new Set<number>();
  for (const part of input.split(',')) {
    const [start, end] = part.trim().split('-').map(Number);
    if (!Number.isNaN(start) && !Number.isNaN(end)) {
      for (let i = start; i <= end; i++) {
        if (i >= 1 && i <= max) {
          pages.add(i - 1);
        }
      }
    }
    else if (!Number.isNaN(start) && start >= 1 && start <= max) {
      pages.add(start - 1);
    }
  }
  return [...pages].sort((a, b) => a - b);
}

async function extractPages() {
  if (!file.value) {
    return;
  }
  const indices = parseRanges(pageRange.value, pageCount.value);
  if (indices.length === 0) {
    message.error('No valid pages in range');
    return;
  }
  isProcessing.value = true;
  resultUrl.value = null;
  try {
    const bytes = await file.value.arrayBuffer();
    const srcDoc = await PDFDocument.load(bytes);
    const newDoc = await PDFDocument.create();
    const copied = await newDoc.copyPages(srcDoc, indices);
    copied.forEach(p => newDoc.addPage(p));
    const pdfBytes = await newDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    resultUrl.value = URL.createObjectURL(blob);
    message.success(`Extracted ${indices.length} page(s) successfully!`);
  }
  catch (err: any) {
    message.error(`Error: ${err?.message || 'Failed to extract pages'}`);
  }
  finally {
    isProcessing.value = false;
  }
}

function download() {
  if (!resultUrl.value) {
    return;
  }
  const a = document.createElement('a');
  a.href = resultUrl.value;
  a.download = 'extracted.pdf';
  a.click();
}
</script>

<template>
  <div style="max-width: 600px; margin: 0 auto;">
    <c-card title="Upload PDF" mb-4>
      <div
        style="border: 2px dashed var(--n-border-color); border-radius: 8px; padding: 32px; text-align: center; cursor: pointer;"
        @click="($refs.fi as HTMLInputElement).click()"
      >
        <p v-if="!file" style="color: var(--n-text-color-3)">
          Click to select a PDF file
        </p>
        <p v-else font-semibold>
          {{ file.name }} · {{ formatBytes(file.size) }}
        </p>
        <input ref="fi" type="file" accept=".pdf" style="display:none" @change="onFileChange">
      </div>
      <n-spin v-if="isLoading" mt-3 />
    </c-card>

    <c-card v-if="pageCount > 0" title="Extract Pages" mb-4>
      <p mb-2 text-sm style="color: var(--n-text-color-2)">
        PDF has <b>{{ pageCount }}</b> pages. Enter page range to extract:
      </p>
      <n-input v-model:value="pageRange" placeholder="e.g. 1-3, 5, 7-9" mb-3 />
      <p style="color: var(--n-text-color-3)" mb-3 text-xs>
        Use commas to separate ranges. Example: 1-3, 5, 8-10
      </p>
      <c-button :disabled="isProcessing" @click="extractPages">
        <n-spin v-if="isProcessing" size="small" mr-2 />
        {{ isProcessing ? 'Extracting...' : 'Extract Pages' }}
      </c-button>
    </c-card>

    <c-card v-if="resultUrl" title="Result" style="border: 1px solid var(--n-success-color);">
      <div flex items-center justify-between gap-2>
        <span>✅ Pages extracted successfully</span>
        <c-button @click="download">
          Download extracted.pdf
        </c-button>
      </div>
    </c-card>
  </div>
</template>
