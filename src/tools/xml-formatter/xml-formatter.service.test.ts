import { describe, expect, it } from 'vitest';
import { formatXml, isValidXML } from './xml-formatter.service';

describe('xml-formatter service', () => {
  describe('formatXml', () => {
    it('converts XML into a human readable format', () => {
      const initString = '<hello><world>foo</world><world>bar</world></hello>';

      expect(formatXml(initString)).toMatchInlineSnapshot(`
        "<hello>
            <world>
                foo
            </world>
            <world>
                bar
            </world>
        </hello>"
      `);
    });

    it('returns an empty string if the input is not valid XML', () => {
      const initString = 'hello world';

      expect(formatXml(initString)).toEqual('');
    });
  });

  describe('isValidXML', () => {
    it('accepts well-formed XML', () => {
      expect(isValidXML('<hello><world>foo</world><world>bar</world></hello>')).toBe(true);
    });

    it('accepts XML with a declaration, comments and CDATA', () => {
      expect(
        isValidXML('<?xml version="1.0"?><!-- note --><root><![CDATA[some <text>]]></root>'),
      ).toBe(true);
    });

    it('accepts self-closing tags and attributes containing > or / in quotes', () => {
      expect(isValidXML('<root><item href="/a>b" /><item id="x">1</item></root>')).toBe(true);
    });

    it('accepts an empty string (existing behaviour)', () => {
      expect(isValidXML('')).toBe(true);
    });

    it('rejects mismatched closing tags instead of silently repairing them', () => {
      // xml-formatter formats <record></records> to <record></record> with no
      // error; the tool must report it as invalid instead.
      expect(isValidXML('<record></records>')).toBe(false);
      expect(isValidXML('<a><b></a></b>')).toBe(false);
    });

    it('rejects unclosed tags', () => {
      expect(isValidXML('<hello><world>foo</world>')).toBe(false);
      expect(isValidXML('<a><b>')).toBe(false);
    });

    it('rejects plain text and multiple roots', () => {
      expect(isValidXML('hello world')).toBe(false);
      expect(isValidXML('<a/><b/>')).toBe(false);
      expect(isValidXML('<a></a>junk')).toBe(false);
    });

    it('rejects stray closing tags and unterminated tags', () => {
      expect(isValidXML('</a>')).toBe(false);
      expect(isValidXML('<a><b')).toBe(false);
    });

    it('rejects unquoted, missing and duplicate attribute values', () => {
      expect(isValidXML('<a b=c/>')).toBe(false);
      expect(isValidXML('<a b=/>')).toBe(false);
      expect(isValidXML('<a b="1" b="2"/>')).toBe(false);
      expect(isValidXML('<a b>text</a>')).toBe(false);
    });

    it('rejects unknown entity references', () => {
      expect(isValidXML('<a>&unknown;</a>')).toBe(false);
      expect(isValidXML('<a b="&unknown;">x</a>')).toBe(false);
    });

    it('accepts quoted attributes and valid entity references', () => {
      expect(isValidXML('<a b="c">x</a>')).toBe(true);
      expect(isValidXML('<a>&amp;&lt;&gt;&quot;&apos;&#65;&#x41;</a>')).toBe(true);
      expect(isValidXML('<a b="&amp;">x</a>')).toBe(true);
    });
  });
});
