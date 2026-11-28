<script setup lang="ts">
import { ref } from 'vue';
import { useMessage } from 'naive-ui';
import { PDFDocument, degrees } from 'pdf-lib';

const message = useMessage();
const file = ref<File | null>(null);
const pageCount = ref(0);
const pages = ref<{ index: number;rotation: number }[]>([]);
const isLoading = ref(false);
const isProcessing = ref(false);
const resultUrl = ref<string | null>(null);
async function onFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (!f) {
    return;
  }
  file.value = f;
  isLoading.value = true;
  pages.value = [];
  try {
    const bytes = await f.arrayBuffer();
    const doc = await PDFDocument.load(bytes);
    pageCount.value = doc.getPageCount();
    pages.value = Array.from({ length: pageCount.value }, (_, i) => ({ index: i, rotation: 0 }));
  }
  catch { message.error('Failed to read PDF'); }
  finally { isLoading.value = false; }
}
function rotate(i: number, deg: number) {
  pages.value[i].rotation = (pages.value[i].rotation + deg + 360) % 360;
}
function moveUp(i: number) {
  if (i > 0) {
    const t = pages.value[i];
    pages.value[i] = pages.value[i - 1];
    pages.value[i - 1] = t;
  }
}
function moveDown(i: number) {
  if (i < pages.value.length - 1) {
    const t = pages.value[i];
    pages.value[i] = pages.value[i + 1];
    pages.value[i + 1] = t;
  }
}
async function apply() {
  if (!file.value) {
    return;
  }
  isProcessing.value = true;
  resultUrl.value = null;
  try {
    const bytes = await file.value.arrayBuffer();
    const srcDoc = await PDFDocument.load(bytes);
    const newDoc = await PDFDocument.create();
    for (const pg of pages.value) {
      const [copied] = await newDoc.copyPages(srcDoc, [pg.index]);
      copied.setRotation(degrees(pg.rotation));
      newDoc.addPage(copied);
    }
    const out = await newDoc.save();
    const blob = new Blob([out], { type: 'application/pdf' });
    resultUrl.value = URL.createObjectURL(blob);
    message.success('PDF organized successfully!');
  }
  catch (err: any) { message.error(err?.message || 'Failed'); }
  finally { isProcessing.value = false; }
}
function download() {
  if (!resultUrl.value) {
    return;
  }
  const a = document.createElement('a');
  a.href = resultUrl.value;
  a.download = 'organized.pdf';
  a.click();
}
</script>

<template>
  <div style="max-width:700px;margin:0 auto">
    <c-card title="Upload PDF" mb-4>
      <div style="border:2px dashed var(--n-border-color);border-radius:8px;padding:24px;text-align:center;cursor:pointer" @click="($refs.fi as HTMLInputElement).click()">
        <p style="color:var(--n-text-color-3)">
          {{ file ? file.name : 'Click to select PDF' }}
        </p>
        <input ref="fi" type="file" accept=".pdf" style="display:none" @change="onFile">
      </div>
      <n-spin v-if="isLoading" mt-2 />
    </c-card>
    <c-card v-if="pages.length > 0" title="Organize Pages" mb-4>
      <p mb-3 text-sm style="color:var(--n-text-color-3)">
        Reorder with ↑↓ and rotate each page. Then click Apply.
      </p>
      <n-list>
        <n-list-item v-for="(pg, i) in pages" :key="i">
          <div flex items-center gap-2>
            <span style="min-width:24px;font-weight:600">{{ i + 1 }}</span>
            <span flex-1 text-sm>Page {{ pg.index + 1 }} · {{ pg.rotation }}° rotation</span>
            <c-button size="small" variant="text" @click="rotate(i, -90)">
              ↺
            </c-button>
            <c-button size="small" variant="text" @click="rotate(i, 90)">
              ↻
            </c-button>
            <c-button size="small" variant="text" :disabled="i === 0" @click="moveUp(i)">
              ↑
            </c-button>
            <c-button size="small" variant="text" :disabled="i === pages.length - 1" @click="moveDown(i)">
              ↓
            </c-button>
          </div>
        </n-list-item>
      </n-list>
      <c-button mt-4 :disabled="isProcessing" @click="apply">
        <n-spin v-if="isProcessing" size="small" mr-2 />{{ isProcessing ? "Applying..." : "Apply & Download" }}
      </c-button>
    </c-card>
    <c-card v-if="resultUrl" style="border:1px solid var(--n-success-color)">
      <div flex items-center justify-between gap-2>
        <span>✅ PDF organized!</span>
        <c-button @click="download">
          Download organized.pdf
        </c-button>
      </div>
    </c-card>
  </div>
</template>
