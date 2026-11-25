import { useRouteQuery } from '@vueuse/router';
import { computed } from 'vue';
import { useStorage } from '@vueuse/core';
import { decodeShareState, encodeShareState } from '@/utils/shareUrl';

export { useQueryParam, useQueryParamOrStorage };

// Maximum length (in characters) of an encoded value that is auto-synced to the
// URL. Longer values stay in storage only, so shared links remain pasteable;
// the "Copy link" button applies its own (higher) guard when building a link.
const MAX_AUTO_SYNC_LENGTH = 2000;

const transformers = {
  number: {
    fromQuery: (value: string) => Number(value),
    toQuery: (value: number) => String(value),
  },
  string: {
    fromQuery: (value: string) => value,
    toQuery: (value: string) => value,
  },
  boolean: {
    fromQuery: (value: string) => value.toLowerCase() === 'true',
    toQuery: (value: boolean) => (value ? 'true' : 'false'),
  },
  object: {
    fromQuery: (value: string) => {
      return JSON.parse(value);
    },
    toQuery: (value: object) => JSON.stringify(value),
  },
  // URL-safe base64 of UTF-8 text, for sharing tool input as a link.
  // fromQuery returns null for anything that is not a canonical encoding;
  // callers fall back to the default/storage value in that case.
  base64url: {
    fromQuery: (value: string) => decodeShareState(value),
    toQuery: (value: string) => encodeShareState(value),
  },
};

type TransformerName = keyof typeof transformers;

function getTransformer<T>({ defaultValue, transformer: transformerName }: { defaultValue: T; transformer?: TransformerName }) {
  if (transformerName) {
    return transformers[transformerName];
  }

  const type = typeof defaultValue;
  return transformers[type as keyof typeof transformers] ?? transformers.string;
}

function useQueryParam<T>({ name, defaultValue, transformer: transformerName }: { name: string; defaultValue: T; transformer?: TransformerName }) {
  const transformer = getTransformer({ defaultValue, transformer: transformerName });

  const proxy = useRouteQuery(name, transformer.toQuery(defaultValue as never));

  return computed<T>({
    get() {
      return (transformer.fromQuery(proxy.value) ?? defaultValue) as unknown as T;
    },
    set(value) {
      const encoded = transformer.toQuery(value as never);
      // over-long values are not synced to the URL (writing the default
      // removes the param); see MAX_AUTO_SYNC_LENGTH
      proxy.value = encoded.length > MAX_AUTO_SYNC_LENGTH ? transformer.toQuery(defaultValue as never) : encoded;
    },
  });
}

function useQueryParamOrStorage<T>({ name, storageName, defaultValue, transformer: transformerName }: { name: string; storageName: string; defaultValue: T; transformer?: TransformerName }) {
  const transformer = getTransformer({ defaultValue, transformer: transformerName });

  const storageRef = useStorage(storageName, defaultValue);
  const proxyDefaultValue = transformer.toQuery(defaultValue as never);
  const proxy = useRouteQuery(name, proxyDefaultValue);

  const r = ref(defaultValue);

  watch(r,
    (value) => {
      const encoded = transformer.toQuery(value as never);
      // over-long values stay in storage only (see MAX_AUTO_SYNC_LENGTH);
      // writing the default value removes the param from the URL
      proxy.value = encoded.length > MAX_AUTO_SYNC_LENGTH ? proxyDefaultValue : encoded;
      storageRef.value = value as never;
    },
    { deep: true });

  const fromQuery = proxy.value && proxy.value !== proxyDefaultValue
    ? transformer.fromQuery(proxy.value) as unknown as T
    : undefined;
  // an invalid query value (e.g. a malformed base64url param) falls back to
  // storage/default instead of blanking the tool or throwing.
  // Known limitation (accepted, see WORK_LOG §7): a param that is empty or equal
  // to the encoded default is treated as absent, so a shared link cannot
  // reproduce an empty input or the default value — the recipient gets their
  // own stored/default value instead. Safe fallback, no crash.
  r.value = (fromQuery ?? storageRef.value) as never;

  return r;
}
