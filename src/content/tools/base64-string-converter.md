# What is Base64 String Encoding?

Base64 is a binary-to-text encoding scheme that represents binary data in an ASCII string format by translating it into a radix-64 representation. Each Base64 digit represents exactly 6 bits of data.

Three 8-bit bytes (i.e., a total of 24 bits) can therefore be represented by four 6-bit Base64 digits.

## Why use Base64 Encoding?

- **Safe Transmission**: Base64 is commonly used when there is a need to encode binary data that needs to be stored and transferred over media that are designed to deal with textual data.
- **Data URIs**: Embed small images or media directly into HTML, CSS, or JSON without additional HTTP round-trips.
- **Email Standards**: MIME (Multipurpose Internet Mail Extensions) relies on Base64 to transport attachments safely across mail servers.

## Code Example

Here is how you can encode and decode Base64 in JavaScript:

```javascript
// Encoding a UTF-8 string to Base64
const text = "Hello, World!";
const encoded = btoa(unescape(encodeURIComponent(text)));
console.log("Encoded:", encoded); // "SGVsbG8sIFdvcmxkIQ=="

// Decoding a Base64 string back to UTF-8
const decoded = decodeURIComponent(escape(atob(encoded)));
console.log("Decoded:", decoded); // "Hello, World!"
```

## Security & Privacy Note

> **100% Client-side Processing**: All string conversions, encoding, and decoding happen locally in your browser sandbox. None of your sensitive strings, credentials, or payloads are ever uploaded to remote servers.
