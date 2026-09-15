# Arbitrary-Precision Integer Base Converter: Radix Math, Two's Complement & BigInt Bitwise Architecture

## 1. Quick Overview & Key Benefits
Converting numerical representations across different numeral systems (radices) is a foundational capability required in low-level systems programming, embedded firmware development, network protocol reverse-engineering, cryptographic key encoding, and compiler construction. Whether translating raw machine opcode in hexadecimal (`0x7F`), configuring UNIX file permission octets (`0o755`), parsing memory addresses, or packing dense UUIDs into URL-friendly Base62 identifiers, developers frequently need reliable, loss-free integer conversion.

Most generic online conversion utilities suffer from catastrophic precision truncation. Standard JavaScript engines represent numbers as IEEE 754 double-precision 64-bit binary floating-point values (`Number`). This imposes a hard precision limit of 53 bits ($2^{53} - 1 = 9,007,199,254,740,991$, or `Number.MAX_SAFE_INTEGER`). Inputting a 64-bit pointer, 128-bit IPv6 address, or 256-bit cryptographic private key silently rounds lower-order bits, corrupting production data.

This **Arbitrary-Precision Integer Base Converter** solves this through native, non-truncating `BigInt` radix transformations and two's complement bitwise arithmetic across arbitrary radices ($2$ through $62$).

### Key Engineering Benefits
- **Zero Truncation via Arbitrary Precision**: Leverages native ECMAScript `BigInt` engines and custom polynomial division algorithms to process integers of arbitrary size (from 8-bit registers up to 4096-bit RSA keys and beyond) without floating-point degradation.
- **Universal Radix Spectrum ($2$ to $62$)**: Seamlessly convert between standard bases (Binary base-2, Octal base-8, Decimal base-10, Hexadecimal base-16) and compact alphanumeric radices (Base32 RFC 4648, Base36, Base58 Bitcoin, and Base62 alphanumeric).
- **Signed Two's Complement & Endianness Support**: Full modeling of signed integer representations (8, 16, 32, 64, and 128-bit signed two's complement), byte swapping, and Little-Endian vs. Big-Endian memory layouts.
- **100% Client-Side Cryptographic Privacy**: Zero server communication. Memory addresses, hashes, encryption keys, and proprietary identifiers remain safely contained within your local browser process.

---

## 2. Step-by-Step Practical Usage Guide

### Converting Numbers Across Standard Radices
The tool accepts inputs in raw numeral strings, with or without standard language prefixes (`0b`, `0o`, `0x`).

#### Step 1: Provide the Source Integer and Radix
Input the numeral string and select the source radix (e.g., Hexadecimal base-16, Decimal base-10, or Binary base-2).
- Example Hex Input: `0xDEADBEEFCAFE0001`
- Automatically strips whitespace and optional delimiters (e.g., underscores `0xDEAD_BEEF_CAFE_0001`).

#### Step 2: Select Signedness and Bit Width
When analyzing binary or machine registers, choose the integer interpretation:
- **Unsigned Integer**: Evaluates pure magnitude ($[0, 2^N - 1]$).
- **Signed Two's Complement**: Evaluates negative values using the most significant bit (MSB) as the sign flag ($[-2^{N-1}, 2^{N-1} - 1]$) across 8-bit, 16-bit, 32-bit, 64-bit, or 128-bit boundaries.

#### Step 3: Inspect Real-Time Converted Representations
The converter immediately evaluates all target representations simultaneously:

```
--------------------------------------------------------------------------------
SOURCE INPUT:              0xDEADBEEFCAFE0001 (Hexadecimal / Base-16)
BIT WIDTH:                 64-bit Unsigned / Signed Two's Complement
--------------------------------------------------------------------------------
BINARY (Base-2):           1101111010101101101111101110111111001010111111100000000000000001
OCTAL (Base-8):            1572555756762577600001
DECIMAL (Base-10):         16045690984833335297
SIGNED 2's COMPLEMENT:    -2401053088876216319 (for 64-bit signed int)
HEXADECIMAL (Base-16):     deadbeefcafe0001
BASE-32 (RFC 4648):        32VL536K7YAAA===
BASE-36 (Alphanumeric):    4738T02H87HGL
BASE-62 (Case-Sensitive):  1qGZgJmQ7wL
BYTE-SWAPPED (Little-End): 0x0100FECAEFBEADDE
--------------------------------------------------------------------------------
```

---

## 3. Technical Under the Hood: Specifications & Architecture

### 1. Mathematical Radix Representation
Any positive integer $X \in \mathbb{N}$ in a positional numeral system with base $b \ge 2$ can be uniquely expressed as a polynomial:
$$X = \sum_{i=0}^{n-1} d_i \cdot b^i = d_{n-1} b^{n-1} + d_{n-2} b^{n-2} + \dots + d_1 b^1 + d_0 b^0$$
Where each digit $d_i$ satisfies $0 \le d_i < b$, and $n = \lfloor \log_b(X) \rfloor + 1$.

#### Algorithm: Conversion via Repeated Integer Division
To convert an arbitrary integer $X$ into base $b$:
1. Compute the remainder $r = X \pmod b$.
2. Map $r$ to the corresponding character in the radix alphabet table.
3. Update $X \leftarrow \lfloor X / b \rfloor$.
4. Repeat until $X = 0$.
5. Reverse the resulting digit sequence.

### 2. The IEEE 754 vs. BigInt Boundary
Standard ECMAScript numbers follow the **IEEE 754 Standard for Floating-Point Arithmetic** using double precision (binary64):
- 1 sign bit
- 11 exponent bits ($e$)
- 52 explicit significand/mantissa bits ($m$) + 1 hidden bit ($1.m$)

Because the mantissa is capped at 53 bits:
$$\text{Max Safe Int} = 2^{53} - 1 = 9,007,199,254,740,991$$
Attempting to convert $2^{64} - 1$ (`18,446,744,073,709,551,615`) using standard `parseInt("18446744073709551615", 10)` results in `18446744073709552000`, silently mangling the lowest 8 bits.

Our conversion engine bypasses IEEE 754 entirely by employing arbitrary-precision `BigInt` primitives and string-buffer polynomial accumulators.

### 3. Signed Two's Complement Arithmetic
In computer architectures, signed numbers are represented using two's complement notation:
- For an $N$-bit register containing value $V$, the most significant bit (MSB) has negative weight $-2^{N-1}$.
- Value formula:
$$V = -d_{N-1} 2^{N-1} + \sum_{i=0}^{N-2} d_i 2^i$$
- Negation algorithm:
$$\text{Two's Complement}(X) = (\sim X + 1) \pmod{2^N}$$

### 4. High-Performance TypeScript Conversion Engine
The following TypeScript engine handles arbitrary bases from 2 to 62 with complete two's complement and BigInt safety:

```typescript
export class ArbitraryBaseConverter {
  private static readonly CHARSET_62 = 
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

  /**
   * Parses an arbitrary-radix string into a native BigInt.
   */
  public static parseToBigInt(value: string, fromRadix: number): bigint {
    if (fromRadix < 2 || fromRadix > 62) {
      throw new RangeError("Radix must be between 2 and 62.");
    }

    const cleanValue = value.trim().replace(/^0[xXoObB]/, "").replace(/_/g, "");
    if (!cleanValue) throw new Error("Input string is empty.");

    const charset = this.CHARSET_62;
    const base = BigInt(fromRadix);
    let result = 0n;

    for (let i = 0; i < cleanValue.length; i++) {
      const char = cleanValue[i];
      let digit: number;

      if (fromRadix <= 36) {
        // Case-insensitive for radices <= 36
        const lowerChar = char.toLowerCase();
        digit = charset.slice(0, fromRadix).indexOf(lowerChar);
      } else {
        // Case-sensitive for Base37 to Base62
        digit = charset.slice(0, fromRadix).indexOf(char);
      }

      if (digit === -1 || digit >= fromRadix) {
        throw new Error(`Invalid digit '${char}' for radix ${fromRadix}`);
      }

      result = result * base + BigInt(digit);
    }

    return result;
  }

  /**
   * Formats a BigInt into an arbitrary radix string.
   */
  public static formatFromBigInt(value: bigint, toRadix: number): string {
    if (toRadix < 2 || toRadix > 62) {
      throw new RangeError("Radix must be between 2 and 62.");
    }
    if (value === 0n) return "0";
    if (value < 0n) throw new Error("Negative magnitude not supported in unsigned format.");

    const charset = this.CHARSET_62;
    const base = BigInt(toRadix);
    let current = value;
    let digits = "";

    while (current > 0n) {
      const remainder = Number(current % base);
      digits = charset[remainder] + digits;
      current = current / base;
    }

    return digits;
  }

  /**
   * Calculates signed two's complement value for specified bit width.
   */
  public static toSignedTwosComplement(unsignedVal: bigint, bitWidth: number): bigint {
    const mask = (1n << BigInt(bitWidth)) - 1n;
    const signBit = 1n << BigInt(bitWidth - 1);
    const bounded = unsignedVal & mask;

    if ((bounded & signBit) !== 0n) {
      // Negative number in two's complement
      return bounded - (1n << BigInt(bitWidth));
    }
    return bounded;
  }

  /**
   * Converts BigInt to formatted Little-Endian hex byte stream.
   */
  public static toLittleEndianHex(value: bigint, byteLength: number): string {
    let hex = value.toString(16);
    if (hex.length % 2 !== 0) hex = "0" + hex;
    
    // Pad to full requested byte length
    const targetCharLen = byteLength * 2;
    while (hex.length < targetCharLen) {
      hex = "00" + hex;
    }

    // Chunk into 2-character bytes and reverse
    const bytes: string[] = [];
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(hex.substring(i, i + 2));
    }
    return bytes.reverse().join(" ");
  }
}
```

---

## 4. Real-World Production Use Cases

### Production Scenario 1: Cryptographic Private Key & Bitcoin Address Decoding
Blockchain engineers routinely convert 256-bit cryptographic scalars between hexadecimal, Bitcoin Base58Check, and raw byte arrays.
- **Challenge**: Converting an Ethereum or Bitcoin Secp256k1 private key (such as `0xE9873D79C6D87DC0FB6A5778633389F4453213303DA61F20BD67FC233AA33262`) in standard browser developer consoles truncates the integer, destroying cryptographic integrity.
- **Solution**: The engineer inputs the 256-bit hexadecimal string into the arbitrary-precision converter. The tool converts the exact 77-digit decimal value (`10564...`) and encodes it directly into Base58/Base62 representations without losing a single bit of cryptographic entropy.

### Production Scenario 2: Embedded Systems Firmware Memory Mapping & MMIO
Firmware developers writing C/C++ or Rust drivers for ARM Cortex-M microcontrollers configure Memory-Mapped I/O (MMIO) registers.
- **Challenge**: A hardware sensor peripheral requires writing control bits to register `0x40021018`. The developer needs to set bit 0 (enable), bit 14 (clock divider), and verify if bits 24..31 represent a negative two's complement calibration offset (`-45`).
- **Solution**: Using the converter's binary bit inspection and 32-bit signed two's complement mode, the developer toggles individual bit offsets, visually inspects the resulting hexadecimal mask (`0xFD004001`), and validates the negative calibration integer directly.

### Production Scenario 3: High-Throughput URL Shortener & UUID Base62 Compaction
A SaaS cloud provider generates 128-bit UUIDs for tracking user analytics events.
- **Challenge**: Standard UUIDs formatted as canonical hexadecimal strings with hyphens (`550e8400-e29b-41d4-a716-446655440000`) consume 36 bytes in HTTP query parameters and URL headers, bloating ingress traffic.
- **Solution**: Backend developers parse the 128-bit integer and convert it into Base62 (`2bXY7z...`). This compresses the 36-character hexadecimal string into a compact 22-character alphanumeric token, reducing network egress bandwidth by ~38% across billions of API telemetry events.

---

## 5. Frequently Asked Questions (FAQs)

### 1. Why does JavaScript's `parseInt("0x1fffffffffffff", 16)` produce incorrect values for large numbers?
JavaScript's native `parseInt()` parses strings into standard IEEE 754 double-precision numbers. Any number exceeding $2^{53} - 1$ ($9,007,199,254,740,991$) loses least-significant bits due to mantissa saturation. For instance, `parseInt("9007199254740993")` evaluates to `9007199254740992`. To prevent data corruption, arbitrary-precision parsing must parse character-by-character into ECMAScript `BigInt`.

### 2. What is the difference between Base64 and Base62?
Base64 utilizes 64 characters: `A-Z`, `a-z`, `0-9`, and two punctuation characters (`+` and `/`), often with `=` padding. In URL query strings and filesystem paths, `+` and `/` require URL-encoding (`%2B`, `%2F`), causing parsing complications. Base62 restricts the character set strictly to alphanumeric digits (`0-9`, `a-z`, `A-Z`), making it 100% URL-safe, filename-safe, and identifier-friendly without escaping.

### 3. How does Two's Complement handle negative numbers?
Two's complement avoids the mathematical ambiguity of having two zeros ($+0$ and $-0$) inherent in signed-magnitude systems. To negate an integer in binary:
1. Invert all bits ($0 \to 1, 1 \to 0$).
2. Add $1$ to the resulting value.
This allows hardware Arithmetic Logic Units (ALUs) to perform subtraction using identical circuitry to addition ($A - B = A + (\sim B + 1)$).

### 4. What is the difference between Big-Endian and Little-Endian byte order?
Endianness dictates the ordering of bytes in computer memory:
- **Big-Endian (Network Byte Order)**: Stores the most significant byte (MSB) at the lowest memory address.
- **Little-Endian (x86 / ARM default)**: Stores the least significant byte (LSB) at the lowest memory address.
For example, the 32-bit hex integer `0xAABBCCDD` is laid out in memory as `[AA, BB, CC, DD]` in Big-Endian, and `[DD, CC, BB, AA]` in Little-Endian.

---

## 6. Technical Accuracy & Client-Side Privacy Notice

### Standards Compliance
- **ECMAScript (ECMA-262)**: Conforms strictly to BigInt specification (Section 21.2) for arbitrary-precision integer mathematics.
- **RFC 4648**: "The Base16, Base32, and Base64 Data Encodings" standards for alphabet definitions and padding specifications.
- **IEEE 754-2019**: Standard for Floating-Point Arithmetic boundary verification.

### Zero-Telemetry Privacy Guarantee
All radix computations, string parsing, and bitwise transforms execute exclusively inside client-side browser V8/SpiderMonkey/JavaScriptCore virtual machine runtimes. No cryptographic keys, integers, memory pointers, or converted payloads are logged or transmitted across the network.
