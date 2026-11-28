<script setup lang="ts">
import { ref } from 'vue';
import { useMessage } from 'naive-ui';
import { PDFDocument } from 'pdf-lib';

const message = useMessage();
const images = ref<{ file: File;url: string }[]>([]);
const isProcessing = ref(false);
const resultUrl = ref<string | null>(null);

function onFile(e: Event) {
  const files = (e.target as HTMLInputElement).files;
  if (!files) {
    return;
  }
  for (const f of Array.from(files)) {
    const isImage = (f.type && f.type.startsWith('image/')) || /\.(jpe?g|png|webp|gif|bmp|tiff|svg|avif|ico)$/i.test(f.name);
    if (!isImage) {
      continue;
    }
    images.value.push({ file: f, url: URL.createObjectURL(f) });
  }
}
function remove(i: number) {
  images.value.splice(i, 1);
}
function moveUp(i: number) {
  if (i > 0) {
    const t = images.value[i];
    images.value[i] = images.value[i - 1];
    images.value[i - 1] = t;
  }
}
function moveDown(i: number) {
  if (i < images.value.length - 1) {
    const t = images.value[i];
    images.value[i] = images.value[i + 1];
    images.value[i + 1] = t;
  }
}

async function embedViaCanvas(file: File, pdf: InstanceType<typeof PDFDocument>) {
  const imgElement = new Image();
  const objUrl = URL.createObjectURL(file);
  imgElement.src = objUrl;
  await new Promise((resolve, reject) => {
    imgElement.onload = resolve;
    imgElement.onerror = () => reject(new Error('Failed to load image into canvas'));
  });
  URL.revokeObjectURL(objUrl);
  const canvas = document.createElement('canvas');
  canvas.width = imgElement.naturalWidth || imgElement.width;
  canvas.height = imgElement.naturalHeight || imgElement.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(imgElement, 0, 0);
  const jpgDataUrl = canvas.toDataURL('image/jpeg', 0.95);
  const binaryString = atob(jpgDataUrl.split(',')[1]);
  const len = binaryString.length;
  const jpgBytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    jpgBytes[i] = binaryString.charCodeAt(i);
  }
  return await pdf.embedJpg(jpgBytes);
}

async function convert() {
  if (images.value.length === 0) {
    message.warning('Add at least 1 image');
    return;
  }
  isProcessing.value = true;
  resultUrl.value = null;
  try {
    const pdf = await PDFDocument.create();
    for (const { file } of images.value) {
      const bytes = await file.arrayBuffer();
      let img;
      if (file.type === 'image/png') {
        try {
          img = await pdf.embedPng(bytes);
        }
        catch {
          img = await embedViaCanvas(file, pdf);
        }
      }
      else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
        try {
          img = await pdf.embedJpg(bytes);
        }
        catch {
          img = await embedViaCanvas(file, pdf);
        }
      }
      else {
        img = await embedViaCanvas(file, pdf);
      }
      const page = pdf.addPage([img.width, img.height]);
      page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    }
    const out = await pdf.save();
    const blob = new Blob([out], { type: 'application/pdf' });
    resultUrl.value = URL.createObjectURL(blob);
    message.success(`PDF created from ${images.value.length} image(s)!`);
  }
  catch (err: any) { message.error(err?.message || 'Failed to create PDF'); }
  finally { isProcessing.value = false; }
}
function download() {
  if (!resultUrl.value) {
    return;
  }
  const a = document.createElement('a');
  a.href = resultUrl.value;
  a.download = 'images.pdf';
  a.click();
}
</script>

<template>
  <div style="max-width:700px;margin:0 auto">
    <c-card title="Upload Images" mb-4>
      <div style="border:2px dashed var(--n-border-color);border-radius:8px;padding:32px;text-align:center;cursor:pointer" @click="($refs.fi as HTMLInputElement).click()">
        <p style="color:var(--n-text-color-3)">
          Click to add JPG, PNG, or WebP images
        </p>
        <input ref="fi" type="file" accept="image/*" multiple style="display:none" @change="onFile">
      </div>
    </c-card>
    <c-card v-if="images.length > 0" title="Image Order" mb-4>
      <n-list>
        <n-list-item v-for="(img, i) in images" :key="i">
          <div flex items-center gap-3>
            <img :src="img.url" style="width:60px;height:60px;object-fit:cover;border-radius:4px">
            <span flex-1 text-sm>{{ img.file.name }}</span>
            <c-button size="small" variant="text" :disabled="i === 0" @click="moveUp(i)">
              ↑
            </c-button>
            <c-button size="small" variant="text" :disabled="i === images.length - 1" @click="moveDown(i)">
              ↓
            </c-button>
            <c-button size="small" variant="text" @click="remove(i)">
              ✕
            </c-button>
          </div>
        </n-list-item>
      </n-list>
      <div mt-4>
        <c-button :disabled="isProcessing" @click="convert">
          <n-spin v-if="isProcessing" size="small" mr-2 />
          {{ isProcessing ? 'Creating PDF...' : 'Create PDF' }}
        </c-button>
      </div>
    </c-card>
    <c-card v-if="resultUrl" title="Result" style="border:1px solid var(--n-success-color)">
      <div flex items-center justify-between gap-2>
        <span>✅ PDF created from {{ images.length }} images</span>
        <c-button @click="download">
          Download images.pdf
        </c-button>
      </div>
    </c-card>
  </div>
</template>
