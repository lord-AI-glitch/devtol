<script setup lang="ts">
import { ref, computed } from 'vue';
import { useMessage } from 'naive-ui';
import { PDFDocument } from 'pdf-lib';

const message = useMessage();
const files = ref<File[]>([]);
const isProcessing = ref(false);
const resultUrl = ref<string | null>(null);
const resultSize = ref(0);

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  if (input.files) files.value = [...files.value, ...Array.from(input.files)];
}

function removeFile(i: number) {
  files.value.splice(i, 1);
}

function formatBytes(b: number) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(2) + ' MB';
}

const totalSize = computed(() => files.value.reduce((a, f) => a + f.size, 0));

async function mergePDFs() {
  if (files.value.length < 2) { message.warning('Please add at least 2 PDF files'); return; }
  isProcessing.value = true;
  resultUrl.value = null;
  try {
    const merged = await PDFDocument.create();
    for (const file of files.value) {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const pages = await merged.copyPages(doc, doc.getPageIndices());
      pages.forEach(p => merged.addPage(p));
    }
    const pdfBytes = await merged.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    resultUrl.value = URL.createObjectURL(blob);
    resultSize.value = blob.size;
    message.success('PDF merged successfully!');
  } catch (err: any) {
    message.error('Error: ' + (err?.message || 'Failed to merge PDFs'));
  } finally {
    isProcessing.value = false;
  }
}

function download() {
  if (!resultUrl.value) return;
  const a = document.createElement('a');
  a.href = resultUrl.value;
  a.download = 'merged.pdf';
  a.click();
}
</script>

<template>
  <div style="max-width: 700px; margin: 0 auto;">
    <c-card title="Upload PDF Files" mb-4>
      <div
        style="border: 2px dashed var(--n-border-color); border-radius: 8px; padding: 32px; text-align: center; cursor: pointer;"
        @click="($refs.fileInput as HTMLInputElement).click()"
      >
        <n-icon size="40" style="color: var(--n-text-color-3)"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg></n-icon>
        <p mt-2 text-sm style="color: var(--n-text-color-2)">Click to add PDF files or drag & drop</p>
        <input ref="fileInput" type="file" accept=".pdf" multiple style="display:none" @change="onFileChange" />
      </div>
    </c-card>

    <c-card v-if="files.length > 0" title="Files to Merge" mb-4>
      <n-list>
        <n-list-item v-for="(file, i) in files" :key="i">
          <n-thing :title="file.name" :description="formatBytes(file.size)" />
          <template #suffix>
            <c-button size="small" variant="text" @click="removeFile(i)">Remove</c-button>
          </template>
        </n-list-item>
      </n-list>
      <div mt-4 flex gap-2 justify-between items-center>
        <span text-sm style="color: var(--n-text-color-3)">{{ files.length }} files · {{ formatBytes(totalSize) }} total</span>
        <c-button :disabled="isProcessing || files.length < 2" @click="mergePDFs">
          <n-spin v-if="isProcessing" size="small" mr-2 />
          {{ isProcessing ? 'Merging...' : 'Merge PDFs' }}
        </c-button>
      </div>
    </c-card>

    <c-card v-if="resultUrl" title="Result" style="border: 1px solid var(--n-success-color);">
      <div flex gap-2 items-center justify-between>
        <span>✅ Merged PDF ready · {{ formatBytes(resultSize) }}</span>
        <c-button @click="download">Download merged.pdf</c-button>
      </div>
    </c-card>
  </div>
</template>
