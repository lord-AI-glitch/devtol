import en from '../../locales/en.yml';
import { get } from '@vueuse/core';
import type { Plugin } from 'vue';
import { createI18n } from 'vue-i18n';
import { watch } from 'vue';

/** Locales with a catalog in `locales/` and a route prefix. Keep in sync with the router guard and the prerender script. */
export const supportedLocales = ['en', 'ar', 'de', 'es', 'fr', 'no', 'pt', 'uk', 'vi', 'zh'] as const;

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en },
});

/** Load a non-English locale on demand and register its messages. */
export async function loadLocale(lang: string): Promise<void> {
  if (lang === 'en' || i18n.global.availableLocales.includes(lang)) {
    return;
  }
  try {
    const { default: messages } = await import(`../../locales/${lang}.yml`);
    i18n.global.setLocaleMessage(lang, messages);
  } catch (error) {
    console.warn(`[i18n] Failed to load locale "${lang}", falling back to English.`, error);
    i18n.global.locale.value = 'en';
  }
}

export const i18nPlugin: Plugin = {
  install: (app) => {
    app.use(i18n);
    // One mechanism for every locale-change path (router guard, language
    // selector, persisted locale restored on boot): load the catalog when a
    // non-English locale is set. Loading never blocks navigation or first
    // paint - English renders until the chunk lands.
    watch(i18n.global.locale, (lang) => { void loadLocale(lang); }, { immediate: true });
  },
};

export const translate = function (localeKey: string) {
  const hasKey = i18n.global.te(localeKey, get(i18n.global.locale));
  return hasKey ? i18n.global.t(localeKey) : localeKey;
};
