import { Base64 } from 'js-base64';
import { textToBase64 } from './base64';

export { decodeShareState, encodeShareState };

// Encodes tool input into a URL-safe string, so a tool's state can be shared
// as a link (e.g. `?input=<encoded>`). Output is base64url: no `+`, `/` or `=`,
// so it needs no percent-encoding in a query param.
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;

function encodeShareState(text: string): string {
  return textToBase64(text, { makeUrlSafe: true });
}

// Strict decoder: returns `null` for anything that is not exactly the canonical
// encoding of some UTF-8 text (bad charset, impossible length, non-canonical
// trailing bits, invalid UTF-8 bytes). Never throws.
//
// Known limitation (accepted, see WORK_LOG §7): the empty string is not a valid
// encoding (`decodeShareState('')` is `null`, covered by test), so an empty input
// cannot be shared by link — the recipient falls back to their stored/default
// value. Sharing empty input has no practical value, so this is documented
// rather than worked around.
function decodeShareState(value: string): string | null {
  if (!BASE64URL_PATTERN.test(value)) {
    return null;
  }

  try {
    const bytes = Base64.toUint8Array(value);
    const decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes);

    // Canonical-form check: re-encoding must reproduce the input exactly,
    // otherwise the value was tampered with (e.g. non-zero trailing bits).
    if (encodeShareState(decoded) !== value) {
      return null;
    }

    return decoded;
  }
  catch (_) {
    return null;
  }
}
