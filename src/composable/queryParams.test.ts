import { describe, expect, it } from 'vitest';
import { defineComponent, nextTick } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import { useQueryParam, useQueryParamOrStorage } from './queryParams';
import { encodeShareState } from '@/utils/shareUrl';

function createTestRouter(initialUrl: string) {
  const router = createRouter({
    history: createWebHistory(),
    routes: [{ path: '/test', component: { template: '<div>Test</div>' } }],
  });

  return router.push(initialUrl).then(() => router);
}

function createTestComponent(storageName: string, defaultValue: string) {
  return defineComponent({
    setup() {
      const value = useQueryParamOrStorage({ name: 'input', storageName, defaultValue, transformer: 'base64url' });
      const plainValue = useQueryParam({ name: 'plain', defaultValue: 'plain-default', transformer: 'base64url' });
      return { value, plainValue };
    },
    template: '<div>{{ value }}|{{ plainValue }}</div>',
  });
}

function mountWithQueryParam({ initialUrl, storageName, defaultValue = '{"hello": "world"}' }: { initialUrl: string; storageName: string; defaultValue?: string }) {
  const TestComponent = createTestComponent(storageName, defaultValue);

  return createTestRouter(initialUrl).then(async (router) => {
    await router.isReady();
    const wrapper = mount(TestComponent, { global: { plugins: [router] } });
    await flushPromises();
    return { wrapper, router };
  });
}

describe('useQueryParamOrStorage with base64url transformer', () => {
  it('should restore state from a valid ?input= param', async () => {
    const input = '{"hello": "world", "foo": "bar"}';
    const { wrapper } = await mountWithQueryParam({
      initialUrl: `/test?input=${encodeShareState(input)}`,
      storageName: 'test:restore-valid',
    });

    expect(wrapper.vm.value).to.eql(input);
    expect(wrapper.text()).to.eql(`${input}|plain-default`);
  });

  it('should restore Arabic text from a valid ?input= param', async () => {
    const input = '{"مرحبا": "بالعالم"}';
    const { wrapper } = await mountWithQueryParam({
      initialUrl: `/test?input=${encodeShareState(input)}`,
      storageName: 'test:restore-arabic',
    });

    expect(wrapper.vm.value).to.eql(input);
  });

  it('should fall back to the default value when no param is present', async () => {
    const { wrapper } = await mountWithQueryParam({
      initialUrl: '/test',
      storageName: 'test:no-param',
      defaultValue: 'default-value',
    });

    expect(wrapper.vm.value).to.eql('default-value');
  });

  it('should fall back to storage/default on an invalid ?input= param, without throwing', async () => {
    const { wrapper } = await mountWithQueryParam({
      initialUrl: '/test?input=!!!not-base64!!!',
      storageName: 'test:invalid-param',
      defaultValue: 'default-value',
    });

    expect(wrapper.vm.value).to.eql('default-value');
  });

  it('should write state changes back to the URL query', async () => {
    const { wrapper, router } = await mountWithQueryParam({
      initialUrl: '/test',
      storageName: 'test:write-back',
      defaultValue: '',
    });

    wrapper.vm.value = '{"new": true}';
    await nextTick();
    await flushPromises();
    await nextTick();

    expect(router.currentRoute.value.query.input).to.eql(encodeShareState('{"new": true}'));
  });

  it('should use replace (not push) when syncing, so history does not grow', async () => {
    const { wrapper } = await mountWithQueryParam({
      initialUrl: '/test',
      storageName: 'test:no-history-growth',
      defaultValue: '',
    });

    const lengthBefore = window.history.length;

    wrapper.vm.value = 'first';
    await nextTick();
    await flushPromises();
    wrapper.vm.value = 'second';
    await nextTick();
    await flushPromises();
    wrapper.vm.value = 'third';
    await nextTick();
    await flushPromises();

    expect(window.history.length).to.eql(lengthBefore);
  });

  it('should not sync over-long values to the URL (they stay in storage only)', async () => {
    const { wrapper, router } = await mountWithQueryParam({
      initialUrl: '/test',
      storageName: 'test:over-long',
      defaultValue: '',
    });

    // ~1500 chars of input encode to ~2000 chars; use 3000 to be safely over the cap
    wrapper.vm.value = 'x'.repeat(3000);
    await nextTick();
    await flushPromises();
    await nextTick();

    expect(router.currentRoute.value.query.input).toBeUndefined();
    // the value itself is still kept (in storage / in the ref)
    expect(wrapper.vm.value).to.eql('x'.repeat(3000));
  });
});

describe('useQueryParam with base64url transformer', () => {
  it('should restore state from a valid param and fall back to default on an invalid one', async () => {
    const TestComponent = createTestComponent('test:plain', 'default-value');

    const router = await createTestRouter(`/test?plain=${encodeShareState('from-url')}`);
    await router.isReady();
    const wrapper = mount(TestComponent, { global: { plugins: [router] } });
    await flushPromises();
    expect(wrapper.vm.plainValue).to.eql('from-url');
    wrapper.unmount();

    const badRouter = await createTestRouter('/test?plain=!!!');
    await badRouter.isReady();
    const badWrapper = mount(TestComponent, { global: { plugins: [badRouter] } });
    await flushPromises();
    expect(badWrapper.vm.plainValue).to.eql('plain-default');
  });
});
