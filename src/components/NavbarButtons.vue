<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { IconBook, IconFileTypePdf, IconGift, IconInfoCircle, IconMoon, IconSun } from '@tabler/icons-vue';
import { useStyleStore } from '@/stores/style.store';

const styleStore = useStyleStore();
const { isDarkTheme } = toRefs(styleStore);
const route = useRoute();

const currentLangPrefix = computed(() => {
  const p = route?.path || '';
  const match = p.match(/^\/(ar|de|es|fr|no|pt|uk|vi|zh)(?:\/|$)/);
  return match ? `/${match[1]}` : '';
});
</script>

<template>
  <c-tooltip :tooltip="$t('home.nav.pdfTools', 'PDF Tools Suite')" position="bottom">
    <c-button circle variant="text" :to="`${currentLangPrefix}/pdf-tools`" :aria-label="$t('home.nav.pdfTools', 'PDF Tools Suite')">
      <n-icon size="25" :component="IconFileTypePdf" class="text-red-500 hover:text-red-600" />
    </c-button>
  </c-tooltip>

  <c-tooltip :tooltip="$t('home.nav.guides', 'Developer Guides')" position="bottom">
    <c-button circle variant="text" :to="`${currentLangPrefix}/guides`" :aria-label="$t('home.nav.guides', 'Developer Guides')">
      <n-icon size="25" :component="IconBook" />
    </c-button>
  </c-tooltip>

  <c-tooltip :tooltip="$t('home.nav.deals')" position="bottom">
    <c-button circle variant="text" :to="`${currentLangPrefix}/deals`" :aria-label="$t('home.nav.deals')">
      <n-icon size="25" :component="IconGift" />
    </c-button>
  </c-tooltip>

  <c-tooltip :tooltip="$t('home.nav.about')" position="bottom">
    <c-button circle variant="text" :to="`${currentLangPrefix}/about`" :aria-label="$t('home.nav.aboutLabel')">
      <n-icon size="25" :component="IconInfoCircle" />
    </c-button>
  </c-tooltip>

  <c-tooltip :tooltip="isDarkTheme ? $t('home.nav.lightMode') : $t('home.nav.darkMode')" position="bottom">
    <c-button circle variant="text" :aria-label="$t('home.nav.mode')" @click="() => styleStore.toggleDark()">
      <n-icon v-if="isDarkTheme" size="25" :component="IconSun" />
      <n-icon v-else size="25" :component="IconMoon" />
    </c-button>
  </c-tooltip>
</template>

<style lang="less" scoped>
.n-button {
  &:not(:last-child) {
    margin-right: 5px;
  }
}
</style>
