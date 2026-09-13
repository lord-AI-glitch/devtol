<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useStyleStore } from '@/stores/style.store';

interface Props {
  slotId?: string;
  adClient?: string;
  format?: 'horizontal' | 'rectangle' | 'vertical' | 'responsive';
  minHeight?: string;
}

const props = withDefaults(defineProps<Props>(), {
  slotId: '1234567890',
  adClient: 'ca-pub-3672531286921744',
  format: 'horizontal',
  minHeight: '120px',
});

const styleStore = useStyleStore();

onMounted(() => {
  try {
    // @ts-expect-error window.adsbygoogle
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch (_) {}
});

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
    class="adsense-unit-wrapper relative w-full overflow-hidden"
    role="region"
    aria-label="Sponsored Content"
  >
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
</template>

<style scoped>
.adsense-unit-wrapper {
  contain: layout paint;
}
</style>
