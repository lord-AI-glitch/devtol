# IBAN Validator & Parser: ISO 13616 Standards, MOD-97 Checksums & SEPA Routing

## 1. Quick Overview & Core Advantages
The International Bank Account Number (IBAN) is an internationally agreed system of identifying bank accounts across national borders to facilitate cross-border financial transactions while minimizing data-transcription errors. Standardized under **ISO 13616** and registered by the Society for Worldwide Interbank Financial Telecommunication (SWIFT) under ISO 13616-2, the IBAN format enforces rigorous mathematical validation and structured national routing codes.

Our client-side **IBAN Validator & Parser Tool** allows developers, fintech engineers, and accountants to instantly validate and decompose any domestic or international IBAN into its constituent routing parts (Country Code, Check Digits, Bank Identifier, Branch Code, and Basic Bank Account Number).

### Core Advantages & Zero-Knowledge Architecture
- **100% Client-Side Cryptographic MOD-97 Verification**: Account numbers, routing codes, and personal financial identifiers never leave your browser memory. No bank account data is transmitted to external servers or logged in telemetry.
- **ISO 7064 MOD-97-10 Checksum Algorithm**: Validates integrity using standard arbitrary-precision polynomial modulo operations to prevent transcription errors.
- **National Registry Decomposition**: Automatically extracts Bank Identification Codes (BIC / SWIFT), clearing codes, sorting codes, and account numbers across SEPA and global countries (Germany DE, United Kingdom GB, France FR, Netherlands NL, etc.).

---

## 2. Step-by-Step Usage Guide

### Validating and Parsing an IBAN
1. **Input the IBAN**: Enter or paste the IBAN into the input field. Formatting spaces or lowercase characters are automatically sanitized.
2. **Checksum Verification**: The tool computes the ISO 7064 MOD 97-10 algorithm in real-time. If the computed remainder is equal to 1, the check digits are confirmed valid.
3. **Inspect the Parsed Segments**:
   - **Country Code**: 2-letter ISO 3166-1 alpha-2 code (e.g., `DE` for Germany, `GB` for the United Kingdom).
   - **Check Digits**: Two numeric digits (positions 3 and 4).
   - **Bank Identifier Code (BIC / BLZ / Sort Code)**: Bank routing key parsed per national rules.
   - **Branch / Clearing Code**: Branch code where applicable.
   - **BBAN (Basic Bank Account Number)**: Up to 30 alphanumeric characters specific to national banking architectures.
4. **Export Clean Formats**: Copy in either Electronic Format (continuous unspaced string) or Print Format (grouped into four-character blocks).

### Example: Decomposition Walkthrough
```
Input: DE89 3704 0044 0532 0130 00
- Country Code: DE (Germany)
- Check Digits: 89
- Bank Code (BLZ): 37040044 (Commerzbank)
- Account Number: 0532013000
- Status: VALID (ISO 7064 Mod 97 Remainder = 1)
```

---

## 3. Technical Deep-Dive: ISO 13616 & ISO 7064 MOD-97-10

### Structure of an IBAN (ISO 13616-1)
An IBAN consists of up to 34 alphanumeric characters structured into three mandatory components:
```
[ Country Code (2 letters) ] [ Check Digits (2 digits) ] [ BBAN (Up to 30 alphanumeric chars) ]
```

### The ISO 7064 Mod 97-10 Checksum Verification Algorithm
Because standard JavaScript numbers lose precision beyond 53 bits (9,007,199,254,740,991) and an expanded IBAN numeric string can reach 70+ digits, validation requires arbitrary-precision arithmetic or piecewise modular reduction:

1. **Check String Length**: Verify that the IBAN length matches the official SWIFT country registry specification (e.g., Norway = 15 chars, Germany = 22 chars, France = 27 chars, Malta = 31 chars).
2. **Rearrange Characters**: Move the first four characters (Country Code and Check Digits) to the end of the string:
   $$\text{IBAN}_{\text{rearranged}} = \text{BBAN} + \text{Country Code} + \text{Check Digits}$$
3. **Convert Letters to Digits**: Replace each letter with two digits, where $A = 10, B = 11, \dots, Z = 35$.
4. **Compute Modulo 97**: Calculate the remainder of the resulting large integer divided by 97.
   $$\text{Integer}(\text{Converted String}) \pmod{97} == 1$$

### High-Performance TypeScript Implementation
```typescript
export interface IbanParseResult {
  raw: string;
  isValid: boolean;
  countryCode: string;
  checkDigits: string;
  bban: string;
  error?: string;
}

const COUNTRY_LENGTHS: Record<string, number> = {
  DE: 22, GB: 22, FR: 27, NL: 18, ES: 24, IT: 27, CH: 21, BE: 16, AT: 20, PL: 28
};

export function validateAndParseIban(input: string): IbanParseResult {
  const sanitized = input.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

  if (sanitized.length < 5) {
    return { raw: sanitized, isValid: false, countryCode: '', checkDigits: '', bban: '', error: 'Length too short' };
  }

  const countryCode = sanitized.substring(0, 2);
  const checkDigits = sanitized.substring(2, 4);
  const bban = sanitized.substring(4);

  const expectedLength = COUNTRY_LENGTHS[countryCode];
  if (expectedLength && sanitized.length !== expectedLength) {
    return { raw: sanitized, isValid: false, countryCode, checkDigits, bban, error: `Invalid length for ${countryCode}. Expected ${expectedLength}, got ${sanitized.length}.` };
  }

  // Rearrange: BBAN + Country + Check
  const rearranged = bban + countryCode + checkDigits;

  // Convert letters to numbers: A -> 10, B -> 11, ..., Z -> 35
  let numericString = '';
  for (let i = 0; i < rearranged.length; i++) {
    const charCode = rearranged.charCodeAt(i);
    if (charCode >= 65 && charCode <= 90) {
      numericString += (charCode - 55).toString();
    } else {
      numericString += rearranged[i];
    }
  }

  // Piecewise Modulo 97 calculation (avoids BigInt performance overhead)
  let remainder = 0;
  for (let i = 0; i < numericString.length; i += 7) {
    const chunk = remainder.toString() + numericString.substring(i, i + 7);
    remainder = parseInt(chunk, 10) % 97;
  }

  const isValid = remainder === 1;

  return {
    raw: sanitized,
    isValid,
    countryCode,
    checkDigits,
    bban,
    error: isValid ? undefined : 'MOD-97 checksum validation failed'
  };
}
```

---

## 4. Real-World Production Use Cases
1. **Fintech Payment Gateways**: Validating customer bank accounts before dispatching SEPA Credit Transfers (SCT) or SEPA Direct Debit (SDD) mandates, drastically reducing failed bank processing fees.
2. **Payroll & ERP Onboarding**: Ingesting employee direct-deposit information in enterprise HR systems (SAP, Workday), verifying formatting and country-specific BBAN routing rules prior to payroll execution.
3. **E-Commerce Checkout Validation**: Preventing customer checkout errors on billing forms by dynamically formatting IBAN inputs into 4-character visual blocks and giving instant feedback on invalid check digits.

---

## 5. Frequently Asked Questions (FAQs)

### What does it mean if an IBAN passes MOD-97 validation?
Passing the MOD-97 algorithm proves that the string conforms to ISO 13616 structural rules and contains zero typographical errors. However, it does not guarantee that the bank account is active or currently open with funds at the destination bank; live bank account existence requires an authorized banking API inquiry.

### Why do different countries have different IBAN lengths?
ISO 13616 specifies a maximum IBAN length of 34 characters, but leaves the internal BBAN structure to national central banks. For instance, Norway uses 15 characters because their national account numbers are short, while Malta uses 31 characters to encode national clearing codes, branch identifiers, and extended account sequences.

### How does the IBAN prevent wire fraud and typographical mistakes?
The two check digits calculated via ISO 7064 Mod 97-10 catch 99.9% of accidental keying errors, including single-character substitutions, double-character transpositions, omissions, and insertions before payment instructions enter clearing networks.

### Can an IBAN be used to withdraw funds from my account without authorization?
An IBAN is a financial routing identifier, not a secret key or password. While it is necessary for SEPA Direct Debits, unauthorized debits can be disputed and refunded under European banking legislation (PSD2) within 8 weeks unconditionally, or within 13 months for unauthorized debits.

---

## 6. Privacy & Security Notice
All parsing, checksum verification, and BBAN slicing operations execute entirely within your client browser. No financial data, account numbers, or bank identifiers are sent to remote servers or stored in any database.
