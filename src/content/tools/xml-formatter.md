# Professional XML Formatter & Validator: DOM Tree Prettification, Syntax Verification & Hierarchy Structuring

## 1. Overview & Technical Significance

Extensible Markup Language (XML) remains an essential foundational standard for enterprise application integration, financial transaction networks (ISO 20022, SWIFT), government reporting frameworks, SOAP web services, Android application manifests, and SVG vector graphics. Despite the modern ubiquity of JSON in REST APIs, enterprise systems exchange millions of XML documents daily.

In operational environments, XML payloads are almost universally transmitted in minified, single-line streams to minimize network transfer overhead. However, when developers, integration engineers, or support specialists need to diagnose a failed SOAP transaction, inspect an SAML authentication token, or debug an enterprise service bus (ESB) message, minified XML is completely unreadable.

The **DevTol XML Formatter & Validator** is a high-performance, client-side utility engineered to parse, validate, and hierarchically prettify complex XML documents. It parses XML text with the `xml-formatter` npm package, validates well-formedness, and outputs clean, indented markup with an adjustable indent size and a collapse-content switch.

---

## 2. W3C XML Standards & Structural Validation

XML enforces strict syntactic rules compared to forgiving HTML parsers. A strict XML parser halts immediately on a single unclosed tag or mismatched attribute quote — though this tool's formatter is lenient (see the FAQ below) and silently repairs some malformed input instead of rejecting it. DevTol validates XML against the official W3C XML 1.0 (Fifth Edition) recommendations:

### Key Validation Checks Performed
- **Well-Formedness Verification**: Checks that the document parses; well-formed documents format cleanly. (The check is lenient — see the FAQ on malformed input.)
- **Attribute Quotation Rules**: Attribute values must be quoted; the formatter normalises single-quoted values to double quotes.
- **Character Entity References**: Detects and properly preserves pre-defined XML entity references:
  - `&lt;` ($<$)
  - `&gt;` ($>$)
  - `&amp;` ($\&$)
  - `&apos;` ($'$)
  - `&quot;` ($"$)
- **CDATA Section Handling**: Preserves unparsed character data blocks (`<![CDATA[ ... ]]>`) intact without escaping or altering internal markup.
- **Namespace Declarations**: Correctly formats and maintains XML namespace prefixes (`xmlns:xsi`, `xmlns:soapenv`, `xmlns:custom`).

```xml
<!-- Before Formatting (Minified Enterprise SOAP Response): -->
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:pay="http://payment.enterprise.org"><soapenv:Header/><soapenv:Body><pay:ProcessTransaction><pay:TransactionId>TX-98471</pay:TransactionId><pay:Amount currency="USD">4500.00</pay:Amount><pay:Status>Approved</pay:Status></pay:ProcessTransaction></soapenv:Body></soapenv:Envelope>

<!-- After Formatting (DevTol Standard Indented Tree): -->
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:pay="http://payment.enterprise.org">
  <soapenv:Header/>
  <soapenv:Body>
    <pay:ProcessTransaction>
      <pay:TransactionId>TX-98471</pay:TransactionId>
      <pay:Amount currency="USD">4500.00</pay:Amount>
      <pay:Status>Approved</pay:Status>
    </pay:ProcessTransaction>
  </soapenv:Body>
</soapenv:Envelope>
```

---

## 3. Formatting Modes & Indentation Customization

- **Indentation Size**: A number input from 0 to 10 spaces (default 2). Setting it to 0 removes the indentation while keeping one element per line.
- **Collapse Content**: A switch (on by default) that keeps an element's text on the same line as its tags instead of breaking it onto separate lines.
- **No Self-Closing Normalisation**: Empty elements are left exactly as written — `<item></item>` stays `<item></item>`.
- **No Minifier**: There is no minify option. The closest equivalent is indent size 0, which removes indentation but keeps one element per line.
- **Generic Error Message**: If the input XML is malformed, DevTol shows only `Provided XML is not valid.` — no line number, column, or parse description. (Exception: mismatched or unclosed tags pass validation and are silently repaired instead — see §6.)

---

## 4. Step-by-Step Practical Usage Guide

1. **Paste Raw XML**: Copy your unformatted, minified, or raw XML payload and paste it into the editor.
2. **Review Validation Status**: DevTol immediately parses the document. If the XML is invalid, it shows the generic message `Provided XML is not valid.`
3. **Customize Format**: Set the indent size (0–10 spaces) and the collapse-content switch.
4. **Copy**: Click "Copy to Clipboard" to transfer the clean XML into your code editor or API testing tool (Postman, SoapUI).

---

## 5. Enterprise Data Privacy & Client-Side Execution

Enterprise XML payloads frequently carry the highest-sensitivity corporate data:
- Banking transaction details and payment card data in ISO 20022 schemas.
- SAML 2.0 assertions containing enterprise employee identities and security tokens.
- Healthcare HL7 and CDA clinical documents containing patient medical records.

DevTol processes XML locally in your browser using the `xml-formatter` package — no data is sent across the Internet, so enterprise documents stay on your machine.

---

## 6. Frequently Asked Questions (FAQs)

### What happens with a mismatched tag?
A mismatched tag means an opening tag does not match its closing tag (e.g., `<record>` closed with `</records>`), or tags are nested out of order (e.g., `<a><b></a></b>`). Surprisingly, DevTol does not reject these: the underlying formatter is lenient, so it silently repairs them instead — `<record></records>` formats to `<record></record>` — and validation passes. The generic message `Provided XML is not valid.` is reserved for input the formatter cannot parse at all, such as plain text or a document with two root elements. A green validation result therefore does not prove the document is well-formed.

### Does the formatter modify text inside `<script>` or `<style>` tags?
No — the formatter parses everything as XML, including the inside of `<script>` and `<style>` tags. Any `<` inside the script is read as the start of a tag, so the content is mangled: `<svg><script>if (a<b) {}</script></svg>` comes out with the `<b)` part swallowed as a tag, leaving `<script>if (a{}</script>`. If your script contains `<`, wrap it in a CDATA section or escape the `<` as `&lt;` before formatting.

### Can DevTol validate XML against an external XSD schema?
DevTol checks **well-formedness only** — and, as noted above, that check is lenient about some malformed input. There is no validation against XSD schemas or DTDs.

---

## 7. Worked Examples: Real Formatting

### The SOAP example, formatted

With the default settings — 2-space indentation and content collapsing on — the minified envelope from section 2 formats to exactly this:

```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:pay="http://payment.enterprise.org">
  <soapenv:Header/>
  <soapenv:Body>
    <pay:ProcessTransaction>
      <pay:TransactionId>TX-98471</pay:TransactionId>
      <pay:Amount currency="USD">4500.00</pay:Amount>
      <pay:Status>Approved</pay:Status>
    </pay:ProcessTransaction>
  </soapenv:Body>
</soapenv:Envelope>
```

### Indentation and collapsing

The indent control accepts 0 to 10 spaces. At 4 spaces with collapsing off, text nodes move onto their own lines:

```xml
<root>
    <a>
        text
    </a>
</root>
```

With collapsing on (the default), the same input stays compact: `<a>text</a>` on one line.

### What is preserved, and what is not changed

Entity references (`&lt;`, `&gt;`, `&amp;`, `&quot;`), comments, and CDATA blocks pass through untouched. An empty element written as `<item></item>` is left exactly as written — it is not rewritten to the self-closing form `<item/>`. Input that fails validation shows only the generic message `Provided XML is not valid.`, with no line or column number.

### The default document and zero indentation

The formatter opens with this document already loaded:

```xml
<hello><world>foo</world><world>bar</world></hello>
```

and with the default settings it produces:

```xml
<hello>
  <world>foo</world>
  <world>bar</world>
</hello>
```

Setting the indent size to `0` still puts each element on its own line, but with no leading spaces at all:

```xml
<hello>
<world>foo</world>
<world>bar</world>
</hello>
```

That is the full range of the indent control: a number from 0 to 10, always spaces, never tabs. Combined with the collapse switch, the two controls cover the realistic layouts: collapsed text on one line for reading values quickly, expanded text on separate lines for tracing deep nesting.
