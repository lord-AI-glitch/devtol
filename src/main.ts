import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createHead } from '@vueuse/head';

import { registerSW } from 'virtual:pwa-register';
import shadow from 'vue-shadow-dom';
import { plausible } from './plugins/plausible.plugin';

import 'virtual:uno.css';

import App from './App.vue';
import router from './router';
import { i18nPlugin } from './plugins/i18n.plugin';

registerSW();

// After a deploy, a cached page can still reference chunks removed from the
// new build. Reload once (at most every 30 s) to pick up the current assets.
function reloadForStaleChunks() {
  const key = 'devtol:stale-chunk-reload';
  try {
    const last = Number(sessionStorage.getItem(key) || 0);
    if (Date.now() - last < 30_000) return false;
    sessionStorage.setItem(key, String(Date.now()));
  } catch {
    // Storage blocked: skip the auto-reload rather than risk a reload loop.
    return false;
  }
  window.location.reload();
  return true;
}
window.addEventListener('vite:preloadError', (event) => {
  if (reloadForStaleChunks()) event.preventDefault();
});
router.onError((error) => {
  if (/dynamically imported module|Importing a module script failed|Failed to fetch/i.test(String(error?.message))) {
    reloadForStaleChunks();
  }
});

const app = createApp(App);

app.use(createPinia());
app.use(createHead());
app.use(i18nPlugin);
app.use(router);
app.use(plausible);
app.use(shadow);

app.mount('#app');
