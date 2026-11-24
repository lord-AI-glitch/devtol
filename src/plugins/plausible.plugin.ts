import type Plausible from 'plausible-tracker';
import type { App } from 'vue';
import { config } from '@/config';

const noop = () => {};

type PlausibleInstance = Pick<ReturnType<typeof Plausible>, 'trackEvent' | 'enableAutoPageviews'>;

function createFakePlausibleInstance(): PlausibleInstance {
  return {
    trackEvent: noop,
    enableAutoPageviews: () => noop,
  };
}

// A stable wrapper that forwards every call to the current inner instance.
// Holders that captured the provided value at setup (e.g. the base layout's
// `useTracker()`) keep working and automatically use the real tracker once
// its chunk loads; only the inner reference swaps, never the provided object.
function createDelegatingPlausibleInstance(initial: PlausibleInstance): {
  instance: PlausibleInstance;
  setInner: (next: PlausibleInstance) => void;
} {
  let inner = initial;
  return {
    instance: {
      trackEvent: (...args: Parameters<PlausibleInstance['trackEvent']>) => inner.trackEvent(...args),
      enableAutoPageviews: (...args: Parameters<PlausibleInstance['enableAutoPageviews']>) =>
        inner.enableAutoPageviews(...args),
    },
    setInner: (next: PlausibleInstance) => {
      inner = next;
    },
  };
}

export const plausible = {
  install: (app: App) => {
    if (config.plausible.isTrackerEnabled) {
      // The real tracker is loaded on demand; a delegating wrapper is provided
      // synchronously so `inject('plausible')` never resolves to undefined,
      // and holders captured at setup automatically use the real tracker
      // once the chunk arrives.
      const fake = createFakePlausibleInstance();
      const { instance, setInner } = createDelegatingPlausibleInstance(fake);
      app.provide('plausible', instance);
      import('plausible-tracker')
        .then(({ default: Plausible }) => {
          const realInstance = Plausible(config.plausible);
          realInstance.enableAutoPageviews();
          setInner(realInstance);
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
