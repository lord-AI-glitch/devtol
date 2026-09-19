import { describe, expect, it } from 'vitest';
import {
  REGEX_PRESETS,
  explainRegexPattern,
  generateCodeSnippets,
  matchNaturalLanguageIntent,
  testRegex,
} from './ai-regex-generator-explainer.service';

describe('ai-regex-generator-explainer.service', () => {
  it('loads presets and matches natural language queries in English and Arabic', () => {
    expect(REGEX_PRESETS.length).toBeGreaterThan(10);

    const emailSearch = matchNaturalLanguageIntent('email');
    expect(emailSearch.length).toBeGreaterThan(0);
    expect(emailSearch[0].id).toBe('email-rfc');

    const egyptPhoneSearch = matchNaturalLanguageIntent('هاتف مصري موبايل');
    expect(egyptPhoneSearch.length).toBeGreaterThan(0);
    expect(egyptPhoneSearch[0].id).toBe('egyptian-phone');

    const arabicSearch = matchNaturalLanguageIntent('حروف عربية');
    expect(arabicSearch.length).toBeGreaterThan(0);
    expect(arabicSearch[0].id).toBe('arabic-text-only');
  });

  it('accurately parses and explains regex tokens and structures', () => {
    const pattern = '^[a-z0-9]+@(?:[a-z0-9]+\\.)+[a-z]{2,4}$';
    const explanations = explainRegexPattern(pattern, 'i');

    expect(explanations.length).toBeGreaterThan(5);

    const anchorTokens = explanations.filter(e => e.type === 'anchor');
    expect(anchorTokens.length).toBe(2); // ^ and $

    const flagTokens = explanations.filter(e => e.type === 'flag');
    expect(flagTokens.length).toBe(1); // i
    expect(flagTokens[0].token).toBe('/i');

    const groupTokens = explanations.filter(e => e.type === 'group');
    expect(groupTokens.length).toBeGreaterThan(0);
  });

  it('tests strings against regex and provides match counts and offsets', () => {
    const pattern = '\\d{3}-\\d{4}';
    const text = 'Call 555-1234 or 888-4321 for support';
    const result = testRegex(pattern, 'g', text);

    expect(result.matched).toBe(true);
    expect(result.matchCount).toBe(2);
    expect(result.matches[0].fullMatch).toBe('555-1234');
    expect(result.matches[1].fullMatch).toBe('888-4321');
  });

  it('validates Egyptian mobile phone pattern accurately', () => {
    const egyptPhonePreset = REGEX_PRESETS.find(p => p.id === 'egyptian-phone')!;
    const regex = new RegExp(egyptPhonePreset.pattern);

    expect(regex.test('+201096656588')).toBe(true);
    expect(regex.test('01096656588')).toBe(true);
    expect(regex.test('01123456789')).toBe(true);
    expect(regex.test('01298765432')).toBe(true);
    expect(regex.test('01511122233')).toBe(true);
    expect(regex.test('01999999999')).toBe(false); // Invalid prefix
    expect(regex.test('12345')).toBe(false);
  });

  it('generates working code snippets for 6 programming languages', () => {
    const snippets = generateCodeSnippets('^[a-zA-Z]+$', 'i');
    expect(snippets.javascript).toContain('regex = /');
    expect(snippets.python).toContain('import re');
    expect(snippets.golang).toContain('regexp.MustCompile');
    expect(snippets.php).toContain('preg_match');
    expect(snippets.java).toContain('Pattern.compile');
    expect(snippets.csharp).toContain('Regex.IsMatch');
  });
});
