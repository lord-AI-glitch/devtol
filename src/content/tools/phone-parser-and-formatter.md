# Phone Parser & Formatter: ITU-T E.164 Standards, International Dialing & libphonenumber Validation

## 1. Quick Overview & Core Advantages
Global telecommunications systems rely on standardized numbering plans to accurately route telephone calls, SMS messages, and two-factor authentication (2FA) tokens across terrestrial and mobile carrier networks. Governed by the International Telecommunication Union Telecommunication Standardization Sector (**ITU-T Recommendation E.164**), the international public telecommunication numbering plan enforces strict constraints on country calling codes, national destination codes, and subscriber numbers.

Our client-side **Phone Parser & Formatter Tool** leverages Google's authoritative `libphonenumber` metadata engine compiled to WebAssembly / JavaScript. It parses ambiguous, unformatted user phone entries into canonical E.164 strings, RFC 3966 `tel:` URIs, national formats, and international dialing representations.

### Core Advantages & Zero-Knowledge Architecture
- **100% Client-Side Evaluation**: Phone numbers, customer contact records, and SMS verification lists are parsed and validated inside your browser. No phone numbers are transmitted across external networks.
- **ITU-T E.164 & RFC 3966 Compliance**: Standardizes numbers into globally routable formats with max 15 digits, country codes, and URI anchors.
- **Carrier & Line Type Classification**: Accurately classifies numbers as Mobile, Fixed Line, Toll-Free, VoIP, Premium Rate, or Pager based on national prefix allocations.

---

## 2. Step-by-Step Usage Guide

### Parsing and Formatting Phone Numbers
1. **Enter Phone Number**: Type or paste any phone number into the input field (e.g., `+1 (415) 555-2671`, `020 7946 0991`, `+49 30 123456`).
2. **Select Default Region (Optional)**: If the input lacks an international plus prefix (`+`), choose the default ISO 3166-1 alpha-2 country code (e.g., `US`, `GB`, `DE`, `FR`).
3. **Inspect Standard Formats**:
   - **E.164 Format**: `+14155552671` (Mandatory format for Twilio, MessageBird, and database storage).
   - **International Format**: `+1 415-555-2671` (Human-readable format for international correspondence).
   - **National Format**: `(415) 555-2671` (Domestic format for in-country dialing).
   - **RFC 3966 URI**: `tel:+1-415-555-2671` (Click-to-call link for HTML `<a>` tags).
4. **Review Carrier & Validation Diagnostics**:
   - **Is Possible Number**: Checks length against national numbering plans.
   - **Is Valid Number**: Checks prefix and number length against active telecom assignments.
   - **Line Type**: Mobile, Fixed Line, or Toll Free.
   - **Timezone**: Applicable geographical timezone offsets.

### Parsing Example
```
Input:               07911 123456 (Default Region: GB)
-------------------------------------------------------
E.164 Format:        +447911123456
International:       +44 7911 123456
National:            07911 123456
RFC 3966 URI:        tel:+44-7911-123456
Country / Region:    United Kingdom (GB)
Calling Code:        +44
Number Type:         MOBILE
Validation Status:   VALID
```

---

## 3. Technical Deep-Dive: ITU-T E.164 & libphonenumber Grammar

### Structure of an E.164 Number
Under ITU-T E.164 §6, an international public telecommunication number has a maximum length of 15 digits (excluding prefix symbols):

$$\text{Total Digits} \le 15 = \text{Country Code (1-3 digits)} + \text{National Destination Code} + \text{Subscriber Number}$$

```
+-------------------------------------------------------+
|                 ITU-T E.164 Format                    |
+-------------------+-----------------------------------+
| Country Code (CC) | National Significant Number (NSN) |
|   1 to 3 digits   |         Up to 14 digits           |
+-------------------+-----------------------------------+
```

### High-Performance TypeScript Implementation
```typescript
import { parsePhoneNumber, PhoneNumber, CountryCode } from 'libphonenumber-js';

export interface FormattedPhoneResult {
  raw: string;
  isValid: boolean;
  isPossible: boolean;
  country?: CountryCode;
  countryCallingCode?: string;
  e164?: string;
  national?: string;
  international?: string;
  uri?: string;
  type?: string;
}

export function parseAndFormatPhone(
  rawInput: string,
  defaultCountry: CountryCode = 'US'
): FormattedPhoneResult {
  try {
    const phoneNumber: PhoneNumber | undefined = parsePhoneNumber(rawInput, defaultCountry);

    if (!phoneNumber) {
      return { raw: rawInput, isValid: false, isPossible: false };
    }

    return {
      raw: rawInput,
      isValid: phoneNumber.isValid(),
      isPossible: phoneNumber.isPossible(),
      country: phoneNumber.country,
      countryCallingCode: phoneNumber.countryCallingCode,
      e164: phoneNumber.format('E.164'),
      national: phoneNumber.formatNational(),
      international: phoneNumber.formatInternational(),
      uri: phoneNumber.getURI(),
      type: phoneNumber.getType()
    };
  } catch (error: any) {
    return {
      raw: rawInput,
      isValid: false,
      isPossible: false
    };
  }
}
```

---

## 4. Real-World Production Use Cases
1. **SMS & OTP Delivery Pipelines**: Sanitizing and normalizing user input on registration forms before dispatching one-time passwords (OTP) via Twilio, AWS SNS, or Vonage, reducing delivery failures caused by malformed numbers.
2. **CRM & Lead Ingestion**: Cleansing and deduplicating customer phone databases in Salesforce or HubSpot, preventing duplicate lead creation caused by differing punctuation conventions (e.g., `+1-415-555-0100` vs `(415) 555-0100`).
3. **HTML Click-to-Call Links**: Generating accessible and RFC 3966-compliant `tel:` links on customer support websites, enabling one-tap dialing on mobile smartphones.

---

## 5. Frequently Asked Questions (FAQs)

### Why is E.164 the required format for SMS APIs?
Telecommunication carriers use E.164 because it includes the unique international country calling code without national dialing prefixes (such as the UK leading `0` or US `1`). This ensures the number can be routed globally regardless of the originating gateway.

### What is the difference between "Is Possible" and "Is Valid"?
- **Is Possible**: Verifies that the phone number contains the correct number of digits according to national length rules (e.g., a US number must have 10 digits).
- **Is Valid**: Verifies both the length and that the area code / mobile network prefix is actively allocated by the national telecommunications regulator (e.g., FCC in the US, Ofcom in the UK).

### How does the tool handle national trunk prefixes (like leading 0)?
In many countries (such as the UK, Germany, and Australia), a national trunk prefix `0` is dialed domestically. When converted to international E.164, the trunk prefix is stripped (e.g., `07911 123456` becomes `+447911123456`). The parser automatically handles national trunk prefix removal.

### Can a phone number exceed 15 digits?
No. Under ITU-T E.164 §6.2, the maximum permissible length for any international phone number is 15 decimal digits. Any string exceeding 15 digits is invalid under global telecommunication routing standards.

---

## 6. Privacy & Security Notice
All parsing, regex tokenization, and formatting are executed 100% locally within your client browser. User phone numbers, lead lists, and contact data are never dispatched to external cloud servers or stored in any analytics database.
