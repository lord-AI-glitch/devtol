import { defineAsyncComponent } from 'vue';
import BaseLayout from './base.layout.vue';

export const layouts = {
  base: BaseLayout,
  toolLayout: defineAsyncComponent(() => import('./tool.layout.vue')),
};
