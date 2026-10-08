<script setup lang="ts">
import { ref, watch } from 'vue';
import { useMessage } from 'naive-ui';
import { colord, extend } from 'colord';
import a11yPlugin from 'colord/plugins/a11y';
import cmykPlugin from 'colord/plugins/cmyk';

extend([a11yPlugin, cmykPlugin]);

const message = useMessage();
const hex = ref('#4F9CFF');
const formats = ref<any>(null);
const isLoading = ref(false);

function rgbToHsv(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

function analyze() {
  try {
    const c = colord(hex.value);
    if (!c.isValid()) return;

    const { r, g, b } = c.toRgb();
    const { h, s, l } = c.toHsl();
    const hsv = rgbToHsv(r, g, b);
    const cmyk = c.toCmyk();
    const wcagW = c.contrast('#ffffff');
    const wcagB = c.contrast('#000000');

    const baseHex = c.toHex().toUpperCase();
    const palette = {
      complementary: [baseHex, c.rotate(180).toHex().toUpperCase()],
      triadic: [baseHex, c.rotate(120).toHex().toUpperCase(), c.rotate(240).toHex().toUpperCase()],
      analogous: [c.rotate(-30).toHex().toUpperCase(), baseHex, c.rotate(30).toHex().toUpperCase()],
      splitComplementary: [baseHex, c.rotate(150).toHex().toUpperCase(), c.rotate(210).toHex().toUpperCase()],
      tetradic: [baseHex, c.rotate(90).toHex().toUpperCase(), c.rotate(180).toHex().toUpperCase(), c.rotate(270).toHex().toUpperCase()],
    };

    formats.value = {
      hex: baseHex,
      rgb: `rgb(${r}, ${g}, ${b})`,
      hsl: `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`,
      hsv: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
      cmyk: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
      wcagWhite: { ratio: wcagW.toFixed(2), pass: wcagW >= 4.5 ? 'AA' : 'Fail' },
      wcagBlack: { ratio: wcagB.toFixed(2), pass: wcagB >= 4.5 ? 'AA' : 'Fail' },
      palette,
    };
  } catch (e: any) {
    message.error(e.message);
  }
}

watch(hex, analyze, { immediate: true });
function copy(v: string) {
  navigator.clipboard.writeText(v);
  message.success('Copied: ' + v);
}
</script>
<template>
  <div style="max-width:800px;margin:0 auto">
    <c-card mb-4>
      <div flex gap-4 items-center>
        <div :style="{width:'80px',height:'80px',background:hex,borderRadius:'12px',flexShrink:0}"/>
        <div flex-1>
          <n-form-item label="Color (HEX)">
            <n-input v-model:value="hex" placeholder="#4F9CFF" style="font-family:monospace;width:160px" maxlength="7"/>
          </n-form-item>
        </div>
        <n-color-picker v-model:value="hex" :show-alpha="false" style="width:40px"/>
      </div>
    </c-card>
    <n-spin v-if="isLoading" size="small" mb-4/>
    <template v-if="formats">
      <n-grid :cols="2" :x-gap="16" mb-4>
        <n-gi v-for="(val,key) in {HEX:formats.hex,RGB:formats.rgb,HSL:formats.hsl,HSV:formats.hsv,CMYK:formats.cmyk}" :key="key">
          <c-card>
            <div flex justify-between items-center>
              <div><p text-xs style="color:var(--n-text-color-3)">{{ key }}</p><p font-mono font-semibold>{{ val }}</p></div>
              <c-button size="small" variant="text" @click="copy(val as string)">Copy</c-button>
            </div>
          </c-card>
        </n-gi>
      </n-grid>
      <n-grid :cols="2" :x-gap="16" mb-4>
        <n-gi><c-card title="WCAG vs White"><n-tag :type="Number(formats.wcagWhite.ratio)>=4.5?'success':'error'">Contrast: {{ formats.wcagWhite.ratio }}:1 — {{ formats.wcagWhite.pass }}</n-tag></c-card></n-gi>
        <n-gi><c-card title="WCAG vs Black"><n-tag :type="Number(formats.wcagBlack.ratio)>=4.5?'success':'error'">Contrast: {{ formats.wcagBlack.ratio }}:1 — {{ formats.wcagBlack.pass }}</n-tag></c-card></n-gi>
      </n-grid>
      <c-card title="Color Palette">
        <div v-for="(colors,type) in formats.palette" :key="type" mb-4>
          <p text-sm mb-2 font-semibold style="text-transform:capitalize">{{ type }}</p>
          <div flex gap-2>
            <div v-for="c in colors" :key="c" :style="{background:c,width:'60px',height:'60px',borderRadius:'8px',cursor:'pointer'}" :title="c" @click="copy(c)"/>
          </div>
        </div>
      </c-card>
    </template>
  </div>
</template>
