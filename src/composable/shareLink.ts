import { useRoute, useRouter, type LocationQuery } from 'vue-router';
import { useMessage } from 'naive-ui';
import { useCopy } from '@/composable/copy';

export { MAX_SHARE_URL_LENGTH, useShareLink };

// Links longer than this are not copied: they break in chats, emails and
// messaging apps. The tool itself stays usable — only sharing is refused.
const MAX_SHARE_URL_LENGTH = 6000;

// Builds a shareable link for the current tool page (locale prefix preserved)
// from the current route's query merged with the state the caller provides,
// and copies it to the clipboard. Everything stays client-side: the link
// only carries the state, nothing is sent to a server.
function useShareLink(buildQuery: () => Record<string, string | undefined>) {
  const route = useRoute();
  const router = useRouter();
  const { copy } = useCopy();
  const message = useMessage();

  async function copyShareLink() {
    const query: LocationQuery = { ...route.query };

    for (const [key, value] of Object.entries(buildQuery())) {
      if (value === undefined || value === '') {
        delete query[key];
      }
      else {
        query[key] = value;
      }
    }

    const href = router.resolve({ path: route.path, query }).href;
    const url = `${window.location.origin}${href}`;

    if (url.length > MAX_SHARE_URL_LENGTH) {
      message.warning('This input is too large to share by link');
      return;
    }

    await copy(url);
  }

  return { copyShareLink };
}
