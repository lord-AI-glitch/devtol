<script setup lang="ts">
import { computed } from 'vue';
import { useStyleStore } from '@/stores/style.store';

interface Props {
  slotId?: string;
  adClient?: string;
  format?: 'horizontal' | 'rectangle' | 'vertical' | 'responsive';
  minHeight?: string;
}

const props = withDefaults(defineProps<Props>(), {
  slotId: '1234567890',
  adClient: 'ca-pub-XXXXXXXXXXXXXXXX',
  format: 'horizontal',
  minHeight: '120px',
});

const styleStore = useStyleStore();

// Preset aspect ratios and min-heights to eliminate Layout Shifts (CLS)
const formatStyles = computed(() => {
  switch (props.format) {
    case 'rectangle':
      return { minHeight: '280px', maxWidth: '336px' };
    case 'vertical':
      return { minHeight: '600px', maxWidth: '300px' };
    case 'horizontal':
    case 'responsive':
    default:
      return { minHeight: props.minHeight, maxWidth: '100%' };
  }
});
</script>

<template>
  <div
    class="adsense-unit-wrapper relative w-full overflow-hidden transition-all duration-300"
    :style="formatStyles"
    role="region"
    aria-label="Sponsored Content"
  >
    <!-- Skeleton / Placeholder container reserving exact bounding box -->
    <div
      class="adsense-placeholder flex flex-col items-center justify-center w-full h-full rounded-xl border p-4 text-center select-none"
      :class="[
        styleStore.isDarkTheme
          ? 'bg-[#15152A]/80 border-[#282845] text-slate-400'
          : 'bg-slate-50/90 border-slate-200 text-slate-500'
      ]"
      :style="{ minHeight: formatStyles.minHeight }"
    >
      <!-- Subtle Ad Label -->
      <div class="flex items-center gap-1.5 mb-2">
        <span
          class="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded"
          :class="[
            styleStore.isDarkTheme
              ? 'bg-[#1E1B4B] text-indigo-300 border border-[#312E81]'
              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
          ]"
        >
          Sponsored
        </span>
      </div>

      <!-- Content Area / Fallback notice -->
      <div class="text-xs font-mono opacity-60 flex items-center gap-1">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
        <span>AdSense Safe Zone &bull; Zero CLS Spaceholder</span>
      </div>

      <!-- Ins tag for Google AdSense engine -->
      <ins
        class="adsbygoogle w-full"
        style="display:block"
        :data-ad-client="adClient"
        :data-ad-slot="slotId"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  </div>
</template>

<style scoped>
.adsense-unit-wrapper {
  contain: layout paint;
}
</style>
