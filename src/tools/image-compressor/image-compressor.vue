<script setup lang="ts">
import { computed, ref } from 'vue';
import { useMessage } from 'naive-ui';

const message = useMessage();
const file = ref<File | null>(null);
const quality = ref(75);
const original = ref<{ size: number;url: string } | null>(null);
const compressed = ref<{ size: number;url: string;blob: Blob } | null>(null);
const isProcessing = ref(false);
const format = ref('image/jpeg');
const formatOptions = [{ label: 'JPEG', value: 'image/jpeg' }, { label: 'PNG', value: 'image/png' }, { label: 'WebP', value: 'image/webp' }];
function fmt(b: number) {
  return b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(2)} MB`;
}
const savings = computed(() => original.value && compressed.value ? Math.round((1 - compressed.value.size / original.value.size) * 100) : 0);
async function onFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (!f) {
    return;
  }
  file.value = f;
  original.value = { size: f.size, url: URL.createObjectURL(f) };
  compressed.value = null;
}
async function compress() {
  if (!file.value) {
    return;
  }
  isProcessing.value = true;
  try {
    const img = new Image();
    img.src = original.value!.url;
    await new Promise(resolve => img.onload = resolve);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext('2d')!.drawImage(img, 0, 0);
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('Compression failed')), format.value, quality.value / 100));
    compressed.value = { size: blob.size, url: URL.createObjectURL(blob), blob };
    message.success(`Compressed! Saved ${savings.value}%`);
  }
  catch (e: any) { message.error(e.message); }
  finally { isProcessing.value = false; }
}
function download() {
  if (!compressed.value) {
    return;
  }
  const ext = format.value.split('/')[1];
  const a = document.createElement('a');
  a.href = compressed.value.url;
  a.download = `compressed.${ext}`;
  a.click();
}
</script>

<template>
  <div style="max-width:800px;margin:0 auto">
    <c-card title="Upload Image" mb-4>
      <div style="border:2px dashed var(--n-border-color);border-radius:8px;padding:32px;text-align:center;cursor:pointer" @click="($refs.fi as HTMLInputElement).click()">
        <p style="color:var(--n-text-color-3)">
          {{ file ? file.name : 'Click to select image (JPG, PNG, WebP)' }}
        </p>
        <input ref="fi" type="file" accept="image/*" style="display:none" @change="onFile">
      </div>
    </c-card>
    <c-card v-if="file" title="Settings" mb-4>
      <n-form-item label="Output Format">
        <n-select v-model:value="format" :options="formatOptions" style="width:160px" />
      </n-form-item>
      <n-form-item :label="`Quality: ${quality}%`">
        <n-slider v-model:value="quality" :min="1" :max="100" />
      </n-form-item>
      <c-button :disabled="isProcessing" @click="compress">
        <n-spin v-if="isProcessing" size="small" mr-2 />{{ isProcessing ? "Compressing..." : "Compress Image" }}
      </c-button>
    </c-card>
    <n-grid v-if="compressed" :cols="2" :x-gap="16" mb-4>
      <n-gi>
        <c-card>
          <img :src="original!.url" style="width:100%;border-radius:6px"><p mt-2 text-center text-sm>
            Original: {{ fmt(original!.size) }}
          </p>
        </c-card>
      </n-gi>
      <n-gi>
        <c-card>
          <img :src="compressed.url" style="width:100%;border-radius:6px"><p mt-2 text-center text-sm>
            Compressed: {{ fmt(compressed.size) }}
          </p>
        </c-card>
      </n-gi>
    </n-grid>
    <c-card v-if="compressed" style="border:1px solid var(--n-success-color)">
      <div flex items-center justify-between gap-2>
        <n-tag type="success">
          Saved {{ savings }}%
        </n-tag>
        <c-button @click="download">
          Download Compressed
        </c-button>
      </div>
    </c-card>
  </div>
</template>
