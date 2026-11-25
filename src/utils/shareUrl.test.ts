import { describe, expect, it } from 'vitest';
import { decodeShareState, encodeShareState } from './shareUrl';

describe('shareUrl utils', () => {
  describe('encodeShareState', () => {
    it('should encode an empty string into an empty string', () => {
      expect(encodeShareState('')).to.eql('');
    });

    it('should encode ASCII text into URL-safe base64 without padding', () => {
      expect(encodeShareState('a')).to.eql('YQ');
      expect(encodeShareState('lorem ipsum')).to.eql('bG9yZW0gaXBzdW0');
      expect(encodeShareState('{"hello": "world"}')).to.eql('eyJoZWxsbyI6ICJ3b3JsZCJ9');
    });

    it('should only output URL-safe characters', () => {
      const samples = [
        '<<<????????>>>',
        '{"مرحبا": "بالعالم"}',
        '🎉🚀✨',
        'line1\nline2\ttabbed',
        'a'.repeat(1000),
      ];

      for (const sample of samples) {
        expect(encodeShareState(sample)).to.match(/^[A-Za-z0-9_-]*$/);
      }
    });
  });

  describe('decodeShareState', () => {
    it('should round-trip ASCII JSON', () => {
      const input = '{"hello": "world", "foo": "bar"}';
      expect(decodeShareState(encodeShareState(input))).to.eql(input);
    });

    it('should round-trip Arabic text', () => {
      const input = '{"مرحبا": "بالعالم"}';
      expect(decodeShareState(encodeShareState(input))).to.eql(input);
    });

    it('should round-trip emoji', () => {
      const input = '🎉🚀✨';
      expect(decodeShareState(encodeShareState(input))).to.eql(input);
    });

    it('should round-trip newlines and tabs', () => {
      const input = 'line1\nline2\ttabbed\r\nwindows';
      expect(decodeShareState(encodeShareState(input))).to.eql(input);
    });

    it('should round-trip a 100 KB input', () => {
      const input = `{"data": "${'x'.repeat(100 * 1024)}"}`;
      expect(decodeShareState(encodeShareState(input))).to.eql(input);
    });

    it('should return null for an empty value', () => {
      expect(decodeShareState('')).to.eql(null);
    });

    it('should return null for values with characters outside the base64url alphabet', () => {
      expect(decodeShareState('!!!')).to.eql(null);
      expect(decodeShareState('a b')).to.eql(null);
      expect(decodeShareState('YQ==')).to.eql(null);
      expect(decodeShareState('YQ=')).to.eql(null);
      expect(decodeShareState('YQ+/')).to.eql(null);
    });

    it('should return null for an impossible base64 length (truncated value)', () => {
      // a base64 string can never be 1 mod 4 characters long
      expect(decodeShareState('abcde')).to.eql(null);
      expect(decodeShareState('Y')).to.eql(null);
    });

    it('should return null for non-canonical trailing bits', () => {
      // 'YR' decodes to the same byte as 'YQ' but with non-zero trailing bits;
      // only the canonical encoding is accepted
      expect(decodeShareState('YR')).to.eql(null);
      expect(decodeShareState('YQ')).to.eql('a');
    });

    it('should return null for valid base64url of invalid UTF-8 bytes', () => {
      // 0xFF 0xFE is valid base64url but not valid UTF-8
      expect(decodeShareState('__4')).to.eql(null);
    });
  });
});
