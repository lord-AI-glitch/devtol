import type Plausible from 'plausible-tracker';
import type { App } from 'vue';
import { config } from '@/config';

const noop = () => {};

function createFakePlausibleInstance(): Pick<ReturnType<typeof Plausible>, 'trackEvent' | 'enableAutoPageviews'> {
  return {
    trackEvent: noop,
    enableAutoPageviews: () => noop,
  };
}

export const plausible = {
  install: (app: App) => {
    if (config.plausible.isTrackerEnabled) {
      // The real tracker is loaded on demand; the fake instance is provided
      // synchronously so `inject('plausible')` never resolves to undefined,
      // and is replaced once the tracker chunk arrives.
      const fake = createFakePlausibleInstance();
      app.provide('plausible', fake);
      import('plausible-tracker')
        .then(({ default: Plausible }) => {
          const instance = Plausible(config.plausible);
          instance.enableAutoPageviews();
          app.provide('plausible', instance);
        })
        .catch((error: unknown) => {
          // Tracker chunk failed to load (e.g. stale chunk after a deploy):
          // keep the fake instance so the app keeps working.
          console.warn('[plausible] tracker failed to load', error);
        });
      return;
    }

    const fake = createFakePlausibleInstance();
    fake.enableAutoPageviews();
    app.provide('plausible', fake);
  },
};
