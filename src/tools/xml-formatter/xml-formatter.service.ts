import xmlFormat, { type XMLFormatterOptions } from 'xml-formatter';
import { withDefaultOnError } from '@/utils/defaults';

export { formatXml, isValidXML };

function cleanRawXml(rawXml: string): string {
  return rawXml.trim();
}

function formatXml(rawXml: string, options?: XMLFormatterOptions): string {
  return withDefaultOnError(() => xmlFormat(cleanRawXml(rawXml), options) ?? '', '');
}

function isValidXML(rawXml: string): boolean {
  const cleanedRawXml = cleanRawXml(rawXml);

  if (cleanedRawXml === '') {
    return true;
  }

  // xml-formatter alone is not enough: it silently repairs malformed markup
  // instead of throwing (e.g. `<record></records>` formats to
  // `<record></record>`), so check the structure first.
  if (!hasWellFormedStructure(cleanedRawXml)) {
    return false;
  }

  try {
    xmlFormat(cleanedRawXml);
    return true;
  }
  catch (e) {
    return false;
  }
}

// Dependency-free well-formedness check: tag-stack discipline plus exactly
// one root element. Formatting behaviour is untouched — this only validates.
// Skips declarations (`<?...?>`), comments, CDATA sections and DOCTYPEs;
// attribute values are quote-aware, so `>` and `/` inside quotes are fine.
function hasWellFormedStructure(rawXml: string): boolean {
  const stack: string[] = [];
  let rootSeen = false;
  let i = 0;

  // Index of the `>` closing the tag starting at `start`, skipping `>`
  // inside single/double-quoted attribute values; -1 if unterminated.
  function findTagEnd(start: number): number {
    let quote = '';
    for (let j = start + 1; j < rawXml.length; j++) {
      const ch = rawXml[j];
      if (quote) {
        if (ch === quote) {
          quote = '';
        }
      }
      else if (ch === '"' || ch === '\'') {
        quote = ch;
      }
      else if (ch === '>') {
        return j;
      }
    }
    return -1;
  }

  // Index of the `>` closing a `<!DOCTYPE ...>` starting at `start`, skipping
  // `>` inside the internal subset `[...]` and inside quotes; -1 if unterminated.
  function findDoctypeEnd(start: number): number {
    let quote = '';
    let bracketDepth = 0;
    for (let j = start + 1; j < rawXml.length; j++) {
      const ch = rawXml[j];
      if (quote) {
        if (ch === quote) {
          quote = '';
        }
      }
      else if (ch === '"' || ch === '\'') {
        quote = ch;
      }
      else if (ch === '[') {
        bracketDepth++;
      }
      else if (ch === ']') {
        bracketDepth--;
      }
      else if (ch === '>' && bracketDepth === 0) {
        return j;
      }
    }
    return -1;
  }

  while (i < rawXml.length) {
    const lt = rawXml.indexOf('<', i);

    if (lt === -1) {
      // Trailing text must be whitespace only.
      if (rawXml.slice(i).trim() !== '') {
        return false;
      }
      break;
    }

    // Text between tokens must sit inside the root element, and entity
    // references in text must be valid (predefined or numeric).
    if (rawXml.slice(i, lt).trim() !== '' && stack.length === 0) {
      return false;
    }
    if (!hasValidEntities(rawXml.slice(i, lt))) {
      return false;
    }

    if (rawXml.startsWith('<!--', lt)) {
      const end = rawXml.indexOf('-->', lt + 4);
      if (end === -1) {
        return false;
      }
      i = end + 3;
      continue;
    }

    if (rawXml.startsWith('<![CDATA[', lt)) {
      const end = rawXml.indexOf(']]>', lt + 9);
      if (end === -1 || stack.length === 0) {
        return false;
      }
      i = end + 3;
      continue;
    }

    if (rawXml.startsWith('<?', lt)) {
      const end = rawXml.indexOf('?>', lt + 2);
      if (end === -1) {
        return false;
      }
      i = end + 2;
      continue;
    }

    if (rawXml.startsWith('<!DOCTYPE', lt) || rawXml.startsWith('<!doctype', lt)) {
      const end = findDoctypeEnd(lt);
      if (end === -1) {
        return false;
      }
      i = end + 1;
      continue;
    }

    if (rawXml.startsWith('<!', lt)) {
      const end = findTagEnd(lt);
      if (end === -1) {
        return false;
      }
      i = end + 1;
      continue;
    }

    if (rawXml.startsWith('</', lt)) {
      const match = /^<\/([A-Za-z_][\w.:-]*)\s*>/.exec(rawXml.slice(lt));
      if (!match || stack.length === 0 || stack[stack.length - 1] !== match[1]) {
        return false;
      }
      stack.pop();
      i = lt + match[0].length;
      continue;
    }

    const end = findTagEnd(lt);
    if (end === -1) {
      return false;
    }
    const inner = rawXml.slice(lt + 1, end);
    const match = /^([A-Za-z_][\w.:-]*)/.exec(inner);
    if (!match) {
      return false;
    }
    // Per the XML spec an empty-element tag is `'/' '>'` with no space
    // between the two, so only a `/` immediately before `>` self-closes.
    const selfClosing = rawXml[end - 1] === '/';
    const rest = inner.slice(match[1].length);
    const attrText = selfClosing ? rest.replace(/\/\s*$/, '') : rest;
    if (!hasValidAttributes(attrText)) {
      return false;
    }
    // A second root element is invalid.
    if (stack.length === 0 && rootSeen) {
      return false;
    }
    if (stack.length === 0) {
      rootSeen = true;
    }
    if (!selfClosing) {
      stack.push(match[1]);
    }
    i = end + 1;
  }

  return rootSeen && stack.length === 0;
}

// Attribute list: `name="value"` / `name='value'` pairs separated by
// whitespace. Names must be valid and unique, values must be quoted, and
// values must not contain `<` or invalid entity references. A bare name, an
// unquoted value, a stray `/` or a `<` all fail the pair pattern.
function hasValidAttributes(attrText: string): boolean {
  const seen = new Set<string>();
  let p = 0;
  while (p < attrText.length) {
    while (p < attrText.length && /\s/.test(attrText[p])) {
      p++;
    }
    if (p >= attrText.length) {
      break;
    }
    const attrMatch = /^([A-Za-z_][\w.:-]*)\s*=\s*(["'])/.exec(attrText.slice(p));
    if (!attrMatch) {
      return false;
    }
    if (seen.has(attrMatch[1])) {
      return false;
    }
    seen.add(attrMatch[1]);
    const quote = attrMatch[2];
    const valueStart = p + attrMatch[0].length;
    const valueEnd = attrText.indexOf(quote, valueStart);
    if (valueEnd === -1) {
      return false;
    }
    const value = attrText.slice(valueStart, valueEnd);
    if (value.includes('<') || !hasValidEntities(value)) {
      return false;
    }
    p = valueEnd + 1;
  }
  return true;
}

// Entity references in text and attribute values must be one of the five
// predefined entities or a numeric character reference.
function hasValidEntities(text: string): boolean {
  let from = 0;
  while (true) {
    const amp = text.indexOf('&', from);
    if (amp === -1) {
      return true;
    }
    const semi = text.indexOf(';', amp + 1);
    if (semi === -1) {
      return false;
    }
    const ref = text.slice(amp + 1, semi);
    if (!/^(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+)$/.test(ref)) {
      return false;
    }
    from = semi + 1;
  }
}
