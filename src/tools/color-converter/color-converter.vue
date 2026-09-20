<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useHead } from '@vueuse/head';
import type { Colord } from 'colord';
import { colord, extend } from 'colord';
import _ from 'lodash';
import cmykPlugin from 'colord/plugins/cmyk';
import hwbPlugin from 'colord/plugins/hwb';
import namesPlugin from 'colord/plugins/names';
import lchPlugin from 'colord/plugins/lch';
import { buildColorFormat } from './color-converter.models';
import { Palette, Check } from '@vicons/tabler';

extend([cmykPlugin, hwbPlugin, namesPlugin, lchPlugin]);

const COLOR_PAIRS: Record<
  string,
  { from: string; to: string; title: string; desc: string }
> = {
  'hex-to-rgb': {
    from: 'hex',
    to: 'rgb',
    title: 'HEX to RGB Color Converter',
    desc: 'Convert HEX color codes to RGB values instantly with real-time preview',
  },
  'rgb-to-hex': {
    from: 'rgb',
    to: 'hex',
    title: 'RGB to HEX Color Converter',
    desc: 'Convert RGB color values to hexadecimal format instantly with real-time preview',
  },
  'hex-to-hsl': {
    from: 'hex',
    to: 'hsl',
    title: 'HEX to HSL Color Converter',
    desc: 'Convert HEX colors to HSL (Hue, Saturation, Lightness) values for CSS',
  },
  'rgb-to-hsl': {
    from: 'rgb',
    to: 'hsl',
    title: 'RGB to HSL Color Converter',
    desc: 'Convert RGB colors to HSL notation for modern UI/UX design systems',
  },
  'cmyk-to-rgb': {
    from: 'cmyk',
    to: 'rgb',
    title: 'CMYK to RGB Color Converter',
    desc: 'Convert print CMYK ink colors to digital RGB screen colors accurately',
  },
};

const route = useRoute();
const router = useRouter();

const activePairKey = ref<string>('');

const formats = {
  picker: buildColorFormat({
    label: 'color picker',
    format: (v: Colord) => v.toHex(),
    type: 'color-picker',
  }),
  hex: buildColorFormat({
    label: 'hex',
    format: (v: Colord) => v.toHex(),
    placeholder: 'e.g. #ff0000',
  }),
  rgb: buildColorFormat({
    label: 'rgb',
    format: (v: Colord) => v.toRgbString(),
    placeholder: 'e.g. rgb(255, 0, 0)',
  }),
  hsl: buildColorFormat({
    label: 'hsl',
    format: (v: Colord) => v.toHslString(),
    placeholder: 'e.g. hsl(0, 100%, 50%)',
  }),
  hwb: buildColorFormat({
    label: 'hwb',
    format: (v: Colord) => v.toHwbString(),
    placeholder: 'e.g. hwb(0, 0%, 0%)',
  }),
  lch: buildColorFormat({
    label: 'lch',
    format: (v: Colord) => v.toLchString(),
    placeholder: 'e.g. lch(53.24, 104.55, 40.85)',
  }),
  cmyk: buildColorFormat({
    label: 'cmyk',
    format: (v: Colord) => v.toCmykString(),
    placeholder: 'e.g. cmyk(0, 100%, 100%, 0)',
  }),
  name: buildColorFormat({
    label: 'name',
    format: (v: Colord) => v.toName({ closest: true }) ?? 'Unknown',
    placeholder: 'e.g. red',
  }),
};

updateColorValue(colord('#1ea54c'));

function updateColorValue(value: Colord | undefined, omitLabel?: string) {
  if (value === undefined || !value.isValid()) {
    return;
  }

  _.forEach(formats, ({ value: valueRef, format }, key) => {
    if (key !== omitLabel) {
      valueRef.value = format(value);
    }
  });
}

function selectPair(pairKey: string, updateUrl = true) {
  if (COLOR_PAIRS[pairKey]) {
    activePairKey.value = pairKey;
    if (updateUrl) {
      const langPrefix = route.path.match(/^\/(ar|de|es|fr|no|pt|uk|vi|zh)/);
      const prefix = langPrefix ? `/${langPrefix[1]}` : '';
      router.replace(`${prefix}/color-converter/${pairKey}`);
    }
  } else {
    activePairKey.value = '';
  }
}

onMounted(() => {
  const param = (route.params.pair as string) || '';
  if (param && COLOR_PAIRS[param.toLowerCase()]) {
    selectPair(param.toLowerCase(), false);
  } else {
    const pathParts = route.path.split('/').filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1]?.toLowerCase();
    if (lastPart && COLOR_PAIRS[lastPart]) {
      selectPair(lastPart, false);
    }
  }
});

watch(
  () => route.params.pair,
  newPair => {
    if (newPair && typeof newPair === 'string' && COLOR_PAIRS[newPair.toLowerCase()]) {
      activePairKey.value = newPair.toLowerCase();
    }
  },
);

const activePair = computed(() => COLOR_PAIRS[activePairKey.value]);

useHead(
  computed(() => {
    if (!activePair.value) {
      return {};
    }
    return {
      title: `${activePair.value.title} | DevTol`,
      meta: [
        {
          name: 'description',
          content: `${activePair.value.desc}. Free online developer tool with 100% client-side privacy.`,
        },
      ],
    };
  }),
);

function isHighlighted(formatKey: string): boolean {
  if (!activePair.value) return false;
  return formatKey === activePair.value.from || formatKey === activePair.value.to;
}
</script>

<template>
  <div class="space-y-4">
    <!-- Pair shortcuts bar -->
    <div class="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <n-icon :size="18" class="text-primary-500"><Palette /></n-icon>
          <span class="text-xs font-semibold text-slate-700 dark:text-slate-200">
            Quick Conversion Pairs:
          </span>
        </div>
        <span v-if="activePair" class="text-xs text-primary-600 dark:text-primary-400 font-medium">
          {{ activePair.title }}
        </span>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="(pair, key) in COLOR_PAIRS"
          :key="key"
          type="button"
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all"
          :class="[
            activePairKey === key
              ? 'bg-primary-600 text-white shadow-sm font-semibold'
              : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:border-primary-400'
          ]"
          @click="selectPair(key as string)"
        >
          <n-icon v-if="activePairKey === key" :size="12"><Check /></n-icon>
          <span>{{ key.toUpperCase() }}</span>
        </button>
      </div>
    </div>

    <!-- Color inputs list -->
    <c-card>
      <template v-for="({ label, parse, placeholder, validation, type }, key) in formats" :key="key">
        <div
          :class="[
            isHighlighted(key)
              ? 'p-2 rounded-lg bg-primary-50/50 dark:bg-primary-950/20 border border-primary-300 dark:border-primary-700/50 my-1'
              : ''
          ]"
        >
          <input-copyable
            v-if="type === 'text'"
            v-model:value="formats[key].value.value"
            :test-id="`input-${key}`"
            :label="`${label.toUpperCase()}:`"
            label-position="left"
            label-width="100px"
            label-align="right"
            :placeholder="placeholder"
            :validation="validation"
            raw-text
            clearable
            @update:value="(v:string) => updateColorValue(parse(v), key)"
          />

          <n-form-item
            v-else-if="type === 'color-picker'"
            :label="`${label}:`"
            label-width="100"
            label-placement="left"
            :show-feedback="false"
          >
            <n-color-picker
              v-model:value="formats[key].value.value"
              placement="bottom-end"
              @update:value="(v:string) => updateColorValue(parse(v), key)"
            />
          </n-form-item>
        </div>
      </template>
    </c-card>
  </div>
</template>
