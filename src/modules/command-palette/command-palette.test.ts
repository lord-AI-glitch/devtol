import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import CommandPalette from './command-palette.vue';
import { i18n } from '@/plugins/i18n.plugin';

describe('CommandPalette', () => {
  it('mounts without throwing ReferenceError for storeToRefs', () => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const router = createRouter({
      history: createWebHistory(),
      routes: [{ path: '/', component: { template: '<div>Home</div>' } }],
    });

    const wrapper = mount(CommandPalette, {
      global: {
        plugins: [pinia, router, i18n],
        stubs: {
          'icon-mdi-search': true,
          'c-button': true,
          'n-modal': true,
          'n-input': true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});
